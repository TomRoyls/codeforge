import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMathFroundSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-math-fround-spread.js'
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

function makeMathFroundSpreadNode(
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
      property: { type: 'Identifier', name: 'fround' },
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

describe('no-unnecessary-math-fround-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMathFroundSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryMathFroundSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryMathFroundSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMathFroundSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryMathFroundSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning fround', () => {
      const desc = noUnnecessaryMathFroundSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/fround/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryMathFroundSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-math-fround-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMathFroundSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryMathFroundSpreadRule).toBeDefined()
      expect(noUnnecessaryMathFroundSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryMathFroundSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary Math.fround spread', () => {
    test('reports Math.fround(...items) with spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode())
      expect(reports.length).toBe(1)
    })

    test('reports Math.fround(...arr) with identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.fround(...[1, 2, 3]) with array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode({ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] } }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.fround(...obj.values) with member expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode({ type: 'SpreadElement', argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'values' } } }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.fround(...getValue()) with call expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode({ type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] } }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions fround', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode())
      expect(reports[0].message).toMatch(/fround/)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode())
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode())
      expect(reports[0].message).toBe(
        'Math.fround(...items) with spread is unusual. fround() expects a single number.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      const node = makeMathFroundSpreadNode()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }, 5, 10, 5, 35))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode())
      visitor.CallExpression(makeMathFroundSpreadNode())
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode())
      visitor.CallExpression(makeMathFroundSpreadNode({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports with spread of a function call argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode({ type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'Math' }, property: { type: 'Identifier', name: 'abs' } }, arguments: [{ type: 'Identifier', name: 'x' }] } }))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode({ type: 'SpreadElement', argument: { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }, alternate: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 2 }] } } }))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode({ type: 'SpreadElement', argument: { type: 'TemplateLiteral', quasis: [], expressions: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode({ type: 'SpreadElement', argument: { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } } }))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode({ type: 'SpreadElement', argument: { type: 'ObjectExpression', properties: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode({ type: 'SpreadElement', argument: { type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } } }))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode({ type: 'SpreadElement', argument: { type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Identifier', name: 'x' } } }))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of yield expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode({ type: 'SpreadElement', argument: { type: 'YieldExpression', argument: null, delegate: false } }))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of sequence expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode({ type: 'SpreadElement', argument: { type: 'SequenceExpression', expressions: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] } }))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode({ type: 'SpreadElement', argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Float32Array' }, arguments: [{ type: 'Literal', value: 3 }] } }))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of tagged template', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode({ type: 'SpreadElement', argument: { type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } } }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Math.fround(1) — no spread, literal arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'fround', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.fround(x) — no spread, identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'fround', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.fround() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'fround'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.fround(...a, ...b) — two spread args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'fround', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } }, { type: 'SpreadElement', argument: { type: 'Identifier', name: 'b' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.fround(1, 2) — two regular args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'fround', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'abs', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.max(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'max', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.min(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'min', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'round', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for myObj.fround(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'myObj' }, 'fround', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.fround(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'console' }, 'fround', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.method(...items) — non-Math object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'obj' }, 'method', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is MemberExpression, not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'ns' }, property: { type: 'Identifier', name: 'Math' } }, 'fround', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getMath' }, arguments: [] }, 'fround', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'fround' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'fround' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'fround' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'fround' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
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

    test('does not report when callee property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
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

    test('does not report when property name is "Fround" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'Fround', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "math" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'math' }, 'fround', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "MATH" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'MATH' }, 'fround', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'fround', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments has three items', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'fround', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } }, { type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for fround(...items) — standalone function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fround' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
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
      const visitor1 = noUnnecessaryMathFroundSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryMathFroundSpreadRule.create(ctx2)
      visitor1.CallExpression(makeMathFroundSpreadNode())
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'fround', [{ type: 'Literal', value: 1 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode())
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'fround', [{ type: 'Literal', value: 1 }]))
      visitor.CallExpression(makeMathFroundSpreadNode())
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'fround' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'fround' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'fround', [{ type: 'Literal', value: 1 }]))
      visitor.CallExpression(makeMathFroundSpreadNode())
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'abs', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      visitor.CallExpression(makeMathFroundSpreadNode())
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'myObj' }, 'fround', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryMathFroundSpreadRule.create(context)
      const visitor2 = noUnnecessaryMathFroundSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryMathFroundSpreadRule.meta
      const meta2 = noUnnecessaryMathFroundSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'fround' },
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
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'fround' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'fround' },
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
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      const node = makeMathFroundSpreadNode()
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryMathFroundSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryMathFroundSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryMathFroundSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'fround' },
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
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }, 10, 4, 10, 30))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('handles computed false member expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'fround' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'fround' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeMathFroundSpreadNode())
      visitor.CallExpression(makeMathFroundSpreadNode({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles arguments where first arg has no type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathFroundSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'fround', [{ name: 'items' }]))
      expect(reports.length).toBe(0)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMathRoundSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-math-round-spread.js'
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

function makeMathRoundSpreadNode(
  spreadArg: unknown,
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
      property: { type: 'Identifier', name: 'round' },
      computed: false,
    },
    arguments: [{ type: 'SpreadElement', argument: spreadArg }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeMathCallNode(
  objectName: string,
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 25,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: methodName },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-math-round-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMathRoundSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryMathRoundSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryMathRoundSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMathRoundSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryMathRoundSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Math.round and spread', () => {
      const desc = noUnnecessaryMathRoundSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/math\.round/)
      expect(desc).toMatch(/spread/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryMathRoundSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-math-round-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMathRoundSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryMathRoundSpreadRule).toBeDefined()
      expect(noUnnecessaryMathRoundSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryMathRoundSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Math.round with spread', () => {
    test('reports for Math.round(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'Identifier', name: 'items' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.round(...[1, 2, 3])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.round(...arr) with Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'Identifier', name: 'arr' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.round(...getValues()) with CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValues' }, arguments: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.round(...obj.prop) with MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Math.round and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'Identifier', name: 'items' }))
      expect(reports[0].message).toMatch(/Math\.round/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'Identifier', name: 'items' }))
      expect(reports[0].message).toBe(
        'Math.round(...items) with spread is unusual. round() expects a single number.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'Identifier', name: 'items' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'Identifier', name: 'items' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      const node = makeMathRoundSpreadNode({ type: 'Identifier', name: 'items' })
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'Identifier', name: 'items' }, 5, 10, 5, 35))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'Identifier', name: 'b' }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for SpreadElement with BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with LogicalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with AssignmentExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 } }))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with SequenceExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] }))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with AwaitExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'AwaitExpression', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] } }))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'Identifier', name: 'items' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for SpreadElement with UnaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 1 } }))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with NewExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement with UpdateExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'x' } }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Math.round(x) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'round', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(1, 2) — two args no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'round', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'round', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'ceil', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'floor', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'abs', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.max(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'max', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.min(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'min', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.round(...items) — wrong object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('obj', 'round', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for round(...items) — not member expression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'round' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getMath' }, arguments: [] },
          property: { type: 'Identifier', name: 'round' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is not "Math"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('MyMath', 'round', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'round' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is not "round"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'Round', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when there are 0 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'round', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when there are 2 arguments including a SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'round', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }, { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when there are 3 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'round', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'round' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'ns' }, property: { type: 'Identifier', name: 'Math' } },
          property: { type: 'Identifier', name: 'round' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'round', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'round', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'round', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'round', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'val' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is an ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'round', [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is an ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'round', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "math" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('math', 'round', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "rounds" (different name)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'rounds', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryMathRoundSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryMathRoundSpreadRule.create(ctx2)
      visitor1.CallExpression(makeMathRoundSpreadNode({ type: 'Identifier', name: 'items' }))
      visitor2.CallExpression(makeMathCallNode('Math', 'round', [{ type: 'Identifier', name: 'x' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeMathCallNode('Math', 'round', [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'round' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'round' },
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
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'round', [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(makeMathCallNode('obj', 'round', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'Identifier', name: 'more' }))
      visitor.CallExpression(makeMathCallNode('Math', 'ceil', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryMathRoundSpreadRule.create(context)
      const visitor2 = noUnnecessaryMathRoundSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryMathRoundSpreadRule.meta
      const meta2 = noUnnecessaryMathRoundSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'round' },
          computed: false,
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
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'round' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'round' },
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
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      const node = makeMathRoundSpreadNode({ type: 'Identifier', name: 'items' })
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryMathRoundSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryMathRoundSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryMathRoundSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'round' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'Identifier', name: 'items' }, 10, 4, 10, 30))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('handles non-computed member expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'round' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'round' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'Identifier', name: 'items1' }))
      visitor.CallExpression(makeMathRoundSpreadNode({ type: 'Identifier', name: 'items2' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report with 2 arguments both SpreadElements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'round', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } }, { type: 'SpreadElement', argument: { type: 'Identifier', name: 'b' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'round' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRoundSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: null,
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })
  })
})

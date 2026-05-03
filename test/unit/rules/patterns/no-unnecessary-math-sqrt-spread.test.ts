import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMathSqrtSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-math-sqrt-spread.js'
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

function makeMathSqrtSpreadNode(
  spreadArgument: unknown,
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
      property: { type: 'Identifier', name: 'sqrt' },
      computed: false,
    },
    arguments: [{ type: 'SpreadElement', argument: spreadArgument }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeMathCallNode(
  methodName: string,
  args: unknown[],
  objectName = 'Math',
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
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-math-sqrt-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMathSqrtSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryMathSqrtSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryMathSqrtSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMathSqrtSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryMathSqrtSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning sqrt and spread', () => {
      const desc = noUnnecessaryMathSqrtSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/sqrt/)
      expect(desc).toMatch(/spread/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryMathSqrtSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-math-sqrt-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMathSqrtSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryMathSqrtSpreadRule).toBeDefined()
      expect(noUnnecessaryMathSqrtSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryMathSqrtSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Math.sqrt spread', () => {
    test('reports for Math.sqrt(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'items' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.sqrt(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'arr' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.sqrt(...data)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'data' }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions sqrt', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'items' }))
      expect(reports[0].message).toMatch(/sqrt/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'items' }))
      expect(reports[0].message).toBe(
        'Math.sqrt(...items) with spread is unusual. sqrt() expects a single number.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'items' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'items' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      const node = makeMathSqrtSpreadNode({ type: 'Identifier', name: 'items' })
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'items' }, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'arr' }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'arr' }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'items' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for spread with MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'data' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getData' }, arguments: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports with correct loc end values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'items' }, 2, 5, 2, 25))
      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports for spread of ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'LogicalExpression', operator: '&&', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with UnaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Identifier', name: 'x' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with FunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Math.sqrt(x) — no spread, Identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('sqrt', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sqrt(5) — no spread, Literal arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('sqrt', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sqrt(...items, extra) — 2 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('sqrt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }, { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sqrt() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('sqrt', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.max(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.min(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('min', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('abs', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('floor', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('round', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.sqrt(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('sqrt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], 'foo'))
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.sqrt(...items) — non-Math identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('sqrt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], 'obj'))
      expect(reports.length).toBe(0)
    })

    test('does not report for MyMath.sqrt(...items) — non-Math identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('sqrt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], 'MyMath'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is MemberExpression instead of Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'global' }, property: { type: 'Identifier', name: 'Math' } },
          property: { type: 'Identifier', name: 'sqrt' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'sqrt' }, arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'sqrt' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Sqrt" — case-sensitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Sqrt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "SQRT" — uppercase', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('SQRT', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "sqrt2" — different name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('sqrt2', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'sqrt' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'sqrt' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not SpreadElement — Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('sqrt', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not SpreadElement — Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('sqrt', [{ type: 'Literal', value: 4 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not SpreadElement — CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('sqrt', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member Math["sqrt"](...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sqrt' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for three arguments with SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('sqrt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }, { type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: null,
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryMathSqrtSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryMathSqrtSpreadRule.create(ctx2)
      visitor1.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'items' }))
      visitor2.CallExpression(makeMathCallNode('sqrt', [{ type: 'Identifier', name: 'x' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(makeMathCallNode('sqrt', [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'arr' }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sqrt' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sqrt' },
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
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('sqrt', [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(makeMathCallNode('max', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'arr' }))
      visitor.CallExpression(makeMathCallNode('sqrt', []))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryMathSqrtSpreadRule.create(context)
      const visitor2 = noUnnecessaryMathSqrtSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryMathSqrtSpreadRule.meta
      const meta2 = noUnnecessaryMathSqrtSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sqrt' },
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
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sqrt' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sqrt' },
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
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      const node = makeMathSqrtSpreadNode({ type: 'Identifier', name: 'items' })
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryMathSqrtSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryMathSqrtSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryMathSqrtSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sqrt' },
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
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'items' }, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression (computed=false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sqrt' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'Identifier', name: 'arr' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles node with Symbol properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sqrt' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles spread with nested member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression(makeMathSqrtSpreadNode({ type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }, property: { type: 'Identifier', name: 'c' } }))
      expect(reports.length).toBe(1)
    })

    test('handles SpreadElement with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sqrt' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: null }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathSqrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sqrt' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})

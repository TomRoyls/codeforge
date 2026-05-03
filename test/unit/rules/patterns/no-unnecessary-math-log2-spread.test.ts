import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMathLog2SpreadRule } from '../../../../src/rules/patterns/no-unnecessary-math-log2-spread.js'
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

function makeMathCallNode(
  objectName: string,
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
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: methodName },
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

describe('no-unnecessary-math-log2-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMathLog2SpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryMathLog2SpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryMathLog2SpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMathLog2SpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryMathLog2SpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning log2', () => {
      const desc = noUnnecessaryMathLog2SpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/log2/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryMathLog2SpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-math-log2-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMathLog2SpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryMathLog2SpreadRule).toBeDefined()
      expect(noUnnecessaryMathLog2SpreadRule.meta).toBeDefined()
      expect(noUnnecessaryMathLog2SpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary Math.log2 spread', () => {
    test('reports for Math.log2(...items) with Identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.log2(...arr) with different identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.log2(...[1, 2, 3]) with ArrayExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.log2(...obj.values) with MemberExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'values' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.log2(...fn()) with CallExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.log2(...new Set()) with NewExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.log2(...(a ? b : c)) with ConditionalExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'a' }, consequent: { type: 'Identifier', name: 'b' }, alternate: { type: 'Identifier', name: 'c' } })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Math.log2', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/Math\.log2/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'Math.log2(...items) with spread is unusual. log2() expects a single number.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      const node = makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for Math.log2(...x) with ArrowFunctionExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.log2(...x) with BinaryExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.log2(...x) with UnaryExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.log2(...x) with TemplateLiteral spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.log2(...x) with ObjectExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.log2(...x) with FunctionExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.log2(...x) with AwaitExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'AwaitExpression', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'promise' }, arguments: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.log2(...x) with YieldExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'YieldExpression', argument: { type: 'Identifier', name: 'value' } })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Math.log2(...x) with SequenceExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'SequenceExpression', expressions: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Math.log2(x) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.log2(42) — literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.log2() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.log2(x, y) — 2 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.log2(x, y, z) — 3 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }, { type: 'Identifier', name: 'z' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.log1p(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log1p', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.log(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sqrt(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'sqrt', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'abs', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'floor', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'ceil', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.pow(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'pow', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for console.log2(...items) — wrong object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('console', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.log2(...items) — wrong object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('obj', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.log2(...items) — wrong object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('foo', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for myMath.log2(...items) — wrong object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('myMath', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for log2(...items) — Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'log2' },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'log2' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "LOG2E"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'LOG2E', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getMath' }, arguments: [] },
          property: { type: 'Identifier', name: 'log2' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'global' }, property: { type: 'Identifier', name: 'Math' } },
          property: { type: 'Identifier', name: 'log2' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'log2' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'log2' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Identifier', name: 'log2' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ObjectExpression', properties: [] },
          property: { type: 'Identifier', name: 'log2' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ArrayExpression', elements: [] },
          property: { type: 'Identifier', name: 'log2' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
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

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
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
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryMathLog2SpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryMathLog2SpreadRule.create(ctx2)
      visitor1.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeMathCallNode('Math', 'log2', [{ type: 'Identifier', name: 'x' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'log2' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'log2' },
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
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMathCallNode('Math', 'log1p', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      visitor.CallExpression(makeMathCallNode('console', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryMathLog2SpreadRule.create(context)
      const visitor2 = noUnnecessaryMathLog2SpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryMathLog2SpreadRule.meta
      const meta2 = noUnnecessaryMathLog2SpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'log2' },
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
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'log2' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'log2' },
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
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      const node = makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryMathLog2SpreadRule).toBeDefined()
      expect(typeof noUnnecessaryMathLog2SpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryMathLog2SpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'log2' },
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
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles non-computed member expression (computed: false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'log2' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'log2' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report for Math.log2 with SpreadElement among multiple args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [makeSpreadArg({ type: 'Identifier', name: 'items' }), { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is missing (undefined arguments array element)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'log2', [undefined]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.LOG2E — property, not method call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathLog2SpreadRule.create(context)
      visitor.CallExpression(makeMathCallNode('Math', 'LOG2E', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })
  })
})

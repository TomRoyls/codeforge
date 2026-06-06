import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayFlatSingleLevel } from '../../../../src/rules/patterns/no-unnecessary-array-flat-single-level.js'
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
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function numLit(value: number): { type: 'Literal'; value: number } {
  return { type: 'Literal', value }
}

function makeArrayExpr(elements: unknown[]): unknown {
  return { type: 'ArrayExpression', elements }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-flat-single-level rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayFlatSingleLevel.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayFlatSingleLevel.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayFlatSingleLevel.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayFlatSingleLevel.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayFlatSingleLevel.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning flat', () => {
      const desc = noUnnecessaryArrayFlatSingleLevel.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/flat/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayFlatSingleLevel.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-flat-single-level.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayFlatSingleLevel.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayFlatSingleLevel).toBeDefined()
      expect(noUnnecessaryArrayFlatSingleLevel.meta).toBeDefined()
      expect(noUnnecessaryArrayFlatSingleLevel.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary flat(1)', () => {
    test('reports for arr.flat(1) with Identifier receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for [].flat(1) with empty ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'flat', [numLit(1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for [1, [2]].flat(1) with nested array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, makeArrayExpr([{ type: 'Literal', value: 2 }])]), 'flat', [numLit(1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for [1].flat(1) with single-element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'flat', [numLit(1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for getArr().flat(1) with CallExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'flat', [numLit(1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.arr.flat(1) with MemberExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'flat', [numLit(1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for (a || b).flat(1) with LogicalExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'flat', [numLit(1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Arr().flat(1) with NewExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Arr' }, arguments: [] }, 'flat', [numLit(1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } }, 'flat', [numLit(1)]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions flat', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(1)]))
      expect(reports[0].message).toMatch(/flat/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(1)]))
      expect(reports[0].message).toBe(
        'Array.prototype.flat(1) is unnecessary. flat() without arguments defaults to depth 1.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(1)]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(1)]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(1)])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(1)], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(1)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'flat', [numLit(1)]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(1)]))
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'flat', [numLit(1)]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for ObjectExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'flat', [numLit(1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for FunctionExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'flat', [numLit(1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for Literal string receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'flat', [numLit(1)]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(1)]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for ArrowFunctionExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'flat', [numLit(1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for TemplateLiteral receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'flat', [numLit(1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for UnaryExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }, 'flat', [numLit(1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for AssignmentExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'flat', [numLit(1)]))
      expect(reports.length).toBe(1)
    })

    test('reports with large line and column numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(1)], 999, 50, 999, 70))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('reports for ArrayExpression with SpreadElement receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'other' } }]), 'flat', [numLit(1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for AwaitExpression receiver', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } }, 'flat', [numLit(1)]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.flat() with no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(2) — different depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(2)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(0) — depth 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(-1) — negative depth', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(-1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(3) — depth 3', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(3)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(10) — depth 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(10)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(Infinity) — Identifier not NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(x) — variable argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(NaN) — Identifier not NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flatMap(x => x) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flatMap', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'Identifier', name: 'x' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(1, 2) — too many args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(1), numLit(2)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat("1") — string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [{ type: 'Literal', value: '1' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(true) — boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [{ type: 'BooleanLiteral', value: true }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(null) — null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [{ type: 'NullLiteral' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(undefined) — identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat({}) — object expression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat([]) — array expression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [numLit(1)], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'flat' },
        },
        arguments: [numLit(1)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "flatMap"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flatMap', [numLit(1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "flatten"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flatten', [numLit(1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
          computed: true,
        },
        arguments: [numLit(1)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(0.5) — not exactly 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(0.5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat with Literal arg of non-numeric value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [{ type: 'Literal', value: 'depth' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "map"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [numLit(1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "filter"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [numLit(1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "reduce"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduce', [numLit(1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat with MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'depth' } }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayFlatSingleLevel.create(ctx1)
      const visitor2 = noUnnecessaryArrayFlatSingleLevel.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(1)]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(1)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'flat', [numLit(1)]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [numLit(1)],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [numLit(1)],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(1)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(2)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'flat', [numLit(1)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(0)]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayFlatSingleLevel.create(context)
      const visitor2 = noUnnecessaryArrayFlatSingleLevel.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayFlatSingleLevel.meta
      const meta2 = noUnnecessaryArrayFlatSingleLevel.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [numLit(1)],
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
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [numLit(1)],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [numLit(1)],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(1)])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayFlatSingleLevel).toBeDefined()
      expect(typeof noUnnecessaryArrayFlatSingleLevel.create).toBe('function')
      expect(typeof noUnnecessaryArrayFlatSingleLevel.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [numLit(1)],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(1)], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles non-computed member expression correctly (reports)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
          computed: false,
        },
        arguments: [numLit(1)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee is computed with bracket notation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'flat' },
          computed: true,
        },
        arguments: [numLit(1)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatSingleLevel.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [numLit(1)]))
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'flat', [numLit(1)]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

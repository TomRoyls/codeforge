import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayFillLiteralRule } from '../../../../src/rules/patterns/no-unnecessary-array-fill-literal.js'
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

function makeArrayExpr(elements: unknown[]): unknown {
  return { type: 'ArrayExpression', elements }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-fill-literal rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayFillLiteralRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayFillLiteralRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayFillLiteralRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayFillLiteralRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayFillLiteralRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning fill', () => {
      const desc = noUnnecessaryArrayFillLiteralRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/fill/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayFillLiteralRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-array-fill-literal.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayFillLiteralRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayFillLiteralRule).toBeDefined()
      expect(noUnnecessaryArrayFillLiteralRule.meta).toBeDefined()
      expect(noUnnecessaryArrayFillLiteralRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary .fill(0)', () => {
    test('reports for [].fill(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.fill(0) — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Array(5).fill(0) — NewExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Array' }, arguments: [{ type: 'NumericLiteral', value: 5 }] }, 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.fill(0, 2) — with start index', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'fill', [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 2 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.fill(0, 1, 3) — with start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'fill', [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 1 }, { type: 'NumericLiteral', value: 3 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for getArr().fill(0) — CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.arr.fill(0) — MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for result.fill(0) on ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions .fill(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].message).toMatch(/fill/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].message).toBe(
        'Unnecessary .fill(0) on an array. New arrays are already filled with undefined. If you need zeros, consider Array.from() with a mapping function.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      const node = makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 0 }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 0 }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for fill(0) on array with elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'NumericLiteral', value: 1 }, { type: 'NumericLiteral', value: 2 }]), 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for fill(0) with many additional arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'fill', [
        { type: 'NumericLiteral', value: 0 },
        { type: 'NumericLiteral', value: 1 },
        { type: 'NumericLiteral', value: 2 },
        { type: 'NumericLiteral', value: 3 },
      ]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for fill(0) on ConditionalExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } }, 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for fill(0) on ArrowFunctionExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for fill(0) on string literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for fill(0) with -0 as value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'fill', [{ type: 'NumericLiteral', value: -0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for fill(0) on ParenthesizedExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ParenthesizedExpression', expression: makeArrayExpr([]) }, 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for fill(0) with numeric second argument as Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'fill', [{ type: 'NumericLiteral', value: 0 }, { type: 'Identifier', name: 'start' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for fill(0) on AwaitExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } }, 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for fill(0) on YieldExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'YieldExpression', argument: { type: 'Identifier', name: 'generator' } }, 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for fill(0) on empty ArrayExpression with no elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for fill(0) with custom loc values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'fill', [{ type: 'NumericLiteral', value: 0 }], 42, 7, 42, 28))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('reports for chained .fill(0) on method result', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      const innerCall = makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [{ type: 'NumericLiteral', value: 1 }])
      visitor.CallExpression(makeCallNode(innerCall, 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for fill(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for fill(-1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: -1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for fill("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'StringLiteral', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for fill(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'BooleanLiteral', value: true }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for fill(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NullLiteral', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for fill() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for fill(0.5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 0.5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for fill(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for fill("0") — string "0" not numeric', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'StringLiteral', value: '0' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].map(x => 0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'map', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'NumericLiteral', value: 0 } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].forEach(x => x) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach', [{ type: 'Identifier', name: 'fn' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].push(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'push', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].pop() — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'pop', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].copyWithin(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'copyWithin', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fill' }, arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Literal', value: 'fill' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Fill" (uppercase F)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'Fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "filling"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filling', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "filled"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filled', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is Literal type (not NumericLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'Identifier', name: 'zero' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'zero' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getZero' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is UnaryExpression (-0 as expression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'NumericLiteral', value: 0 } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'fill' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "fill" but with lowercase f typo in different casing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fIll', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayFillLiteralRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayFillLiteralRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      visitor2.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 1 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 1 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'fill' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'fill' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 1 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'fill', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', []))
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'map', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayFillLiteralRule.create(context)
      const visitor2 = noUnnecessaryArrayFillLiteralRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayFillLiteralRule.meta
      const meta2 = noUnnecessaryArrayFillLiteralRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'fill' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
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
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'fill' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'fill' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      const node = makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 0 }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayFillLiteralRule).toBeDefined()
      expect(typeof noUnnecessaryArrayFillLiteralRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayFillLiteralRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'fill' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'fill', [{ type: 'NumericLiteral', value: 0 }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFillLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'fill' },
          computed: false,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })
  })
})

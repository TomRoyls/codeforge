import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayIndexofZeroRule } from '../../../../src/rules/patterns/no-unnecessary-array-indexof-zero.js'
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

describe('no-unnecessary-array-indexof-zero rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayIndexofZeroRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayIndexofZeroRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayIndexofZeroRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayIndexofZeroRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayIndexofZeroRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning indexOf', () => {
      const desc = noUnnecessaryArrayIndexofZeroRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/indexof/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayIndexofZeroRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-array-indexof-zero.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayIndexofZeroRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayIndexofZeroRule).toBeDefined()
      expect(noUnnecessaryArrayIndexofZeroRule.meta).toBeDefined()
      expect(noUnnecessaryArrayIndexofZeroRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (35) =====

  describe('positive cases — reports .indexOf(0)', () => {
    test('reports for arr.indexOf(0) with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for [].indexOf(0) with empty ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for [1, 2, 3].indexOf(0) with populated ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'NumericLiteral', value: 1 }, { type: 'NumericLiteral', value: 2 }, { type: 'NumericLiteral', value: 3 }]), 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.indexOf(0, 1) with fromIndex argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.indexOf(0, 0) with zero fromIndex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.indexOf(0, n) with Identifier fromIndex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }, { type: 'Identifier', name: 'n' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for getArr().indexOf(0) with CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.arr.indexOf(0) with MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions indexOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].message).toMatch(/indexOf/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].message).toBe(
        'Unnecessary .indexOf(0). Consider using .includes(0) for a boolean check instead of comparing the index.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr2' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for string variable str.indexOf(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for chained member obj.nested.arr.indexOf(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      const nested = { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'nested' } }
      const deep = { type: 'MemberExpression', object: nested, property: { type: 'Identifier', name: 'arr' } }
      visitor.CallExpression(makeCallNode(deep, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.indexOf(0) with various Identifier names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'list' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'items' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'data' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(3)
    })

    test('reports for arr.indexOf(0) with extra properties on argument node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0, raw: '0', leadingComments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for fn().indexOf(0) with function call result', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.indexOf(0) with StringLiteral object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'StringLiteral', value: 'hello' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.indexOf(0) with ObjectExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.indexOf(0) with ArrowFunctionExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for arr.indexOf(0) with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 1 }, { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for [null, undefined].indexOf(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([null, { type: 'Identifier', name: 'undefined' }]), 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for [true, false].indexOf(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'BooleanLiteral', value: true }, { type: 'BooleanLiteral', value: false }]), 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.indexOf(0) with computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'indexOf' },
          computed: false,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for [...other].indexOf(0) with SpreadElement in array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'other' } }]), 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.indexOf(0, getStart()) with CallExpression fromIndex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }, { type: 'CallExpression', callee: { type: 'Identifier', name: 'getStart' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.indexOf(0, obj.start) with MemberExpression fromIndex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }, { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'start' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.indexOf(0, 5) with numeric fromIndex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 5 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.indexOf(0) with TemplateLiteral as fromIndex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }, { type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.indexOf(0) with ArrowFunction as fromIndex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }, { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.indexOf(1) — not zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.indexOf() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.includes(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.lastIndexOf(0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'lastIndexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(x => x === 0) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findIndex', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.indexOf("0") — string not number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'StringLiteral', value: '0' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.indexOf(x) — Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.indexOf(42) — different number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.indexOf(0.5) — non-zero value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0.5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.indexOf(null) — null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NullLiteral' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.indexOf(true) — boolean argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'BooleanLiteral', value: true }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.indexOf([]) — ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.indexOf({}) — ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'indexOf' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "indexof" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexof', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "INDEXOF" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'INDEXOF', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [null]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports when first arg is Literal type with number value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('does not report when first arg is BigIntLiteral type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'BigIntLiteral', value: '0n' }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayIndexofZeroRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayIndexofZeroRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 1 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 1 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'indexOf' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'indexOf' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 1 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'lastIndexOf', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayIndexofZeroRule.create(context)
      const visitor2 = noUnnecessaryArrayIndexofZeroRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayIndexofZeroRule.meta
      const meta2 = noUnnecessaryArrayIndexofZeroRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'indexOf' },
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
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'indexOf' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'indexOf' },
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
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayIndexofZeroRule).toBeDefined()
      expect(typeof noUnnecessaryArrayIndexofZeroRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayIndexofZeroRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'indexOf' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'NumericLiteral', value: 0 }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIndexofZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'indexOf' },
          computed: true,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})

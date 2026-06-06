import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArraySliceZeroRule } from '../../../../src/rules/patterns/no-unnecessary-array-slice-zero.js'
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

function makeNumericLiteral(value: number): unknown {
  return { type: 'Literal', value }
}

function makeArrayExpr(elements: unknown[]): unknown {
  return { type: 'ArrayExpression', elements }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-slice-zero rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArraySliceZeroRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArraySliceZeroRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArraySliceZeroRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArraySliceZeroRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArraySliceZeroRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning slice', () => {
      const desc = noUnnecessaryArraySliceZeroRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/slice/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArraySliceZeroRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-array-slice-zero.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArraySliceZeroRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArraySliceZeroRule).toBeDefined()
      expect(noUnnecessaryArraySliceZeroRule.meta).toBeDefined()
      expect(noUnnecessaryArraySliceZeroRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary .slice(0)', () => {
    test('reports for Identifier.slice(0) — arr.slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array [].slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array [1].slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for multi-element array [1, 2, 3].slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]), 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for string literal "hello".slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for MemberExpression obj.arr.slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for CallExpression getArr().slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions .slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0)]))
      expect(reports[0].message).toMatch(/slice\(0\)/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0)]))
      expect(reports[0].message).toBe(
        'Unnecessary .slice(0). This returns a shallow copy of the entire array. Use [...arr] or Array.from(arr) for cloning.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0)]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0)]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0)])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0)], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'slice', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'slice', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'slice', [makeNumericLiteral(0)]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for array with boolean element .slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'BooleanLiteral', value: true }]), 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with object element .slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ObjectExpression', properties: [] }]), 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with SpreadElement .slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }]), 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with ArrowFunction element .slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]), 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with nested array element .slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }])]), 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with regex element .slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'RegExpLiteral', pattern: 'test', flags: '' }]), 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with TemplateLiteral element .slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'TemplateLiteral', quasis: [], expressions: [] }]), 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with ConditionalExpression element .slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }]), 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with MemberExpression element .slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' } }]), 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for ObjectExpression {}.slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('reports for FunctionExpression result .slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0)]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for .slice() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for .slice(1) — non-zero start', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .slice(-1) — negative index', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [{ type: 'UnaryExpression', operator: '-', argument: makeNumericLiteral(1) }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .slice(0, 5) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0), makeNumericLiteral(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .slice(0, 0) — two arguments both zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0), makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .slice(0, undefined) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0), { type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .slice(x) — Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .slice("0") — StringLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [{ type: 'Literal', value: '0' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .slice(0.5) — non-zero float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0.5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .slice(1, 2, 3) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(1), makeNumericLiteral(2), makeNumericLiteral(3)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .splice(0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'splice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .map(0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .filter(0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .concat(0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'concat', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .indexOf(0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeNumericLiteral(0)], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeNumericLiteral(0)], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is Identifier (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeNumericLiteral(0)], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is Literal (not Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'slice' },
          computed: true,
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "slicee" (wrong name)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slicee', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for .slice with BigIntLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [{ type: 'BigIntLiteral', value: '0n' }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (25) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArraySliceZeroRule.create(ctx1)
      const visitor2 = noUnnecessaryArraySliceZeroRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0)]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(1)]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates mixed valid/invalid correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(1)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', []))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [makeNumericLiteral(0)],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [makeNumericLiteral(0)],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArraySliceZeroRule.create(context)
      const visitor2 = noUnnecessaryArraySliceZeroRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArraySliceZeroRule.meta
      const meta2 = noUnnecessaryArraySliceZeroRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [makeNumericLiteral(0)],
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
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0)])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArraySliceZeroRule).toBeDefined()
      expect(typeof noUnnecessaryArraySliceZeroRule.create).toBe('function')
      expect(typeof noUnnecessaryArraySliceZeroRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0)], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'slice' },
          computed: false,
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'slice' },
          computed: true,
        },
        arguments: [makeNumericLiteral(0)],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'slice', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report for .slice with function call arg that evaluates to 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getZero' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .slice with BinaryExpression arg 0 + 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [{ type: 'BinaryExpression', operator: '+', left: makeNumericLiteral(0), right: makeNumericLiteral(0) }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [null]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .slice with UnaryExpression -0 argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [{ type: 'UnaryExpression', operator: '-', argument: makeNumericLiteral(0) }]))
      expect(reports.length).toBe(0)
    })

    test('mixed valid/invalid across many calls count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(1)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'splice', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', []))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0), makeNumericLiteral(5)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [makeNumericLiteral(0)]))
      expect(reports.length).toBe(3)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayIncludesNaN } from '../../../../src/rules/patterns/no-unnecessary-array-includes-nan.js'
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

describe('no-unnecessary-array-includes-nan rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayIncludesNaN.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayIncludesNaN.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayIncludesNaN.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayIncludesNaN.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayIncludesNaN.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning includes', () => {
      const desc = noUnnecessaryArrayIncludesNaN.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/includes/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayIncludesNaN.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-includes-nan.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayIncludesNaN.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayIncludesNaN).toBeDefined()
      expect(noUnnecessaryArrayIncludesNaN.meta).toBeDefined()
      expect(noUnnecessaryArrayIncludesNaN.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports .includes(NaN)', () => {
    test('reports for arr.includes(NaN) — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for [1, NaN, 3].includes(NaN) — ArrayExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Identifier', name: 'NaN' }, { type: 'Literal', value: 3 }]), 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array [].includes(NaN)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array [1].includes(NaN)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for func().includes(NaN) — CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.arr.includes(NaN) — MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for string literal object "hello".includes(NaN)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Number.isNaN', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports[0].message).toMatch(/Number\.isNaN/)
    })

    test('report message mentions includes(NaN)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports[0].message).toMatch(/includes/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports[0].message).toBe(
        'Array.prototype.includes(NaN) works but may indicate a code smell. Consider using Number.isNaN() for explicit NaN checks.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'NaN' }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'NaN' }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr2' }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr2' }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for array with object elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ObjectExpression', properties: [] }]), 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with null elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([null]), 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }]), 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with ArrowFunction element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]), 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with nested array element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }])]), 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with regex element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: /test/ }]), 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with boolean element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: true }]), 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with TemplateLiteral element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'TemplateLiteral', quasis: [], expressions: [] }]), 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with ConditionalExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }]), 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for this.includes(NaN) — ThisExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'NaN' }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('reports for ObjectExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with string elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'hello' }]), 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [{ type: 'Identifier', name: 'NaN' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [{ type: 'Identifier', name: 'NaN' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (45) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.includes(5) — number literal arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.includes("hello") — string literal arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.includes(x) — variable, not NaN', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.includes(undefined) — different identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.includes(null) — null literal arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.includes(true) — boolean literal arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.includes() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.includes(NaN, 0) — 2 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'NaN' }, { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.indexOf(NaN) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'includes' },
          computed: true,
        },
        arguments: [{ type: 'Identifier', name: 'NaN' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'Identifier', name: 'NaN' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'Identifier', name: 'NaN' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'Identifier', name: 'NaN' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'includes' },
        },
        arguments: [{ type: 'Identifier', name: 'NaN' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "lastIndexOf"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'lastIndexOf', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "includes" but lowercase "nan"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'nan' }]))
      expect(reports.length).toBe(0)
    })

    test('reports when object is missing in MemberExpression — rule does not validate object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [{ type: 'Identifier', name: 'NaN' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [{ type: 'Identifier', name: 'NaN' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [{ type: 'Identifier', name: 'NaN' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is Literal with NaN value (not Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Literal', value: NaN }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'Number' }, property: { type: 'Identifier', name: 'NaN' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getNaN' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.includes(Infinity) — different identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments has 3 items', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'NaN' }, { type: 'Literal', value: 0 }, { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find(NaN) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(NaN) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.lastIndexOf(NaN) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'lastIndexOf', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "Includes" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'Includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arg that is an object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arg that is an array expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (10) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayIncludesNaN.create(ctx1)
      const visitor2 = noUnnecessaryArrayIncludesNaN.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Literal', value: 5 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Literal', value: 5 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr2' }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(2)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Literal', value: 5 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'x' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayIncludesNaN.create(context)
      const visitor2 = noUnnecessaryArrayIncludesNaN.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayIncludesNaN.meta
      const meta2 = noUnnecessaryArrayIncludesNaN.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [{ type: 'Identifier', name: 'NaN' }],
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
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [{ type: 'Identifier', name: 'NaN' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [{ type: 'Identifier', name: 'NaN' }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'includes' },
        },
        arguments: [{ type: 'Identifier', name: 'NaN' }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayIncludesNaN.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr2' }, 'includes', [{ type: 'Identifier', name: 'NaN' }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

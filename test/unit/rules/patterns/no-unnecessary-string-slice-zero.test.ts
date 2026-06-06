import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringSliceZeroRule } from '../../../../src/rules/patterns/no-unnecessary-string-slice-zero.js'
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

// ===== META TESTS (8) =====

describe('no-unnecessary-string-slice-zero rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringSliceZeroRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringSliceZeroRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringSliceZeroRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringSliceZeroRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringSliceZeroRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning slice', () => {
      const desc = noUnnecessaryStringSliceZeroRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/slice/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringSliceZeroRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-slice-zero.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringSliceZeroRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringSliceZeroRule).toBeDefined()
      expect(noUnnecessaryStringSliceZeroRule.meta).toBeDefined()
      expect(noUnnecessaryStringSliceZeroRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports str.slice(0)', () => {
    test('reports for str.slice(0) with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for text.slice(0) with different Identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'text' }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.slice(0) with MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for fn().slice(0) with CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for [].slice(0) with ArrayExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".slice(0) with Literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for deeply nested a.b.c.slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      const deepMember = { type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }, property: { type: 'Identifier', name: 'c' } }
      visitor.CallExpression(makeCallNode(deepMember, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr[0].slice(0) with computed MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Literal', value: 0 }, computed: true }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for getStr().slice(0) with function call result', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for BinaryExpression object (a + b).slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for TemplateLiteral object `text`.slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression object (a ? b : c).slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'a' }, consequent: { type: 'Identifier', name: 'b' }, alternate: { type: 'Identifier', name: 'c' } }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrowFunctionExpression object (() => "").slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for UnaryExpression object (!x).slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions slice', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports[0].message).toMatch(/slice/)
    })

    test('report message mentions returns the entire string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports[0].message).toMatch(/returns the entire string/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports[0].message).toBe(
        'str.slice(0) returns the entire string. Use str or be explicit about intent.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc start.line is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('report loc start.column is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end.line is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }], 5, 10, 7, 15))
      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('report loc end.column is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }], 5, 10, 5, 30))
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'slice', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'slice', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for result.slice(0) with ObjectExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for ParenthesizedExpression-like object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ParenthesizedExpression', expression: { type: 'Identifier', name: 'x' } }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for NewExpression object new String(s).slice(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'String' }, arguments: [{ type: 'Identifier', name: 's' }] }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (34) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for slice(0, 5) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for slice(1) — non-zero argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for slice() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice'))
      expect(reports.length).toBe(0)
    })

    test('does not report for slice(0, 0) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for slice(0, 10) — two arguments with different end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 10 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for slice(-1) — negative argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: -1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for slice(0.5) — float argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0.5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for slice(2) — positive non-zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for slice(100) — large non-zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 100 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.substring(0) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'substring', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.substr(0) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'substr', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split(0) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.trim(0) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'trim', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toString(0) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toString', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf(0) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'Literal', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'Literal', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'Literal', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'slice' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Slice" (uppercase S)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'Slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed with bracket notation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
          computed: true,
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is StringLiteral "0" instead of NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: '0' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is an Identifier variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Identifier', name: 'n' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringSliceZeroRule.create(ctx1)
      const visitor2 = noUnnecessaryStringSliceZeroRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 1 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'slice', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'slice', [{ type: 'Literal', value: 1 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'c' }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      // invalid: slice(0) with one arg, value 0
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'slice', [{ type: 'Literal', value: 0 }]))
      // valid: slice(1) with non-zero
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'slice', [{ type: 'Literal', value: 1 }]))
      // valid: slice(0, 5) with two args
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'c' }, 'slice', [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 5 }]))
      // invalid: another slice(0)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'd' }, 'slice', [{ type: 'Literal', value: 0 }]))
      // valid: different method
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'e' }, 'substring', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringSliceZeroRule.create(context)
      const visitor2 = noUnnecessaryStringSliceZeroRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringSliceZeroRule.meta
      const meta2 = noUnnecessaryStringSliceZeroRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
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
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringSliceZeroRule).toBeDefined()
      expect(typeof noUnnecessaryStringSliceZeroRule.create).toBe('function')
      expect(typeof noUnnecessaryStringSliceZeroRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles non-computed member expression (reports)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'slice' },
          computed: true,
        },
        arguments: [{ type: 'Literal', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'slice', [{ type: 'Literal', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when argument is NaN (not strictly 0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: NaN }]))
      expect(reports.length).toBe(0)
    })

    test('reports when argument is negative zero (-0 === 0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: -0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports when argument is Literal with value 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringSliceZeroLen } from '../../../../src/rules/patterns/no-unnecessary-string-slice-zero-len.js'
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
    getSource: () => '',
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

// ===== META TESTS (8) =====

describe('no-unnecessary-string-slice-zero-len rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringSliceZeroLen.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringSliceZeroLen.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringSliceZeroLen.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringSliceZeroLen.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringSliceZeroLen.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning slice', () => {
      const desc = noUnnecessaryStringSliceZeroLen.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/slice/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringSliceZeroLen.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-slice-zero-len.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringSliceZeroLen.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringSliceZeroLen).toBeDefined()
      expect(noUnnecessaryStringSliceZeroLen.meta).toBeDefined()
      expect(noUnnecessaryStringSliceZeroLen.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports slice(0, N) with N > 0', () => {
    test('reports for str.slice(0, 1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(1)]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.slice(0, 5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(5)]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.slice(0, 10)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(10)]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.slice(0, 100)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(100)]))
      expect(reports.length).toBe(1)
    })

    test('reports for string literal .slice(0, 3)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'slice', [numLit(0), numLit(3)]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.slice(0, 2)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'slice', [numLit(0), numLit(2)]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.slice(0, 3)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } },
          'slice',
          [numLit(0), numLit(3)],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for getStr().slice(0, 5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] },
          'slice',
          [numLit(0), numLit(5)],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [1,2,3].slice(0, 2)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] },
          'slice',
          [numLit(0), numLit(2)],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for ObjectExpression.slice(0, 1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'slice', [numLit(0), numLit(1)]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions slice', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(5)]))
      expect(reports[0].message).toMatch(/slice/)
    })

    test('report message contains the end value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(5)]))
      expect(reports[0].message).toMatch(/\b5\b/)
    })

    test('report message is exactly as defined in source for slice(0, 5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(5)]))
      expect(reports[0].message).toBe(
        'String.prototype.slice(0, 5) can be simplified. Consider using substring() or direct indexing.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(5)]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(5)]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(5)])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(5)], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(5)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(10)]))
      expect(reports.length).toBe(2)
    })

    test('reports with fractional positive end 0.5', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(0.5)]))
      expect(reports.length).toBe(1)
    })

    test('reports with very large end value 9999', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(9999)]))
      expect(reports.length).toBe(1)
    })

    test('report message for end=42 contains "42"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(42)]))
      expect(reports[0].message).toContain('42')
      expect(reports[0].message).toBe(
        'String.prototype.slice(0, 42) can be simplified. Consider using substring() or direct indexing.',
      )
    })

    test('reports with end=2', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'text' }, 'slice', [numLit(0), numLit(2)]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(5)]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for FunctionExpression.slice(0, 1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
          'slice',
          [numLit(0), numLit(1)],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for ArrowFunctionExpression.slice(0, 1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
          'slice',
          [numLit(0), numLit(1)],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression.slice(0, 2)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(
        makeCallNode(
          {
            type: 'ConditionalExpression',
            test: { type: 'Identifier', name: 'x' },
            consequent: { type: 'Literal', value: 'a' },
            alternate: { type: 'Literal', value: 'b' },
          },
          'slice',
          [numLit(0), numLit(2)],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for NewExpression.slice(0, 3)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'NewExpression', callee: { type: 'Identifier', name: 'String' }, arguments: [] },
          'slice',
          [numLit(0), numLit(3)],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for TemplateLiteral.slice(0, 1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'TemplateLiteral', quasis: [], expressions: [] },
          'slice',
          [numLit(0), numLit(1)],
        ),
      )
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for slice(0) — only 1 argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for slice() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice'))
      expect(reports.length).toBe(0)
    })

    test('does not report for slice(0, 5, 10) — 3 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(5), numLit(10)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for slice(0, -1) — negative end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(-1)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for slice(0, 0) — end is 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(0)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for slice(0, -5) — negative end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(-5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for slice(5, 10) — start not 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(5), numLit(10)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for slice(1, 5) — start is 1 not 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(1), numLit(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for slice(-1, 5) — negative start', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(-1), numLit(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for slice(x, 5) — start is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Identifier', name: 'x' }, numLit(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for slice(0, n) — end is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), { type: 'Identifier', name: 'n' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for substring(0, 5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'substring', [numLit(0), numLit(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for substr(0, 5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'substr', [numLit(0), numLit(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for splice(0, 5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'splice', [numLit(0), numLit(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for toString(0, 5) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toString', [numLit(0), numLit(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
          computed: true,
        },
        arguments: [numLit(0), numLit(5)],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [numLit(0), numLit(5)], loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [numLit(0), numLit(5)], loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [numLit(0), numLit(5)], loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'slice' },
        },
        arguments: [numLit(0), numLit(5)],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Slice" — case sensitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'Slice', [numLit(0), numLit(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "SLICE" — case sensitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'SLICE', [numLit(0), numLit(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is Literal not NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Literal', value: 0 }, numLit(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [{ type: 'Identifier', name: 'start' }, numLit(5)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when second arg is Literal not NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), { type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when second arg is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), { type: 'Identifier', name: 'end' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [numLit(0), numLit(5)],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [numLit(0), numLit(5)],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringSliceZeroLen.create(ctx1)
      const visitor2 = noUnnecessaryStringSliceZeroLen.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(5)]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(1), numLit(5)]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed valid/invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(5)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(1), numLit(5)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(10)]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [numLit(0), numLit(5)],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [numLit(0), numLit(5)],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(5)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(1), numLit(5)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'substring', [numLit(0), numLit(5)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(10)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(-1)]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringSliceZeroLen.create(context)
      const visitor2 = noUnnecessaryStringSliceZeroLen.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringSliceZeroLen.meta
      const meta2 = noUnnecessaryStringSliceZeroLen.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [numLit(0), numLit(5)],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [numLit(0), numLit(5)],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [numLit(0), numLit(5)],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(5)])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringSliceZeroLen).toBeDefined()
      expect(typeof noUnnecessaryStringSliceZeroLen.create).toBe('function')
      expect(typeof noUnnecessaryStringSliceZeroLen.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [numLit(0), numLit(5)],
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(5)], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles non-computed member expression — reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'slice' },
          computed: false,
        },
        arguments: [numLit(0), numLit(5)],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'slice' },
          computed: true,
        },
        arguments: [numLit(0), numLit(5)],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringSliceZeroLen.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(5)]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [numLit(0), numLit(10)]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('5)')
      expect(reports[1].message).toContain('10)')
    })
  })
})

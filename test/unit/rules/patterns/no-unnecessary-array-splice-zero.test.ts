import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArraySpliceZeroRule } from '../../../../src/rules/patterns/no-unnecessary-array-splice-zero.js'
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

function makeSpliceCallNode(
  object: unknown,
  args: unknown[] = [],
  computed = false,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed,
      object,
      property: { type: 'Identifier', name: 'splice' },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-splice-zero rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArraySpliceZeroRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArraySpliceZeroRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArraySpliceZeroRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArraySpliceZeroRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArraySpliceZeroRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning splice', () => {
      const desc = noUnnecessaryArraySpliceZeroRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/splice/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArraySpliceZeroRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-splice-zero.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArraySpliceZeroRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArraySpliceZeroRule).toBeDefined()
      expect(noUnnecessaryArraySpliceZeroRule.meta).toBeDefined()
      expect(noUnnecessaryArraySpliceZeroRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (35) =====

  describe('positive cases — reports arr.splice(0, ...)', () => {
    test('reports for arr.splice(0, 3)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for arr.splice(0, 1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 1 }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for arr.splice(0, 0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 0 }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for arr.splice(0, arr.length)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'length' } }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for arr.splice(0, 3, "a") — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [
            { type: 'NumericLiteral', value: 0 },
            { type: 'NumericLiteral', value: 3 },
            { type: 'Literal', value: 'a' },
          ],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for arr.splice(0, 2, "a", "b") — four arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [
            { type: 'NumericLiteral', value: 0 },
            { type: 'NumericLiteral', value: 2 },
            { type: 'Literal', value: 'a' },
            { type: 'Literal', value: 'b' },
          ],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for arr.splice(0, 1, x) with identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [
            { type: 'NumericLiteral', value: 0 },
            { type: 'NumericLiteral', value: 1 },
            { type: 'Identifier', name: 'x' },
          ],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for list.splice(0, 5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'list' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 5 }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for data.splice(0, n)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'data' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'Identifier', name: 'n' }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('report message mentions splice and slice', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        ),
      )
      expect(reports[0].message).toMatch(/splice/)
      expect(reports[0].message).toMatch(/slice/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        ),
      )
      expect(reports[0].message).toBe(
        'arr.splice(0, ...) can be replaced with arr.slice(...) for readability.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        ),
      )
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        ),
      )
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      const node = makeSpliceCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
      )
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
          false,
          5, 10, 5, 30,
        ),
      )
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        ),
      )
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 1 }],
        ),
      )
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        ),
      )
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 5 }],
        ),
      )
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for arr.splice(0, 2, { key: "val" }) — with object arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [
            { type: 'NumericLiteral', value: 0 },
            { type: 'NumericLiteral', value: 2 },
            { type: 'ObjectExpression', properties: [] },
          ],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for arr.splice(0, 1, fn()) — with call expression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [
            { type: 'NumericLiteral', value: 0 },
            { type: 'NumericLiteral', value: 1 },
            { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
          ],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for arr.splice(0, 3, [1, 2]) — with array arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [
            { type: 'NumericLiteral', value: 0 },
            { type: 'NumericLiteral', value: 3 },
            { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] },
          ],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        ),
      )
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for arr.splice(0, 1) — second arg is NumericLiteral 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 1 }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for arr.splice(0, 100)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 100 }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for arr.splice(0, 0, "item") — insert at beginning', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [
            { type: 'NumericLiteral', value: 0 },
            { type: 'NumericLiteral', value: 0 },
            { type: 'Literal', value: 'item' },
          ],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for arr.splice(0, ...args) — with spread element arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [
            { type: 'NumericLiteral', value: 0 },
            { type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } },
          ],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for arr.splice(0, 2, null) — with null literal arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [
            { type: 'NumericLiteral', value: 0 },
            { type: 'NumericLiteral', value: 2 },
            { type: 'Literal', value: null },
          ],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for arr.splice(0, 1, true) — with boolean literal arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [
            { type: 'NumericLiteral', value: 0 },
            { type: 'NumericLiteral', value: 1 },
            { type: 'Literal', value: true },
          ],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for arr.splice(0, 3, x, y, z) — many arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [
            { type: 'NumericLiteral', value: 0 },
            { type: 'NumericLiteral', value: 3 },
            { type: 'Identifier', name: 'x' },
            { type: 'Identifier', name: 'y' },
            { type: 'Identifier', name: 'z' },
          ],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for obj.items.splice(0, 2) — MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 2 }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for getArr().splice(0, 3) — CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for [1,2,3].splice(0, 2) — ArrayExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 2 }],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for arr.splice(0, 1, /regex/) — with regex arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [
            { type: 'NumericLiteral', value: 0 },
            { type: 'NumericLiteral', value: 1 },
            { type: 'Literal', value: /test/ },
          ],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for arr.splice(0, 1, () => {}) — with arrow function arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [
            { type: 'NumericLiteral', value: 0 },
            { type: 'NumericLiteral', value: 1 },
            { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
          ],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for arr.splice(0, 1, x ? 1 : 2) — with conditional arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [
            { type: 'NumericLiteral', value: 0 },
            { type: 'NumericLiteral', value: 1 },
            { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } },
          ],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for arr.splice(0, 1, `template`) — with template literal arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [
            { type: 'NumericLiteral', value: 0 },
            { type: 'NumericLiteral', value: 1 },
            { type: 'TemplateLiteral', quasis: [], expressions: [] },
          ],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for items.splice(0, 2, ...newItems) — with spread element as third arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'items' },
          [
            { type: 'NumericLiteral', value: 0 },
            { type: 'NumericLiteral', value: 2 },
            { type: 'SpreadElement', argument: { type: 'Identifier', name: 'newItems' } },
          ],
        ),
      )
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (38) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.splice(0) — only one argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.splice(1, 3) — first arg not 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 1 }, { type: 'NumericLiteral', value: 3 }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.splice(5, 2) — first arg not 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 5 }, { type: 'NumericLiteral', value: 2 }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.splice(-1, 2) — negative first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: -1 }, { type: 'NumericLiteral', value: 2 }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.slice(0, 3) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.push(0, 3) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'push' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.pop() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'pop' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.shift() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'shift' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member expression arr["splice"](0, 3)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
          true, // computed
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'splice' }, arguments: [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'splice' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is not NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'Identifier', name: 'zero' }, { type: 'NumericLiteral', value: 3 }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is Literal with value 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'Literal', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is NumericLiteral with value 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 1 }, { type: 'NumericLiteral', value: 3 }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.splice(start, 3) — first arg is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'Identifier', name: 'start' }, { type: 'NumericLiteral', value: 3 }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [null, { type: 'NumericLiteral', value: 3 }],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.splice() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [],
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Splice" (uppercase S)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'Splice' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "SPLICE" (all caps)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'SPLICE' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (12) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArraySpliceZeroRule.create(ctx1)
      const visitor2 = noUnnecessaryArraySpliceZeroRule.create(ctx2)
      visitor1.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        ),
      )
      visitor2.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 1 }, { type: 'NumericLiteral', value: 3 }],
        ),
      )
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      // positive
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        ),
      )
      // negative — only 1 arg
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }],
        ),
      )
      // positive
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 1 }],
        ),
      )
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      // splice(1, 3) — negative
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 1 }, { type: 'NumericLiteral', value: 3 }],
        ),
      )
      // splice(0, 3) — positive
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        ),
      )
      // splice(0) — negative (only 1 arg)
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }],
        ),
      )
      // slice(0, 3) — negative (wrong method)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'slice' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      // splice(0, 5) — positive
      visitor.CallExpression(
        makeSpliceCallNode(
          { type: 'Identifier', name: 'arr' },
          [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 5 }],
        ),
      )
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArraySpliceZeroRule.create(context)
      const visitor2 = noUnnecessaryArraySpliceZeroRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArraySpliceZeroRule.meta
      const meta2 = noUnnecessaryArraySpliceZeroRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
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
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySpliceZeroRule.create(context)
      const node = makeSpliceCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 3 }],
      )
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArraySpliceZeroRule).toBeDefined()
      expect(typeof noUnnecessaryArraySpliceZeroRule.create).toBe('function')
      expect(typeof noUnnecessaryArraySpliceZeroRule.meta).toBe('object')
    })
  })
})

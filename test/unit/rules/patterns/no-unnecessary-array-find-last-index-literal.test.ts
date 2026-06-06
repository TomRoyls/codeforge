import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayFindLastIndexLiteralRule } from '../../../../src/rules/patterns/no-unnecessary-array-find-last-index-literal.js'
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

function makeArrowTrue(): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [],
    body: { type: 'BooleanLiteral', value: true },
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-find-last-index-literal rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayFindLastIndexLiteralRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayFindLastIndexLiteralRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayFindLastIndexLiteralRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayFindLastIndexLiteralRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayFindLastIndexLiteralRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning findLastIndex', () => {
      const desc = noUnnecessaryArrayFindLastIndexLiteralRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/findlastindex/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayFindLastIndexLiteralRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-find-last-index-literal.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayFindLastIndexLiteralRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayFindLastIndexLiteralRule).toBeDefined()
      expect(noUnnecessaryArrayFindLastIndexLiteralRule.meta).toBeDefined()
      expect(noUnnecessaryArrayFindLastIndexLiteralRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary findLastIndex', () => {
    test('reports for arr.findLastIndex(() => true) with Identifier callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeArrowTrue()]))
      expect(reports.length).toBe(1)
    })

    test('reports for [].findLastIndex(() => true) with ArrayExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'findLastIndex', [makeArrowTrue()]))
      expect(reports.length).toBe(1)
    })

    test('reports for getArr().findLastIndex(() => true) with CallExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'findLastIndex', [makeArrowTrue()]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.arr.findLastIndex(() => true) with MemberExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'findLastIndex', [makeArrowTrue()]))
      expect(reports.length).toBe(1)
    })

    test('reports with arrow function with single parameter (x) => true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = { type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BooleanLiteral', value: true } }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(1)
    })

    test('reports with arrow function with multiple parameters (x, i, arr) => true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = {
        type: 'ArrowFunctionExpression',
        params: [
          { type: 'Identifier', name: 'x' },
          { type: 'Identifier', name: 'i' },
          { type: 'Identifier', name: 'arr' },
        ],
        body: { type: 'BooleanLiteral', value: true },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(1)
    })

    test('reports with arrow function with rest parameter (...args) => true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'RestElement', argument: { type: 'Identifier', name: 'args' } }],
        body: { type: 'BooleanLiteral', value: true },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(1)
    })

    test('reports with arrow function with default parameter (x = 1) => true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'AssignmentPattern', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 } }],
        body: { type: 'BooleanLiteral', value: true },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions findLastIndex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeArrowTrue()]))
      expect(reports[0].message).toMatch(/findLastIndex/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeArrowTrue()]))
      expect(reports[0].message).toBe(
        'arr.findLastIndex(() => true) always returns arr.length - 1. Use arr.length - 1 directly.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeArrowTrue()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeArrowTrue()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeArrowTrue()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeArrowTrue()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeArrowTrue()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'data' }, 'findLastIndex', [makeArrowTrue()]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeArrowTrue()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'data' }, 'findLastIndex', [makeArrowTrue()]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeArrowTrue()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'findLastIndex' },
        },
        arguments: [makeArrowTrue()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'findLastIndex' },
        },
        arguments: [makeArrowTrue()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'findLastIndex' },
        },
        arguments: [makeArrowTrue()],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeArrowTrue()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'findLastIndex' },
        },
        arguments: [makeArrowTrue()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'findLastIndex' },
        },
        arguments: [makeArrowTrue()],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'findLastIndex' },
        },
        arguments: [makeArrowTrue()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeArrowTrue()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles member expression with computed: false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'findLastIndex' },
          computed: false,
        },
        arguments: [makeArrowTrue()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      // invalid: reports
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeArrowTrue()]))
      // valid: () => false
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BooleanLiteral', value: false } }]))
      // valid: wrong method name
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findIndex', [makeArrowTrue()]))
      // invalid: reports
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'data' }, 'findLastIndex', [makeArrowTrue()]))
      // valid: 2 args
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeArrowTrue(), { type: 'Identifier', name: 'thisArg' }]))
      expect(reports.length).toBe(2)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeArrowTrue()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'data' }, 'findLastIndex', [makeArrowTrue()]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for () => false — BooleanLiteral false body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = { type: 'ArrowFunctionExpression', params: [], body: { type: 'BooleanLiteral', value: false } }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(0)
    })

    test('does not report for x => x > 5 — BinaryExpression body (actual condition)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BinaryExpression', operator: '>', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 5 } },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 2 arguments (arr.findLastIndex(() => true, thisArg))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeArrowTrue(), { type: 'Identifier', name: 'thisArg' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for function() { return true; } — FunctionExpression not ArrowFunction', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const fn = { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: { type: 'BooleanLiteral', value: true } }] } }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [fn]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(() => true) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findIndex', [makeArrowTrue()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findLastIndex() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex'))
      expect(reports.length).toBe(0)
    })

    test('does not report for () => 1 — NumericLiteral body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = { type: 'ArrowFunctionExpression', params: [], body: { type: 'Literal', value: 1 } }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(0)
    })

    test('does not report for () => "true" — StringLiteral body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = { type: 'ArrowFunctionExpression', params: [], body: { type: 'Literal', value: 'true' } }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(0)
    })

    test('does not report for () => null — NullLiteral body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = { type: 'ArrowFunctionExpression', params: [], body: { type: 'NullLiteral' } }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(0)
    })

    test('does not report for () => { return true; } — BlockStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: { type: 'BooleanLiteral', value: true } }] },
      }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member expression arr["findLastIndex"](() => true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'findLastIndex' },
          computed: true,
        },
        arguments: [makeArrowTrue()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeArrowTrue()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeArrowTrue()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression (is Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeArrowTrue()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier (is Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'findLastIndex' },
        },
        arguments: [makeArrowTrue()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "findlastindex" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findlastindex', [makeArrowTrue()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "findLast" — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLast', [makeArrowTrue()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "findIndex" — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findIndex', [makeArrowTrue()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [makeArrowTrue()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [makeArrowTrue()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for 3 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeArrowTrue(), { type: 'Identifier', name: 'thisArg' }, { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arrow returning Identifier (not BooleanLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = { type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'Identifier', name: 'x' } }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arrow returning CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = { type: 'ArrowFunctionExpression', params: [], body: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] } }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Identifier (not ArrowFunction)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [{ type: 'Identifier', name: 'pred' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const fn = { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: { type: 'BooleanLiteral', value: true } }] } }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [fn]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'findLastIndex' },
          computed: true,
        },
        arguments: [makeArrowTrue()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arrow body is missing (undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = { type: 'ArrowFunctionExpression', params: [] }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arrow body with Literal type true (not BooleanLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = { type: 'ArrowFunctionExpression', params: [], body: { type: 'Literal', value: true } }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arrow body with undefined type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = { type: 'ArrowFunctionExpression', params: [], body: {} }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayFindLastIndexLiteralRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayFindLastIndexLiteralRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeArrowTrue()]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BooleanLiteral', value: false } }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeArrowTrue()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BooleanLiteral', value: false } }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'data' }, 'findLastIndex', [makeArrowTrue()]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const visitor2 = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayFindLastIndexLiteralRule.meta
      const meta2 = noUnnecessaryArrayFindLastIndexLiteralRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayFindLastIndexLiteralRule).toBeDefined()
      expect(typeof noUnnecessaryArrayFindLastIndexLiteralRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayFindLastIndexLiteralRule.meta).toBe('object')
    })

    test('does not report for Identifier node type (not CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('reports for object type Literal callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'findLastIndex', [makeArrowTrue()]))
      expect(reports.length).toBe(1)
    })

    test('reports for object type ObjectExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'findLastIndex', [makeArrowTrue()]))
      expect(reports.length).toBe(1)
    })

    test('reports for object type FunctionExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'findLastIndex', [makeArrowTrue()]))
      expect(reports.length).toBe(1)
    })

    test('handles BooleanLiteral body with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = { type: 'ArrowFunctionExpression', params: [], body: { type: 'BooleanLiteral', value: true, range: [0, 4], loc: makeLoc(1, 0, 1, 4) } }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(1)
    })

    test('handles arrow function with async: true property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = { type: 'ArrowFunctionExpression', params: [], body: { type: 'BooleanLiteral', value: true }, async: true }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(1)
    })

    test('handles arrow function with expression: true property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = { type: 'ArrowFunctionExpression', params: [], body: { type: 'BooleanLiteral', value: true }, expression: true }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(1)
    })

    test('does not report when arrow body is TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = { type: 'ArrowFunctionExpression', params: [], body: { type: 'TemplateLiteral', quasis: [], expressions: [] } }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arrow body is UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = { type: 'ArrowFunctionExpression', params: [], body: { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'BooleanLiteral', value: true } } }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arrow body is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = { type: 'ArrowFunctionExpression', params: [], body: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'flag' } } }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arrow body is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = { type: 'ArrowFunctionExpression', params: [], body: { type: 'ArrayExpression', elements: [] } }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arrow body is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexLiteralRule.create(context)
      const arrow = { type: 'ArrowFunctionExpression', params: [], body: { type: 'ObjectExpression', properties: [] } }
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [arrow]))
      expect(reports.length).toBe(0)
    })
  })
})

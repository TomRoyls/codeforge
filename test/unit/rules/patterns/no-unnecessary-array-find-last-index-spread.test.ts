import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayFindLastIndexSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-array-find-last-index-spread.js'
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

function makeSpreadArg(argument: unknown = { type: 'Identifier', name: 'items' }): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-find-last-index-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayFindLastIndexSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayFindLastIndexSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayFindLastIndexSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayFindLastIndexSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayFindLastIndexSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning findLastIndex', () => {
      const desc = noUnnecessaryArrayFindLastIndexSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/findlastindex/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayFindLastIndexSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-find-last-index-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayFindLastIndexSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayFindLastIndexSpreadRule).toBeDefined()
      expect(noUnnecessaryArrayFindLastIndexSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryArrayFindLastIndexSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (22) =====

  describe('positive cases — reports unnecessary findLastIndex spread', () => {
    test('reports for arr.findLastIndex(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for myArray.findLastIndex(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'myArray' }, 'findLastIndex', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for list.findLastIndex(...callbackArgs)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'list' }, 'findLastIndex', [makeSpreadArg({ type: 'Identifier', name: 'callbackArgs' })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions findLastIndex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/findLastIndex/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeSpreadArg()]))
      expect(reports[0].message).toBe(
        'arr.findLastIndex(...items) with spread is unusual. findLastIndex() expects a callback function.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeSpreadArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeSpreadArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeSpreadArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeSpreadArg()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'findLastIndex', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'findLastIndex', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'findLastIndex', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'findLastIndex', [makeSpreadArg({ type: 'Identifier', name: 'other' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeSpreadArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports when spread argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArgs' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'args' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'ArrayExpression', elements: [] }, alternate: { type: 'ArrayExpression', elements: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports when callee object is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }, 'findLastIndex', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports when callee object is a function call result', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArray' }, arguments: [] }, 'findLastIndex', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports when callee object is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'findLastIndex', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions callback function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/callback/)
    })

    test('reports for data.findLastIndex(...payload)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'data' }, 'findLastIndex', [makeSpreadArg({ type: 'Identifier', name: 'payload' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for items.findLastIndex(...getList())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'items' }, 'findLastIndex', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getList' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report loc end values are preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeSpreadArg()], 3, 5, 7, 42))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(42)
    })

    test('reports for empty identifier callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'x' }, 'findLastIndex', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.findLastIndex(callback) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findLastIndex() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findLastIndex(fn, thisArg) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [{ type: 'Identifier', name: 'fn' }, { type: 'Identifier', name: 'thisArg' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findIndex', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findLast(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLast', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.indexOf(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.includes(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for findLastIndex(...items) — standalone call, no member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'findLastIndex' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr["findLastIndex"](...items) — computed member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'findLastIndex' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr[variable](...items) — computed with identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'method' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'findLastIndex' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'findLastIndex' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a Literal (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is an Identifier (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [{ type: 'Identifier', name: 'callback' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [{ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "findlastindex" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findlastindex', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "FINDLASTINDEX" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'FINDLASTINDEX', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is SpreadElement but there are two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeSpreadArg(), { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when there are three SpreadElement arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeSpreadArg(), makeSpreadArg(), makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [null]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findLastIndex(x => x > 0) — arrow callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BinaryExpression', operator: '>', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 0 } } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.reduce(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduce', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.forEach(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayFindLastIndexSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayFindLastIndexSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeSpreadArg()]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [{ type: 'Identifier', name: 'fn' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'findLastIndex', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'findLastIndex', [{ type: 'Identifier', name: 'fn' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'c' }, 'findLastIndex', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'findLastIndex' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'findLastIndex' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'findLastIndex', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'findLastIndex', [{ type: 'Identifier', name: 'fn' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'c' }, 'find', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'd' }, 'findLastIndex', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'e' }, 'findLastIndex', [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      const visitor2 = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayFindLastIndexSpreadRule.meta
      const meta2 = noUnnecessaryArrayFindLastIndexSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'findLastIndex' },
        },
        arguments: [makeSpreadArg()],
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
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'findLastIndex' },
        },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'findLastIndex' },
        },
        arguments: [makeSpreadArg()],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeSpreadArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayFindLastIndexSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryArrayFindLastIndexSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayFindLastIndexSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'findLastIndex' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'findLastIndex', [makeSpreadArg()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property (not computed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'findLastIndex' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindLastIndexSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'findLastIndex' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayReduceRightSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-array-reduce-right-spread.js'
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

describe('no-unnecessary-array-reduce-right-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayReduceRightSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayReduceRightSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayReduceRightSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayReduceRightSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayReduceRightSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning reduceRight', () => {
      const desc = noUnnecessaryArrayReduceRightSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/reduceright/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayReduceRightSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-reduce-right-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayReduceRightSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayReduceRightSpreadRule).toBeDefined()
      expect(noUnnecessaryArrayReduceRightSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryArrayReduceRightSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports reduceRight with spread', () => {
    test('reports for arr.reduceRight(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for [].reduceRight(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'reduceRight', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for myObj.data.reduceRight(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'myObj' }, property: { type: 'Identifier', name: 'data' } }, 'reduceRight', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for getArr().reduceRight(...callbacks)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'reduceRight', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.reduceRight(...[fn])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Identifier', name: 'fn' }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.reduceRight(...fns) with identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg({ type: 'Identifier', name: 'fns' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.reduceRight(...getCallbacks())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getCallbacks' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.reduceRight(...obj.callbacks)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'callbacks' } })]))
      expect(reports.length).toBe(1)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg()]))
      expect(reports[0].message).toBe(
        'arr.reduceRight(...items) with spread is unusual. reduceRight() expects a callback function.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr2' }, 'reduceRight', [makeSpreadArg()]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for arr.reduceRight(...items) with spread argument being ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.reduceRight(...items) with spread argument being ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.reduceRight(...items) with Literal object callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'str' }, 'reduceRight', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.reduceRight(...items) with ObjectExpression object callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'reduceRight', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.reduceRight(...items) with ArrowFunction spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.reduceRight(...items) with TemplateLiteral spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for arr.reduceRight(...items) with FunctionExpression object callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'reduceRight', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.reduceRight(...items) with BinaryExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'reduceRight' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'reduceRight' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (42) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.reduceRight(callback) — regular callback, no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [{ type: 'Identifier', name: 'callback' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.reduceRight(fn, init) — two args, no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [{ type: 'Identifier', name: 'fn' }, { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.reduceRight() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.reduceRight(...a, ...b) — two spread args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg(), makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.reduceRight(...items, extra) — two args, one spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg(), { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.reduceRight(callback, ...items) — two args, spread second', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [{ type: 'Identifier', name: 'callback' }, makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.reduce(callback)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduce', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.forEach(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.some(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.every(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'flat', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for reduceRight(...items) — standalone function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'reduceRight' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'reduceRight' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
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
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
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

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "reduceright" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceright', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduceRight' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduceRight' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when single arg is not a SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when single arg is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [{ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when single arg is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when single arg is an ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.includes(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.indexOf(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'indexOf', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.join(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'join', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayReduceRightSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayReduceRightSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg()]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [{ type: 'Identifier', name: 'fn' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [{ type: 'Identifier', name: 'fn' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduceRight' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduceRight' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [{ type: 'Identifier', name: 'fn' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduce', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', []))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      const visitor2 = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayReduceRightSpreadRule.meta
      const meta2 = noUnnecessaryArrayReduceRightSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduceRight' },
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
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduceRight' },
        },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduceRight' },
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
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayReduceRightSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryArrayReduceRightSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayReduceRightSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduceRight' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight', [makeSpreadArg()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('does not report when callee property is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduceRight' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports when computed is explicitly false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayReduceRightSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduceRight' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })
  })
})

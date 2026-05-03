import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayAtSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-array-at-spread.js'
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

function makeAtCallNode(
  object: unknown,
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
      property: { type: 'Identifier', name: 'at' },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-at-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayAtSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayAtSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayAtSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayAtSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayAtSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning at', () => {
      const desc = noUnnecessaryArrayAtSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/\.at/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayAtSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-at-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayAtSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayAtSpreadRule).toBeDefined()
      expect(noUnnecessaryArrayAtSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryArrayAtSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports arr.at(...spread)', () => {
    test('reports for arr.at(...items) with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for [].at(...items) with ArrayExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'ArrayExpression', elements: [] },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.arr.at(...items) with MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for getArr().at(...items) with CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.at(...items) with spread of identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.at(...[1, 2, 3]) with spread of array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.at(...getItems()) with spread of call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.at(...obj.items) with spread of member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('report message contains "spread"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message contains "at()"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports[0].message).toMatch(/at\(\)/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports[0].message).toBe(
        'arr.at(...items) with spread is unusual. at() expects an index.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      const node = makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      )
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        5, 10, 5, 30,
      ))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } }],
      ))
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'b' } }],
      ))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } }],
      ))
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'b' } }],
      ))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports with Literal as callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Literal', value: 'hello' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with ObjectExpression as callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'ObjectExpression', properties: [] },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.at(...args) regardless of spread argument type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with FunctionExpression as callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports with spread of template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'TemplateLiteral', quasis: [], expressions: [] } }],
      ))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports with spread of binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } } }],
      ))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.at(0) — Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.at(-1) — negative Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 1 } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.at(x) — Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Identifier', name: 'x' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.at() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.at(1, 2) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.at(1, 2, 3) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.forEach(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.push(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'push' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.concat(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member arr["at"](...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'at' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'at' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "At" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'At' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "AT" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'AT' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is Identifier (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Identifier', name: 'index' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 5 }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getIndex' }, arguments: [] }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'idx' } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'at' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed member with at property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'at' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "at2"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'at2' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "charAt"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charAt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "flat"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for node with only type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression' })
      expect(reports.length).toBe(0)
    })

    test('does not report for callee type wrong but property name "at"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "concat"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'concat' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayAtSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayAtSpreadRule.create(ctx2)
      visitor1.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      visitor2.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Identifier', name: 'x' }],
      ))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Identifier', name: 'x' }],
      ))
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'more' } }],
      ))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 0 }],
      ))
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'at' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'more' } }],
      ))
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Identifier', name: 'idx' }],
      ))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayAtSpreadRule.create(context)
      const visitor2 = noUnnecessaryArrayAtSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayAtSpreadRule.meta
      const meta2 = noUnnecessaryArrayAtSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
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
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      const node = makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      )
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayAtSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryArrayAtSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayAtSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'at' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        10, 4, 10, 25,
      ))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports computed: false still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'at' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayAtSpreadRule.create(context)
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } }],
      ))
      visitor.CallExpression(makeAtCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'b' } }],
      ))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

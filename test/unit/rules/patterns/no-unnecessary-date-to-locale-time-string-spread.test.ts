import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryDateToLocaleTimeStringSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-date-to-locale-time-string-spread.js'
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

function makeSpreadArg(argument: unknown = { type: 'Identifier', name: 'items' }): unknown {
  return { type: 'SpreadElement', argument }
}

function makeCallNode(
  objectName: string,
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
      computed: false,
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-date-to-locale-time-string-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryDateToLocaleTimeStringSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryDateToLocaleTimeStringSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryDateToLocaleTimeStringSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDateToLocaleTimeStringSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryDateToLocaleTimeStringSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toLocaleTimeString', () => {
      const desc = noUnnecessaryDateToLocaleTimeStringSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/tolocaletimestring/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryDateToLocaleTimeStringSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-date-to-locale-time-string-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryDateToLocaleTimeStringSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryDateToLocaleTimeStringSpreadRule).toBeDefined()
      expect(noUnnecessaryDateToLocaleTimeStringSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryDateToLocaleTimeStringSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary date.toLocaleTimeString(...spread)', () => {
    test('reports for date.toLocaleTimeString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg()]))
      expect(reports.length).toBe(1)
    })

    test('reports for date.toLocaleTimeString(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for date.toLocaleTimeString(...opts)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'Identifier', name: 'opts' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for date.toLocaleTimeString(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for date.toLocaleTimeString(...config)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'Identifier', name: 'config' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for date.toLocaleTimeString(...myArgs)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'Identifier', name: 'myArgs' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'Literal', value: 'en-US' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {} })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/spread/i)
    })

    test('report message mentions toLocaleTimeString', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg()]))
      expect(reports[0].message).toMatch(/toLocaleTimeString/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg()]))
      expect(reports[0].message).toBe(
        'date.toLocaleTimeString(...items) with a single spread is unusual. Consider passing locale and options directly.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      const node = makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg()], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'Identifier', name: 'b' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for spread over ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: {}, right: {} })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over UnaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {} })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread over LogicalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'LogicalExpression', operator: '||', left: {}, right: {} })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for spread over FunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for other.toLocaleTimeString(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('other', 'toLocaleTimeString', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for myDate.toLocaleTimeString(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('myDate', 'toLocaleTimeString', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for d.toLocaleTimeString(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('d', 'toLocaleTimeString', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Date.toLocaleTimeString(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('Date', 'toLocaleTimeString', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for date.toLocaleString(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleString', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for date.toLocaleDateString(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleDateString', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for date.toString(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toString', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for date.getTime(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'getTime', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for date.toLocaleTimeString() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for date.toLocaleTimeString(locale) — non-spread arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [{ type: 'Literal', value: 'en-US' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for date.toLocaleTimeString(locale, options) — two args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [{ type: 'Literal', value: 'en-US' }, { type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for date.toLocaleTimeString(...a, ...b) — two spread args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg(), makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for date.toLocaleTimeString(...items, extra) — two args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg(), { type: 'Literal', value: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal object .toLocaleTimeString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Literal', value: 42 },
          property: { type: 'Identifier', name: 'toLocaleTimeString' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression object .toLocaleTimeString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } },
          property: { type: 'Identifier', name: 'toLocaleTimeString' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression object .toLocaleTimeString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
          property: { type: 'Identifier', name: 'toLocaleTimeString' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for computed MemberExpression date["toLocaleTimeString"](...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleTimeString' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "tolocalestring" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'tolocalestring', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for property name "ToLocaleTimeString" (different case)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'ToLocaleTimeString', [makeSpreadArg()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg()], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Literal', value: 'toLocaleTimeString' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: null,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          property: { type: 'Identifier', name: 'toLocaleTimeString' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: null,
          property: { type: 'Identifier', name: 'toLocaleTimeString' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression object .toLocaleTimeString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
          property: { type: 'Identifier', name: 'toLocaleTimeString' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for TemplateLiteral object .toLocaleTimeString(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'TemplateLiteral', quasis: [], expressions: [] },
          property: { type: 'Identifier', name: 'toLocaleTimeString' },
        },
        arguments: [makeSpreadArg()],
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
      const visitor1 = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg()]))
      visitor2.CallExpression(makeCallNode('other', 'toLocaleTimeString', [makeSpreadArg()]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode('other', 'toLocaleTimeString', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleTimeString' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleTimeString' },
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode('other', 'toLocaleTimeString', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode('date', 'toLocaleString', [makeSpreadArg()]))
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', []))
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      const visitor2 = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryDateToLocaleTimeStringSpreadRule.meta
      const meta2 = noUnnecessaryDateToLocaleTimeStringSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleTimeString' },
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
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleTimeString' },
        },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleTimeString' },
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
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      const node = makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryDateToLocaleTimeStringSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryDateToLocaleTimeStringSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryDateToLocaleTimeStringSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleTimeString' },
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeCallNode('date', 'toLocaleTimeString', [makeSpreadArg({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleTimeString' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDateToLocaleTimeStringSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'date' },
          property: { type: 'Identifier', name: 'toLocaleTimeString' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})

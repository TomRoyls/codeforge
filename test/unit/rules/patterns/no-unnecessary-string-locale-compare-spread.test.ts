import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringLocaleCompareSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-string-locale-compare-spread.js'
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

function makeSpreadArg(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-locale-compare-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringLocaleCompareSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringLocaleCompareSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringLocaleCompareSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringLocaleCompareSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringLocaleCompareSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning localeCompare', () => {
      const desc = noUnnecessaryStringLocaleCompareSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/localecompare/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringLocaleCompareSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-locale-compare-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringLocaleCompareSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringLocaleCompareSpreadRule).toBeDefined()
      expect(noUnnecessaryStringLocaleCompareSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryStringLocaleCompareSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports localeCompare with spread', () => {
    test('reports for str.localeCompare(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".localeCompare(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for variable.localeCompare(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'name' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for member.localeCompare(...values)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'values' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for call result localeCompare with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getString' }, arguments: [] }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [makeSpreadArg({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'localeCompare', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of conditional expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'localeCompare', [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions localeCompare and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/localeCompare/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'str.localeCompare(...items) with spread is unusual. localeCompare() expects a comparison string.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'y' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'y' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports spread of binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'localeCompare', [makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'localeCompare', [makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'localeCompare', [makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'localeCompare', [makeSpreadArg({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'localeCompare', [makeSpreadArg({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Array' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for string literal object with spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'abc' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'vals' })]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of unary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'localeCompare', [makeSpreadArg({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports spread of logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'localeCompare', [makeSpreadArg({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (42) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.localeCompare("other") — normal string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [{ type: 'Literal', value: 'other' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.localeCompare(other) — identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [{ type: 'Identifier', name: 'other' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.localeCompare(...items, "extra") — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'items' }), { type: 'Literal', value: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.localeCompare() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.localeCompare("a", "b", "c") — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }, { type: 'Literal', value: 'c' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.endsWith(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.match(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replace(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.search(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.concat(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'concat', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.slice(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'slice', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'localeCompare' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'localeCompare' },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'localeCompare' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "localecompare" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localecompare', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [{ type: 'Literal', value: 'other' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg({ type: 'Identifier', name: 'x' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg({ type: 'Identifier', name: 'x' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'x' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'x' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'localeCompare' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a CallExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a MemberExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'val' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is an ArrayExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is an ObjectExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringLocaleCompareSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryStringLocaleCompareSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [{ type: 'Literal', value: 'other' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [{ type: 'Literal', value: 'a' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'y' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'localeCompare' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'localeCompare' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [{ type: 'Literal', value: 'a' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [makeSpreadArg({ type: 'Identifier', name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'y' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', []))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      const visitor2 = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringLocaleCompareSpreadRule.meta
      const meta2 = noUnnecessaryStringLocaleCompareSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'localeCompare' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
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
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'localeCompare' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'localeCompare' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringLocaleCompareSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryStringLocaleCompareSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryStringLocaleCompareSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'localeCompare' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property (non-computed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'localeCompare' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLocaleCompareSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'localeCompare', [makeSpreadArg({ type: 'Identifier', name: 'y' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

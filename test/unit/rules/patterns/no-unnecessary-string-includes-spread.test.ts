import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringIncludesSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-string-includes-spread.js'
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
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadArg(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-includes-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringIncludesSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringIncludesSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringIncludesSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringIncludesSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringIncludesSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning includes', () => {
      const desc = noUnnecessaryStringIncludesSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/includes/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringIncludesSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-includes-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringIncludesSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringIncludesSpreadRule).toBeDefined()
      expect(noUnnecessaryStringIncludesSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryStringIncludesSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports str.includes(...items)', () => {
    test('reports for str.includes(...items) with Identifier spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.includes(...items) with ArrayExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [makeSpreadArg({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.includes(...args) with MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for literal.includes(...items) with string Literal object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for fn().includes(...items) with CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Literal', value: 42 })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions includes and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/includes/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'str.includes(...items) with spread is unusual. includes() expects a search string and optional position.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'y' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'y' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports when spread argument is a ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'cond' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is an ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports when object is an ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports when object is a NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports when spread argument is an ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports when spread argument is a LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.includes("x") — no spread, Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes(x) — no spread, Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes(...items, extra) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' }), { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes() — zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes'))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes("x", 0) — two non-spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.indexOf(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.find(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'find', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.map(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'map', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.filter(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'filter', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.some(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'some', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.every(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'every', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.reduce(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'reduce', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.match(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.search(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.startsWith(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'startsWith', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.endsWith(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'endsWith', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is "Includes" (capital I)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'Includes', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is "INCLUDES" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'INCLUDES', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier (Literal property)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed with string Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'includes' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed with Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'includes' },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for three arguments with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' }), { type: 'Literal', value: 'x' }, { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is Literal (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: 'search' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is CallExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getSearch' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is MemberExpression (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'search' } }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringIncludesSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryStringIncludesSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: 'x' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: 'x' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'more' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [{ type: 'Literal', value: 'x' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'more' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' }), { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringIncludesSpreadRule.create(context)
      const visitor2 = noUnnecessaryStringIncludesSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringIncludesSpreadRule.meta
      const meta2 = noUnnecessaryStringIncludesSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
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
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
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
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringIncludesSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryStringIncludesSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryStringIncludesSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'x' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'y' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles arguments array with single null element (not SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringIncludesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [null]))
      expect(reports.length).toBe(0)
    })
  })
})

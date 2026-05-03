import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringAnchorSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-string-anchor-spread.js'
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

describe('no-unnecessary-string-anchor-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringAnchorSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringAnchorSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringAnchorSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringAnchorSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringAnchorSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning anchor', () => {
      const desc = noUnnecessaryStringAnchorSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/anchor/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringAnchorSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-anchor-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringAnchorSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringAnchorSpreadRule).toBeDefined()
      expect(noUnnecessaryStringAnchorSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryStringAnchorSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports anchor with spread', () => {
    test('reports for str.anchor(...items) with identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.anchor(...arr) with array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for "hello".anchor(...args)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.anchor(...obj)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.anchor(...getItems())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.str.anchor(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'str' } }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.anchor(...[1, 2, 3])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions anchor with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/anchor/)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'str.anchor(...items) with spread is unusual. anchor() expects a name string.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'x' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for str.anchor(...fn())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.anchor(...new Set())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for template literal anchor(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for parenthesized expression (.anchor(...items))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'paren' }, 'anchor', [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.anchor(...conditional)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for chained call result.anchor(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getString' }, arguments: [] }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.anchor(...obj.props)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'props' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.anchor(...(a ? b : c))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'a' }, consequent: { type: 'Identifier', name: 'b' }, alternate: { type: 'Identifier', name: 'c' } })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (46) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.anchor("name") — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [{ type: 'Literal', value: 'name' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.anchor() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.anchor(...items, extra) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' }), { type: 'Literal', value: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.anchor(arg1, arg2) — two non-spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.link(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'link', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toUpperCase(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toUpperCase', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.toLowerCase(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'toLowerCase', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.concat(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'concat', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.includes(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for anchor(...items) — non-member callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'anchor' }, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'anchor' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Anchor" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'Anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "anchors" (plural)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchors', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
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
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
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

    test('does not report when arg is not SpreadElement — regular Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is not SpreadElement — Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [{ type: 'Identifier', name: 'name' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is not SpreadElement — CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getName' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg is not SpreadElement — MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'name' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.anchor(templateLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'anchor' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'anchor' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "anchor" but computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'anchor' },
          computed: true,
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression({ type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'fn' }, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for str.anchor(nameVariable)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [{ type: 'Identifier', name: 'nameVariable' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.anchor("") — empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.anchor(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('reports when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'anchor' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'anchor' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when property name is "anchor" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [{ type: 'Identifier', name: 'name' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.anchor(undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (12) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringAnchorSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryStringAnchorSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [{ type: 'Literal', value: 'name' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [{ type: 'Literal', value: 'name' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'more' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'anchor' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'anchor' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [{ type: 'Literal', value: 'name' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'link', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', []))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'more' })]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringAnchorSpreadRule.create(context)
      const visitor2 = noUnnecessaryStringAnchorSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringAnchorSpreadRule.meta
      const meta2 = noUnnecessaryStringAnchorSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'anchor' },
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
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'anchor' },
        },
        arguments: [makeSpreadArg({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'anchor' },
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
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringAnchorSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryStringAnchorSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryStringAnchorSpreadRule.meta).toBe('object')
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringAnchorSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'x' }, 'anchor', [makeSpreadArg({ type: 'Identifier', name: 'args' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

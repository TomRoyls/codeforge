import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayEveryTrueRule } from '../../../../src/rules/patterns/index.js'
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
    getSource: () => 'arr.every(true)',
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

function makeEveryTrueNode(
  object: unknown,
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
      object,
      property: { type: 'Identifier', name: 'every' },
    },
    arguments: [{ type: 'BooleanLiteral', value: true }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-every-true rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayEveryTrueRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayEveryTrueRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayEveryTrueRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayEveryTrueRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayEveryTrueRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning every(true)', () => {
      const desc = noUnnecessaryArrayEveryTrueRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/every/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayEveryTrueRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-every-true.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayEveryTrueRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayEveryTrueRule).toBeDefined()
      expect(noUnnecessaryArrayEveryTrueRule.meta).toBeDefined()
      expect(noUnnecessaryArrayEveryTrueRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports arr.every(true)', () => {
    test('reports for arr.every(true) with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'arr' }))
      expect(reports.length).toBe(1)
    })

    test('reports for items.every(true) with different Identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'items' }))
      expect(reports.length).toBe(1)
    })

    test('reports for list.every(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'list' }))
      expect(reports.length).toBe(1)
    })

    test('reports for data.every(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'data' }))
      expect(reports.length).toBe(1)
    })

    test('reports for results.every(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'results' }))
      expect(reports.length).toBe(1)
    })

    test('reports for [].every(true) with ArrayExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.arr.every(true) with MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for getArr().every(true) with CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions arr.every(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'arr' }))
      expect(reports[0].message).toMatch(/every/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'arr' }))
      expect(reports[0].message).toBe(
        'arr.every(true) always returns true. Use a predicate function instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'arr' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'arr' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      const node = makeEveryTrueNode({ type: 'Identifier', name: 'arr' })
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'arr' }, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'arr' }))
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'items' }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'arr' }))
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'items' }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'arr' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'arr' }, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports for [1, 2, 3].every(true) with non-empty ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] }))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.items.every(true) with nested MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({
        type: 'MemberExpression',
        object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'state' }, property: { type: 'Identifier', name: 'data' } },
        property: { type: 'Identifier', name: 'items' },
      }))
      expect(reports.length).toBe(1)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [{ type: 'BooleanLiteral', value: true }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node with extra properties still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      const node = makeEveryTrueNode({ type: 'Identifier', name: 'arr' })
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('reports for args.every(true) with Identifier object "args"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'args' }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (45) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.every(false) — BooleanLiteral false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'every' } },
        arguments: [{ type: 'BooleanLiteral', value: false }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.every(x => x) — ArrowFunction arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'every' } },
        arguments: [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'Identifier', name: 'x' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.every(function(x) { return x }) — FunctionExpression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'every' } },
        arguments: [{ type: 'FunctionExpression', id: null, params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BlockStatement', body: [] } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.every() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'every' } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.every(true, false) — 2 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'every' } },
        arguments: [{ type: 'BooleanLiteral', value: true }, { type: 'BooleanLiteral', value: false }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.every(true, true) — 2 arguments both true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'every' } },
        arguments: [{ type: 'BooleanLiteral', value: true }, { type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.some(true) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'some' } },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(true) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'filter' } },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(true) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'map' } },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find(true) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'find' } },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.includes(true) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'includes' } },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.forEach(true) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'forEach' } },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.reduce(true) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'reduce' } },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'BooleanLiteral', value: true }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'BooleanLiteral', value: true }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression — Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'BooleanLiteral', value: true }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression — CallExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, arguments: [{ type: 'BooleanLiteral', value: true }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier — Literal property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'every' },
        },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier — MemberExpression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' } },
        },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Every" — case sensitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'Every' } },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "EVERY" — all caps', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'EVERY' } },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "everyy" — typo', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'everyy' } },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member expression arr["every"](true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'every' },
        },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'every' } },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'every' } },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is Literal instead of BooleanLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'every' } },
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'every' } },
        arguments: [{ type: 'Identifier', name: 'predicate' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is NumericLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'every' } },
        arguments: [{ type: 'Literal', value: 1 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'every' } },
        arguments: [{ type: 'Literal', value: 'true' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is BooleanLiteral with undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'every' } },
        arguments: [{ type: 'BooleanLiteral' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee has computed true and Identifier property named every', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "everywhere"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'everywhere' } },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayEveryTrueRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayEveryTrueRule.create(ctx2)
      visitor1.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'arr' }))
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'every' } },
        arguments: [{ type: 'BooleanLiteral', value: false }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'arr' }))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'every' } },
        arguments: [{ type: 'BooleanLiteral', value: false }],
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'items' }))
      expect(reports.length).toBe(2)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [{ type: 'BooleanLiteral', value: true }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'arr' }))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'every' } },
        arguments: [{ type: 'BooleanLiteral', value: false }],
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'every' } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', computed: false, object: { type: 'Identifier', name: 'arr' }, property: { type: 'Identifier', name: 'some' } },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayEveryTrueRule.create(context)
      const visitor2 = noUnnecessaryArrayEveryTrueRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayEveryTrueRule.meta
      const meta2 = noUnnecessaryArrayEveryTrueRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'arr' }))
      visitor.CallExpression(makeEveryTrueNode({ type: 'Identifier', name: 'items' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayEveryTrueRule).toBeDefined()
      expect(typeof noUnnecessaryArrayEveryTrueRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayEveryTrueRule.meta).toBe('object')
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('handles computed: undefined as falsy — still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: undefined,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('handles computed missing from MemberExpression — still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryTrueRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [{ type: 'BooleanLiteral', value: true }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })
  })
})

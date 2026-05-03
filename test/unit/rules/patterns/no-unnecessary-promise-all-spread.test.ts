import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryPromiseAllSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-promise-all-spread.js'
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

function makePromiseAllNode(
  objectName: string,
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: methodName },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadElement(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-promise-all-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryPromiseAllSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryPromiseAllSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryPromiseAllSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryPromiseAllSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryPromiseAllSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Promise.all', () => {
      const desc = noUnnecessaryPromiseAllSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/promise\.all/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryPromiseAllSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-promise-all-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryPromiseAllSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryPromiseAllSpreadRule).toBeDefined()
      expect(noUnnecessaryPromiseAllSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryPromiseAllSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Promise.all(...items)', () => {
    test('reports for Promise.all(...items) with Identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all(...arr) with short variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all(...promises)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'promises' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all(...getItems())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all(...obj.items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all(...[a, b, c])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'ArrayExpression', elements: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }] })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Promise.all', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/Promise\.all/)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/spread/i)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'Promise.all(...items) with spread is unusual. all() expects a single iterable of promises.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      const node = makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })], 5, 10, 5, 40))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Promise.all(...nested.deep.items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'nested' }, property: { type: 'Identifier', name: 'deep' } }, property: { type: 'Identifier', name: 'items' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all(...fn()) with function call spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all(...args) where spread arg is a literal array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all(...x) where spread arg is AwaitExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'asyncItems' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all(...x) where spread arg is ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'cond' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all(...x) where spread arg is TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all(...x) where spread arg is BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all(...x) where spread arg is a ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all(...x) where spread arg is a NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all(...x) where spread arg is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Literal', value: 42 })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Promise.all(items) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [{ type: 'Identifier', name: 'items' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.all([a, b]) — array literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [{ type: 'ArrayExpression', elements: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.all([]) — empty array argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.race(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'race', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.allSettled(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'allSettled', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.any(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'any', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.resolve(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'resolve', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for MyPromise.all(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('MyPromise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.all(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('obj', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.all(...a, ...b) — two spread arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'a' }), makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.all() — zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.all(items, opts) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [{ type: 'Identifier', name: 'items' }, { type: 'Identifier', name: 'opts' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'Promise' }, arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'global' }, property: { type: 'Identifier', name: 'Promise' } },
          property: { type: 'Identifier', name: 'all' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Literal', value: 'all' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is "All" (case-sensitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'All', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is "ALL" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'ALL', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object name is "promise" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed member access', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'all' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'all' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'all' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: null,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.all(getItems()) — CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.all(obj.items) — MemberExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.all(literal) — Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryPromiseAllSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryPromiseAllSpreadRule.create(ctx2)
      visitor1.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makePromiseAllNode('Promise', 'all', [{ type: 'Identifier', name: 'items' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [{ type: 'Identifier', name: 'items' }]))
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'all' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'all' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [{ type: 'Identifier', name: 'items' }]))
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makePromiseAllNode('MyPromise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makePromiseAllNode('Promise', 'race', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryPromiseAllSpreadRule.create(context)
      const visitor2 = noUnnecessaryPromiseAllSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryPromiseAllSpreadRule.meta
      const meta2 = noUnnecessaryPromiseAllSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'all' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
        range: [0, 30],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'all' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'all' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      const node = makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryPromiseAllSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryPromiseAllSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryPromiseAllSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'all' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 30),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })], 10, 4, 10, 35))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'all' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'all' },
          computed: false,
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('Promise', 'all', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object name is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllNode('', 'all', [makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })


  })
})

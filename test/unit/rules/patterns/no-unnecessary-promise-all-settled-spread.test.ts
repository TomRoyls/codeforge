import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryPromiseAllSettledSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-promise-all-settled-spread.js'
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

function makePromiseAllSettledCallNode(
  objectName: string,
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
  computed = false,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: methodName },
      computed,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadElement(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

function makeIdentifier(name: string): unknown {
  return { type: 'Identifier', name }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-promise-all-settled-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryPromiseAllSettledSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryPromiseAllSettledSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryPromiseAllSettledSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryPromiseAllSettledSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryPromiseAllSettledSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Promise.allSettled', () => {
      const desc = noUnnecessaryPromiseAllSettledSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/allsettled/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryPromiseAllSettledSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-promise-all-settled-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryPromiseAllSettledSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryPromiseAllSettledSpreadRule).toBeDefined()
      expect(noUnnecessaryPromiseAllSettledSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryPromiseAllSettledSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary Promise.allSettled spread', () => {
    test('reports for Promise.allSettled(...items) with spread identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('items'))]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.allSettled(...promises)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('promises'))]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.allSettled(...results)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('results'))]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.allSettled(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('arr'))]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of member expression obj.items', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement({ type: 'MemberExpression', object: makeIdentifier('obj'), property: makeIdentifier('items') })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of array expression [...[1,2,3]]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of call expression ...getItems()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement({ type: 'CallExpression', callee: makeIdentifier('getItems'), arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of conditional expression ...(cond ? a : b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement({ type: 'ConditionalExpression', test: makeIdentifier('cond'), consequent: makeIdentifier('a'), alternate: makeIdentifier('b') })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Promise.allSettled', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('items'))]))
      expect(reports[0].message).toMatch(/allSettled/)
    })

    test('report message mentions spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('items'))]))
      expect(reports[0].message).toMatch(/spread/i)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('items'))]))
      expect(reports[0].message).toBe(
        'Promise.allSettled(...items) with spread is unusual. allSettled() expects a single iterable of promises.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('items'))]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('items'))]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      const node = makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('items'))])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('items'))], 5, 10, 5, 40))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('items'))]))
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('more'))]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('items'))]))
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('more'))]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for spread of ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of ArrowFunction result', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement({ type: 'CallExpression', callee: { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement({ type: 'BinaryExpression', operator: '+', left: makeIdentifier('a'), right: makeIdentifier('b') })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('items'))]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for spread of logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement({ type: 'LogicalExpression', operator: '||', left: makeIdentifier('a'), right: makeIdentifier('b') })]))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of parenthesized expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement({ type: 'ParenthesizedExpression', expression: makeIdentifier('items') })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Promise.allSettled(items) without spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeIdentifier('items')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.allSettled([a, b, c]) array argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [{ type: 'ArrayExpression', elements: [makeIdentifier('a'), makeIdentifier('b'), makeIdentifier('c')] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.allSettled() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.allSettled(a, b) with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeIdentifier('a'), makeIdentifier('b')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.all(...items) — wrong method all', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'all', [makeSpreadElement(makeIdentifier('items'))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.race(...items) — wrong method race', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'race', [makeSpreadElement(makeIdentifier('items'))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.any(...items) — wrong method any', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'any', [makeSpreadElement(makeIdentifier('items'))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.resolve(...items) — wrong method resolve', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'resolve', [makeSpreadElement(makeIdentifier('items'))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.allSettled(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('foo', 'allSettled', [makeSpreadElement(makeIdentifier('items'))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for MyPromise.allSettled(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('MyPromise', 'allSettled', [makeSpreadElement(makeIdentifier('items'))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for promise.allSettled(...items) — lowercase object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('promise', 'allSettled', [makeSpreadElement(makeIdentifier('items'))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('Promise'),
          property: { type: 'Literal', value: 'allSettled' },
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('items'))], 1, 0, 1, 30, true))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: makeIdentifier('getPromise'), arguments: [] },
          property: { type: 'Identifier', name: 'allSettled' },
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: makeIdentifier('window'), property: makeIdentifier('Promise') },
          property: { type: 'Identifier', name: 'allSettled' },
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'allSettled' },
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'allSettled' },
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('Promise'),
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('Promise'),
          property: null,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeIdentifier('items')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('Promise'),
          property: { type: 'Identifier', name: 'allSettled' },
        },
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "allsettled" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allsettled', [makeSpreadElement(makeIdentifier('items'))]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a Literal type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'Promise' },
          property: { type: 'Identifier', name: 'allSettled' },
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryPromiseAllSettledSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryPromiseAllSettledSpreadRule.create(ctx2)
      visitor1.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('items'))]))
      visitor2.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeIdentifier('items')]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('items'))]))
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeIdentifier('items')]))
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('more'))]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('Promise'),
          property: { type: 'Identifier', name: 'allSettled' },
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('Promise'),
          property: { type: 'Identifier', name: 'allSettled' },
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeIdentifier('items')]))
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('items'))]))
      visitor.CallExpression(makePromiseAllSettledCallNode('foo', 'allSettled', [makeSpreadElement(makeIdentifier('items'))]))
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('more'))]))
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'all', [makeSpreadElement(makeIdentifier('items'))]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      const visitor2 = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryPromiseAllSettledSpreadRule.meta
      const meta2 = noUnnecessaryPromiseAllSettledSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('Promise'),
          property: { type: 'Identifier', name: 'allSettled' },
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
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
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('Promise'),
          property: { type: 'Identifier', name: 'allSettled' },
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('Promise'),
          property: { type: 'Identifier', name: 'allSettled' },
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      const node = makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('items'))])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryPromiseAllSettledSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryPromiseAllSettledSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryPromiseAllSettledSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('Promise'),
          property: { type: 'Identifier', name: 'allSettled' },
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 30),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('items'))], 10, 4, 10, 45))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(45)
    })

    test('handles computed member expression property — does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('Promise'),
          property: { type: 'Identifier', name: 'allSettled' },
          computed: true,
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('items'))]))
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('more'))]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when first argument is SpreadElement plus more args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('items')), makeIdentifier('extra')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdentifier('Promise'),
          property: { type: 'Identifier', name: 'allSettled' },
        },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('handles SpreadElement with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [{ type: 'SpreadElement', argument: null }]))
      expect(reports.length).toBe(1)
    })

    test('does not report for function expression call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        arguments: [makeSpreadElement(makeIdentifier('items'))],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.allSettled with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllSettledSpreadRule.create(context)
      visitor.CallExpression(makePromiseAllSettledCallNode('Promise', 'allSettled', [makeSpreadElement(makeIdentifier('items')), makeIdentifier('b'), makeIdentifier('c')]))
      expect(reports.length).toBe(0)
    })
  })
})

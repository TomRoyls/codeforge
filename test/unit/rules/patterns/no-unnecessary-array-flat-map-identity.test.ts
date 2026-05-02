import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayFlatMapIdentityRule } from '../../../../src/rules/patterns/no-unnecessary-array-flat-map-identity.js'
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

function makeIdentityArrowArg(paramName: string): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [{ type: 'Identifier', name: paramName }],
    body: { type: 'Identifier', name: paramName },
  }
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

function makeIdExpr(name: string): unknown {
  return { type: 'Identifier', name }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-flat-map-identity rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayFlatMapIdentityRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayFlatMapIdentityRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayFlatMapIdentityRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayFlatMapIdentityRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayFlatMapIdentityRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning flatMap', () => {
      const desc = noUnnecessaryArrayFlatMapIdentityRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/flatmap/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayFlatMapIdentityRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-flat-map-identity.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayFlatMapIdentityRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayFlatMapIdentityRule).toBeDefined()
      expect(noUnnecessaryArrayFlatMapIdentityRule.meta).toBeDefined()
      expect(noUnnecessaryArrayFlatMapIdentityRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (35) =====

  describe('positive cases — reports unnecessary flatMap identity', () => {
    test('reports for arr.flatMap(x => x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('x')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flatMap(item => item)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('item')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flatMap(val => val)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('val')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flatMap(el => el)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('el')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flatMap(e => e)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('e')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flatMap(t => t)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('t')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flatMap(n => n)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('n')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flatMap(_ => _)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('_')]))
      expect(reports.length).toBe(1)
    })

    test('reports for data.flatMap(row => row)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('data'), 'flatMap', [makeIdentityArrowArg('row')]))
      expect(reports.length).toBe(1)
    })

    test('reports for nested.flatMap(sub => sub)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('nested'), 'flatMap', [makeIdentityArrowArg('sub')]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions flatMap', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('x')]))
      expect(reports[0].message).toMatch(/flatMap/)
    })

    test('report message mentions flat()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('x')]))
      expect(reports[0].message).toMatch(/flat\(\)/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('x')]))
      expect(reports[0].message).toBe(
        'arr.flatMap(x => x) is equivalent to arr.flat(). Use arr.flat() directly.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('x')]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('x')]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      const node = makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('x')])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('x')], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('x')]))
      visitor.CallExpression(makeCallNode(makeIdExpr('items'), 'flatMap', [makeIdentityArrowArg('i')]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('x')]))
      visitor.CallExpression(makeCallNode(makeIdExpr('items'), 'flatMap', [makeIdentityArrowArg('i')]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('x')]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for chained method arr.map().flatMap(x => x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      const mapResult = { type: 'CallExpression', callee: { type: 'MemberExpression', object: makeIdExpr('arr'), property: { type: 'Identifier', name: 'map' } }, arguments: [] }
      visitor.CallExpression(makeCallNode(mapResult, 'flatMap', [makeIdentityArrowArg('x')]))
      expect(reports.length).toBe(1)
    })

    test('reports for long parameter name arr.flatMap(element => element)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('element')]))
      expect(reports.length).toBe(1)
    })

    test('reports for this.items.flatMap(entry => entry)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      const thisItems = { type: 'MemberExpression', object: { type: 'ThisExpression' }, property: { type: 'Identifier', name: 'items' }, computed: false }
      visitor.CallExpression(makeCallNode(thisItems, 'flatMap', [makeIdentityArrowArg('entry')]))
      expect(reports.length).toBe(1)
    })

    test('reports for getItems().flatMap(result => result)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      const callResult = { type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] }
      visitor.CallExpression(makeCallNode(callResult, 'flatMap', [makeIdentityArrowArg('result')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flatMap(a => a) with single-letter param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('a')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flatMap(z => z) with last-letter param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('z')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flatMap(y => y)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('y')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flatMap(i => i)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('i')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flatMap(v => v)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('v')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flatMap(node => node)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('node')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flatMap(child => child)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('child')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flatMap(prop => prop)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('prop')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flatMap(m => m)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('m')]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.flatMap(k => k)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('k')]))
      expect(reports.length).toBe(1)
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.flatMap(x => x * 2) — transform expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BinaryExpression', operator: '*', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 2 } },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flatMap(x => [x]) — wraps in array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'ArrayExpression', elements: [{ type: 'Identifier', name: 'x' }] },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(x => x) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'map', [makeIdentityArrowArg('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat() — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flat', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flatMap() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flatMap(function(x) { return x; }) — not arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [{
        type: 'FunctionExpression',
        id: null,
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'x' } }] },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flatMap(x => y) — param name differs from body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'Identifier', name: 'y' },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flatMap(x => x, extra) — two args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('x'), { type: 'Identifier', name: 'thisArg' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flatMap(x => x, null) — two args with null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('x'), { type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flatMap((x, i) => x) — two params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'i' }],
        body: { type: 'Identifier', name: 'x' },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flatMap(() => x) — zero params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [{
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'Identifier', name: 'x' },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(x => x) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'filter', [makeIdentityArrowArg('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.forEach(x => x) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'forEach', [makeIdentityArrowArg('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.reduce(x => x) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'reduce', [makeIdentityArrowArg('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.every(x => x) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'every', [makeIdentityArrowArg('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.some(x => x) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'some', [makeIdentityArrowArg('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'flatMap' }, arguments: [makeIdentityArrowArg('x')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdExpr('arr'),
          property: { type: 'Literal', value: 'flatMap' },
          computed: true,
        },
        arguments: [makeIdentityArrowArg('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "flatmap" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatmap', [makeIdentityArrowArg('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeIdentityArrowArg('x')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeIdentityArrowArg('x')], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arg body is a BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'x' } }] },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg body is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg param is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'RestElement', argument: { type: 'Identifier', name: 'args' } }],
        body: { type: 'Identifier', name: 'args' },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg body is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arg params is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [{
        type: 'ArrowFunctionExpression',
        body: { type: 'Identifier', name: 'x' },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flatMap(x => x.toString()) — method call body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'x' }, property: { type: 'Identifier', name: 'toString' } }, arguments: [] },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdExpr('arr'),
        },
        arguments: [makeIdentityArrowArg('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdExpr('arr'),
          property: null,
        },
        arguments: [makeIdentityArrowArg('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member expression arr["flatMap"](x => x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdExpr('arr'),
          property: { type: 'Literal', value: 'flatMap' },
          computed: true,
        },
        arguments: [makeIdentityArrowArg('x')],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayFlatMapIdentityRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayFlatMapIdentityRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('x')]))
      visitor2.CallExpression(makeCallNode(makeIdExpr('arr'), 'map', [makeIdentityArrowArg('x')]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('x')]))
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'map', [makeIdentityArrowArg('x')]))
      visitor.CallExpression(makeCallNode(makeIdExpr('items'), 'flatMap', [makeIdentityArrowArg('item')]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdExpr('arr'),
          property: { type: 'Identifier', name: 'flatMap' },
          computed: false,
        },
        arguments: [makeIdentityArrowArg('x')],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdExpr('arr'),
          property: { type: 'Identifier', name: 'flatMap' },
          computed: false,
        },
        arguments: [makeIdentityArrowArg('x')],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('x')])) // report
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'map', [makeIdentityArrowArg('x')])) // no report
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BinaryExpression', operator: '*', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 2 } },
      }])) // no report — transform
      visitor.CallExpression(makeCallNode(makeIdExpr('items'), 'flatMap', [makeIdentityArrowArg('item')])) // report
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [])) // no report — no args
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      const visitor2 = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayFlatMapIdentityRule.meta
      const meta2 = noUnnecessaryArrayFlatMapIdentityRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdExpr('arr'),
          property: { type: 'Identifier', name: 'flatMap' },
          computed: false,
        },
        arguments: [makeIdentityArrowArg('x')],
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
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdExpr('arr'),
          property: { type: 'Identifier', name: 'flatMap' },
          computed: false,
        },
        arguments: [makeIdentityArrowArg('x')],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdExpr('arr'),
          property: { type: 'Identifier', name: 'flatMap' },
          computed: false,
        },
        arguments: [makeIdentityArrowArg('x')],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      const node = makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('x')])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayFlatMapIdentityRule).toBeDefined()
      expect(typeof noUnnecessaryArrayFlatMapIdentityRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayFlatMapIdentityRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdExpr('arr'),
          property: { type: 'Identifier', name: 'flatMap' },
          computed: false,
        },
        arguments: [makeIdentityArrowArg('x')],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('x')], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatMapIdentityRule.create(context)
      visitor.CallExpression(makeCallNode(makeIdExpr('arr'), 'flatMap', [makeIdentityArrowArg('x')]))
      visitor.CallExpression(makeCallNode(makeIdExpr('items'), 'flatMap', [makeIdentityArrowArg('item')]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

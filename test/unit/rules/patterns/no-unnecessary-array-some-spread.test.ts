import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArraySomeSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-array-some-spread.js'
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

function makeSomeCallNode(
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
      property: { type: 'Identifier', name: 'some' },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadArg(argument: unknown = { type: 'Identifier', name: 'items' }): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-some-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArraySomeSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArraySomeSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArraySomeSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArraySomeSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArraySomeSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning some', () => {
      const desc = noUnnecessaryArraySomeSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/some/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArraySomeSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-some-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArraySomeSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArraySomeSpreadRule).toBeDefined()
      expect(noUnnecessaryArraySomeSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryArraySomeSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports arr.some(...items)', () => {
    test('reports for arr.some(...items) with identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [makeSpreadArg({ type: 'Identifier', name: 'items' })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.some(...items) with array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [makeSpreadArg({ type: 'ArrayExpression', elements: [] })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.some(...items) with call expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.arr.some(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } },
        [makeSpreadArg()],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for getData().some(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'getData' }, arguments: [] },
        [makeSpreadArg()],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for [1, 2, 3].some(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] },
        [makeSpreadArg()],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for list.some(...args) with member expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'list' },
        [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'args' } })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports report message mentions spread and some', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [makeSpreadArg()],
      ))
      expect(reports[0].message).toMatch(/some/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [makeSpreadArg()],
      ))
      expect(reports[0].message).toBe(
        'arr.some(...items) with spread is unusual. some() expects a callback function.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [makeSpreadArg()],
      ))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [makeSpreadArg()],
      ))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      const node = makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [makeSpreadArg()],
      )
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [makeSpreadArg()],
        5, 10, 5, 30,
      ))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode({ type: 'Identifier', name: 'a' }, [makeSpreadArg()]))
      visitor.CallExpression(makeSomeCallNode({ type: 'Identifier', name: 'b' }, [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode({ type: 'Identifier', name: 'a' }, [makeSpreadArg()]))
      visitor.CallExpression(makeSomeCallNode({ type: 'Identifier', name: 'b' }, [makeSpreadArg()]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for result.some(...getValues())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'result' },
        [makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValues' }, arguments: [] })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for nested member access a.b.c.some(...x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'a' },
            property: { type: 'Identifier', name: 'b' },
          },
          property: { type: 'Identifier', name: 'c' },
        },
        [makeSpreadArg()],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.some(...[1, 2, 3]) with array literal in spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [makeSpreadArg({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.some(...new Set()) with NewExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [makeSpreadArg({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for items.some(...obj.prop) with MemberExpression spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'items' },
        [makeSpreadArg({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.some(...arr2) with identifier spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [makeSpreadArg({ type: 'Identifier', name: 'arr2' })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for [].some(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'ArrayExpression', elements: [] },
        [makeSpreadArg()],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for data.filter(x).some(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'data' }, property: { type: 'Identifier', name: 'filter' } }, arguments: [{ type: 'Identifier', name: 'x' }] },
        [makeSpreadArg()],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.some(...{ length: 3 }) — SpreadElement with ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [makeSpreadArg({ type: 'ObjectExpression', properties: [] })],
      ))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.some(...(a ? b : c)) — SpreadElement with ConditionalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [makeSpreadArg({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'a' }, consequent: { type: 'Identifier', name: 'b' }, alternate: { type: 'Identifier', name: 'c' } })],
      ))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.some(callback) — regular function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Identifier', name: 'callback' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.some(() => true) — arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'Literal', value: true } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.some(function(x) { return x > 0; })', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'FunctionExpression', id: null, params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BlockStatement', body: [] } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.some(x => x > 0, thisArg) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [
          { type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'Identifier', name: 'x' } },
          { type: 'Identifier', name: 'thisArg' },
        ],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.some(...items, extra) — two arguments with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [makeSpreadArg(), { type: 'Identifier', name: 'extra' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.some() — zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.every(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'every' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.forEach(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'map' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.includes(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.reduce(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduce' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr["some"](...items) — computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'some' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'some' },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'some' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Some" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'Some' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "some1"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some1' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "something"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'something' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
          computed: false,
        },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
          computed: false,
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is not a SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Literal', value: 42 }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'Identifier', name: 'fn' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getCb' }, arguments: [] }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when single argument is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'cb' } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "some" but property type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'StringLiteral', value: 'some' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for three arguments with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode(
        { type: 'Identifier', name: 'arr' },
        [makeSpreadArg(), { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }],
      ))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArraySomeSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryArraySomeSpreadRule.create(ctx2)
      visitor1.CallExpression(makeSomeCallNode({ type: 'Identifier', name: 'a' }, [makeSpreadArg()]))
      visitor2.CallExpression(makeSomeCallNode({ type: 'Identifier', name: 'b' }, [{ type: 'Identifier', name: 'cb' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode({ type: 'Identifier', name: 'a' }, [makeSpreadArg()]))
      visitor.CallExpression(makeSomeCallNode({ type: 'Identifier', name: 'b' }, [{ type: 'Identifier', name: 'cb' }]))
      visitor.CallExpression(makeSomeCallNode({ type: 'Identifier', name: 'c' }, [makeSpreadArg()]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode({ type: 'Identifier', name: 'a' }, [makeSpreadArg()]))
      visitor.CallExpression(makeSomeCallNode({ type: 'Identifier', name: 'b' }, [{ type: 'Identifier', name: 'cb' }]))
      visitor.CallExpression(makeSomeCallNode({ type: 'Identifier', name: 'c' }, []))
      visitor.CallExpression(makeSomeCallNode({ type: 'Identifier', name: 'd' }, [makeSpreadArg()]))
      visitor.CallExpression(makeSomeCallNode({ type: 'Identifier', name: 'e' }, [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArraySomeSpreadRule.create(context)
      const visitor2 = noUnnecessaryArraySomeSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArraySomeSpreadRule.meta
      const meta2 = noUnnecessaryArraySomeSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
          computed: false,
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
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
          computed: false,
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
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      const node = makeSomeCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArraySomeSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryArraySomeSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryArraySomeSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
          computed: false,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode({ type: 'Identifier', name: 'arr' }, [makeSpreadArg()], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('does not report when callee property is computed with identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
          computed: true,
        },
        arguments: [makeSpreadArg()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeSpreadRule.create(context)
      visitor.CallExpression(makeSomeCallNode({ type: 'Identifier', name: 'a' }, [makeSpreadArg()]))
      visitor.CallExpression(makeSomeCallNode({ type: 'Identifier', name: 'b' }, [makeSpreadArg()]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

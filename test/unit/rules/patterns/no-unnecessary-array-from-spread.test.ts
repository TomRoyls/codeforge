import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayFromSpread } from '../../../../src/rules/patterns/no-unnecessary-array-from-spread.js'
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

function makeSpreadEl(arg: unknown): unknown {
  return { type: 'SpreadElement', argument: arg }
}

function makeArrayExpr(elements: unknown[]): unknown {
  return { type: 'ArrayExpression', elements }
}

function makeArrayFromCall(
  arg: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: 'Array' },
      property: { type: 'Identifier', name: 'from' },
    },
    arguments: [arg],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeArrayFromCallMulti(
  args: unknown[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: 'Array' },
      property: { type: 'Identifier', name: 'from' },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-from-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayFromSpread.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayFromSpread.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayFromSpread.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayFromSpread.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayFromSpread.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Array.from', () => {
      const desc = noUnnecessaryArrayFromSpread.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/array\.from/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayFromSpread.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-from-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayFromSpread.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayFromSpread).toBeDefined()
      expect(noUnnecessaryArrayFromSpread.meta).toBeDefined()
      expect(noUnnecessaryArrayFromSpread.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (37) =====

  describe('positive cases — reports unnecessary Array.from with spread', () => {
    test('reports for Array.from([...arr]) — single spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([...other]) — different identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'other' })])))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([...a, ...b]) — two spreads', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        makeSpreadEl({ type: 'Identifier', name: 'a' }),
        makeSpreadEl({ type: 'Identifier', name: 'b' }),
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([...a, ...b, ...c]) — three spreads', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        makeSpreadEl({ type: 'Identifier', name: 'a' }),
        makeSpreadEl({ type: 'Identifier', name: 'b' }),
        makeSpreadEl({ type: 'Identifier', name: 'c' }),
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([...arr, 1]) — spread + literal number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        makeSpreadEl({ type: 'Identifier', name: 'arr' }),
        { type: 'Literal', value: 1 },
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([1, ...arr]) — literal number + spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        { type: 'Literal', value: 1 },
        makeSpreadEl({ type: 'Identifier', name: 'arr' }),
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([...arr, "x"]) — spread + literal string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        makeSpreadEl({ type: 'Identifier', name: 'arr' }),
        { type: 'Literal', value: 'x' },
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([true, ...arr]) — literal bool + spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        { type: 'Literal', value: true },
        makeSpreadEl({ type: 'Identifier', name: 'arr' }),
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([...fn()]) — spread call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        makeSpreadEl({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }),
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([...obj.prop]) — spread member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        makeSpreadEl({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }),
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([...arr, null]) — spread + null element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        makeSpreadEl({ type: 'Identifier', name: 'arr' }),
        null,
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([...arr, {a:1}]) — spread + object element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        makeSpreadEl({ type: 'Identifier', name: 'arr' }),
        { type: 'ObjectExpression', properties: [] },
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([...arr, [1,2]]) — spread + nested array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        makeSpreadEl({ type: 'Identifier', name: 'arr' }),
        makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]),
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([1, ...arr, 2]) — literal + spread + literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        { type: 'Literal', value: 1 },
        makeSpreadEl({ type: 'Identifier', name: 'arr' }),
        { type: 'Literal', value: 2 },
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([...arr, x]) — spread + identifier element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        makeSpreadEl({ type: 'Identifier', name: 'arr' }),
        { type: 'Identifier', name: 'x' },
      ])))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Array.from', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])))
      expect(reports[0].message).toMatch(/Array\.from/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])))
      expect(reports[0].message).toBe(
        'Array.from([...arr]) is unnecessary. Use Array.from(arr) or [...arr] directly.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      const node = makeArrayFromCall(makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })]))
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })]), 5, 10, 5, 40))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'a' })])))
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'b' })])))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'a' })])))
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'b' }), makeSpreadEl({ type: 'Identifier', name: 'c' })])))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for spread with arrow function element in same array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        makeSpreadEl({ type: 'Identifier', name: 'arr' }),
        { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with template literal element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        makeSpreadEl({ type: 'Identifier', name: 'arr' }),
        { type: 'TemplateLiteral', quasis: [], expressions: [] },
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with conditional expression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        makeSpreadEl({ type: 'Identifier', name: 'arr' }),
        { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } },
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with regex literal element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        makeSpreadEl({ type: 'Identifier', name: 'arr' }),
        { type: 'Literal', value: /test/ },
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for spread-only array with nothing else', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        makeSpreadEl({ type: 'Identifier', name: 'data' }),
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with many non-spread elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        { type: 'Literal', value: 1 },
        { type: 'Literal', value: 2 },
        { type: 'Literal', value: 3 },
        { type: 'Literal', value: 4 },
        makeSpreadEl({ type: 'Identifier', name: 'rest' }),
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for Array.from([...Boolean]) — identifier named Boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        makeSpreadEl({ type: 'Identifier', name: 'Boolean' }),
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of deeply nested member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        makeSpreadEl({ type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'window' }, property: { type: 'Identifier', name: 'app' } }, property: { type: 'Identifier', name: 'list' } }),
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for hole then spread element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        null,
        makeSpreadEl({ type: 'Identifier', name: 'arr' }),
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for spread then hole element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        makeSpreadEl({ type: 'Identifier', name: 'arr' }),
        null,
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports with custom location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })]), 10, 4, 10, 35))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('reports for spread with function expression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        makeSpreadEl({ type: 'Identifier', name: 'arr' }),
        { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with unary expression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        makeSpreadEl({ type: 'Identifier', name: 'arr' }),
        { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } },
      ])))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (39) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Array.from([1, 2, 3]) — no spread elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([
        { type: 'Literal', value: 1 },
        { type: 'Literal', value: 2 },
        { type: 'Literal', value: 3 },
      ])))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from([]) — empty array, no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([])))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from([1]) — single element, no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([{ type: 'Literal', value: 1 }])))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(arr) — identifier, not array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall({ type: 'Identifier', name: 'arr' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from("hello") — string arg, not array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from([...arr], fn) — 2 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCallMulti([
        makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })]),
        { type: 'Identifier', name: 'fn' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from([...arr], fn, thisArg) — 3 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCallMulti([
        makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })]),
        { type: 'Identifier', name: 'fn' },
        { type: 'Identifier', name: 'thisArg' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.isArray([...arr]) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'isArray' },
        },
        arguments: [makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for [...arr] — no Array.from, just spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.from([...arr]) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MyArray.from([...arr]) — wrong identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'MyArray' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for array.from([...arr]) — lowercase array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.From([...arr]) — capital F', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'From' },
        },
        arguments: [makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from({length: 5}) — object arg, not array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from(new Set([1,2])) — NewExpression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'from' },
        arguments: [makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for computed member expression Array["from"]([...arr])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Literal', value: 'from' },
        },
        arguments: [makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not Identifier type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getArray' }, arguments: [] },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not Identifier type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Literal', value: 'from' },
        },
        arguments: [makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from([...arr], x => x * 2) — 2 args with arrow fn mapFn', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCallMulti([
        makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })]),
        { type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BinaryExpression', operator: '*', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 2 } } },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.of([...arr]) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'of' },
        },
        arguments: [makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "array" (case-sensitive check)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'ARRAY' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "from" with wrong case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'FROM' },
        },
        arguments: [makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (10) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayFromSpread.create(ctx1)
      const visitor2 = noUnnecessaryArrayFromSpread.create(ctx2)
      visitor1.CallExpression(makeArrayFromCall(makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])))
      visitor2.CallExpression(makeArrayFromCall(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }])))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates mixed valid/invalid correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }])))
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])))
      visitor.CallExpression(makeArrayFromCall({ type: 'Identifier', name: 'arr' }))
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'x' })])))
      visitor.CallExpression(makeArrayFromCall(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }])))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node with extra properties still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])],
        loc: makeLoc(1, 0, 1, 30),
        range: [0, 30],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayFromSpread.create(context)
      const visitor2 = noUnnecessaryArrayFromSpread.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayFromSpread.meta
      const meta2 = noUnnecessaryArrayFromSpread.meta
      expect(meta1).toBe(meta2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      const node = makeArrayFromCall(makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })]))
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayFromSpread).toBeDefined()
      expect(typeof noUnnecessaryArrayFromSpread.create).toBe('function')
      expect(typeof noUnnecessaryArrayFromSpread.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])],
        loc: makeLoc(1, 0, 1, 30),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFromSpread.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [makeArrayExpr([makeSpreadEl({ type: 'Identifier', name: 'arr' })])],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })
  })
})

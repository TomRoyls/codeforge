import { describe, expect, test, vi } from 'vitest'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { noUnnecessaryObjectHasOwnSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-object-has-own-spread.js'

// --- Helpers ---

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

interface ReportCall {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
}

function createMockContext(reportMock?: ReturnType<typeof vi.fn>): RuleContext {
  return {
    report: reportMock ?? vi.fn(),
    sourceCode: { text: '' },
    filename: 'test.ts',
    settings: {},
    options: [],
    id: 'test-rule',
    parserPath: '',
    parserServices: {},
    parserOptions: {},
  } as unknown as RuleContext
}

function makeSpreadArg(argument: object) {
  return { type: 'SpreadElement', argument }
}

function makeObjectHasOwnCall(
  args: object[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
) {
  return {
    type: 'CallExpression' as const,
    callee: {
      type: 'MemberExpression' as const,
      object: { type: 'Identifier' as const, name: 'Object' },
      property: { type: 'Identifier' as const, name: 'hasOwn' },
      computed: false,
      optional: false,
    },
    arguments: args,
    optional: false,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
    range: [locStartCol, locEndCol] as [number, number],
  }
}

// --- Tests ---

describe('no-unnecessary-object-has-own-spread rule', () => {

  // ============================================================
  // 1. META TESTS (8)
  // ============================================================

  test('meta type is "suggestion"', () => {
    expect(noUnnecessaryObjectHasOwnSpreadRule.meta.type).toBe('suggestion')
  })

  test('meta severity is "warn"', () => {
    expect(noUnnecessaryObjectHasOwnSpreadRule.meta.severity).toBe('warn')
  })

  test('meta category is "patterns"', () => {
    expect(noUnnecessaryObjectHasOwnSpreadRule.meta.docs?.category).toBe('patterns')
  })

  test('meta recommended is false', () => {
    expect(noUnnecessaryObjectHasOwnSpreadRule.meta.docs?.recommended).toBe(false)
  })

  test('meta description is truthy', () => {
    expect(noUnnecessaryObjectHasOwnSpreadRule.meta.docs?.description).toBeTruthy()
  })

  test('meta description mentions Object.hasOwn', () => {
    expect(noUnnecessaryObjectHasOwnSpreadRule.meta.docs?.description).toContain('Object.hasOwn')
  })

  test('meta docs URL is correct', () => {
    expect(noUnnecessaryObjectHasOwnSpreadRule.meta.docs?.url).toBe(
      'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-object-has-own-spread.ts',
    )
  })

  test('meta schema is empty', () => {
    expect(noUnnecessaryObjectHasOwnSpreadRule.meta.schema).toEqual([])
  })

  // ============================================================
  // 2. STRUCTURE TESTS (2)
  // ============================================================

  test('create() returns visitor with CallExpression', () => {
    const visitor = noUnnecessaryObjectHasOwnSpreadRule.create(createMockContext())
    expect(visitor).toHaveProperty('CallExpression')
    expect(typeof visitor.CallExpression).toBe('function')
  })

  test('default export matches named export', () => {
    expect(noUnnecessaryObjectHasOwnSpreadRule).toBeDefined()
    expect(noUnnecessaryObjectHasOwnSpreadRule.meta).toBeDefined()
    expect(noUnnecessaryObjectHasOwnSpreadRule.create).toBeDefined()
  })

  // ============================================================
  // 3. POSITIVE CASES (28) — reports for Object.hasOwn(...spread)
  // ============================================================

  test('reports for Object.hasOwn(...arr) with Identifier spread', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('report message mentions spread', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('spread'),
      }),
    )
  })

  test('reports for spread with ArrayExpression argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({ type: 'ArrayExpression', elements: [] }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with CallExpression argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getArgs' },
        arguments: [],
        optional: false,
      }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with MemberExpression argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'keys' },
        computed: false,
        optional: false,
      }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with ObjectExpression argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({ type: 'ObjectExpression', properties: [] }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with BinaryExpression argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with ConditionalExpression argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
      }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with ArrowFunctionExpression argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'Identifier', name: 'x' },
        async: false,
        expression: true,
      }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with NewExpression argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
      }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with TemplateLiteral argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with LogicalExpression argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with SequenceExpression argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({
        type: 'SequenceExpression',
        expressions: [{ type: 'Identifier', name: 'a' }],
      }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with UnaryExpression argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({
        type: 'UnaryExpression',
        operator: '!',
        argument: { type: 'Identifier', name: 'x' },
        prefix: true,
      }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with FunctionExpression argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        async: false,
        generator: false,
      }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with AssignmentExpression argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with AwaitExpression argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'promise' },
      }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with YieldExpression argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({
        type: 'YieldExpression',
        argument: { type: 'Identifier', name: 'val' },
        delegate: false,
      }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with UpdateExpression argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({
        type: 'UpdateExpression',
        operator: '++',
        argument: { type: 'Identifier', name: 'x' },
        prefix: false,
      }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with ClassExpression argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({
        type: 'ClassExpression',
        id: null,
        superClass: null,
        body: { type: 'ClassBody', body: [] },
      }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with chained MemberExpression argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'a' },
          property: { type: 'Identifier', name: 'b' },
          computed: false,
          optional: false,
        },
        property: { type: 'Identifier', name: 'c' },
        computed: false,
        optional: false,
      }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with ArrayExpression containing elements', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({
        type: 'ArrayExpression',
        elements: [
          { type: 'Identifier', name: 'x' },
          { type: 'Identifier', name: 'y' },
        ],
      }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with CallExpression via method call', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'map' },
          computed: false,
          optional: false,
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        optional: false,
      }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('reports for spread with nested SpreadElement argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({
        type: 'SpreadElement',
        argument: { type: 'Identifier', name: 'deep' },
      }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('report includes the full message about hasOwn expecting object and property key', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    const call = reportMock.mock.calls[0][0]
    expect(call.message).toContain('hasOwn() expects an object and a property key')
  })

  test('report message is exactly the defined message', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    const call = reportMock.mock.calls[0][0]
    expect(call.message).toBe(
      'Object.hasOwn(...items) with spread is unusual. hasOwn() expects an object and a property key.',
    )
  })

  test('report includes the node reference', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledWith(expect.objectContaining({ node }))
  })

  test('reports for spread with Literal argument', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({ type: 'Literal', value: 42, raw: '42' }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  // ============================================================
  // 4. NEGATIVE CASES (40) — does NOT report
  // ============================================================

  test('does NOT report for JSON.hasOwn(...arr)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = {
      ...makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]),
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'JSON' },
        property: { type: 'Identifier', name: 'hasOwn' },
        computed: false,
        optional: false,
      },
    }
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for console.hasOwn(...arr)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = {
      ...makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]),
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'hasOwn' },
        computed: false,
        optional: false,
      },
    }
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for myObj.hasOwn(...arr)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = {
      ...makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]),
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'myObj' },
        property: { type: 'Identifier', name: 'hasOwn' },
        computed: false,
        optional: false,
      },
    }
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for Object.keys(...arr)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    ;(node.callee as Record<string, unknown>).property = { type: 'Identifier', name: 'keys' }
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for Object.values(...arr)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    ;(node.callee as Record<string, unknown>).property = { type: 'Identifier', name: 'values' }
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for Object.entries(...arr)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    ;(node.callee as Record<string, unknown>).property = { type: 'Identifier', name: 'entries' }
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for Object.assign(...arr)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    ;(node.callee as Record<string, unknown>).property = { type: 'Identifier', name: 'assign' }
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for Object.defineProperty(...arr)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    ;(node.callee as Record<string, unknown>).property = { type: 'Identifier', name: 'defineProperty' }
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for Object.is(...arr)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    ;(node.callee as Record<string, unknown>).property = { type: 'Identifier', name: 'is' }
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for Object.freeze(...arr)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    ;(node.callee as Record<string, unknown>).property = { type: 'Identifier', name: 'freeze' }
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for Object.hasOwnProperty(...arr)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    ;(node.callee as Record<string, unknown>).property = { type: 'Identifier', name: 'hasOwnProperty' }
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for Object.getPrototypeOf(...arr)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    ;(node.callee as Record<string, unknown>).property = { type: 'Identifier', name: 'getPrototypeOf' }
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for Object.hasOwn(obj, key) — no spread', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      { type: 'Identifier', name: 'obj' },
      { type: 'Identifier', name: 'key' },
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for Object.hasOwn(obj) — single non-spread arg', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([{ type: 'Identifier', name: 'obj' }])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for Object.hasOwn() — no args', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for Object.hasOwn(...arr, extra) — multiple args with spread', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      makeSpreadArg({ type: 'Identifier', name: 'arr' }),
      { type: 'Identifier', name: 'extra' },
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for Object.hasOwn(obj, ...arr) — spread as second arg', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      { type: 'Identifier', name: 'obj' },
      makeSpreadArg({ type: 'Identifier', name: 'arr' }),
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report when callee object is null', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    ;(node.callee as Record<string, unknown>).object = null
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report when callee property is null', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    ;(node.callee as Record<string, unknown>).property = null
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report when callee is null', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    ;(node as Record<string, unknown>).callee = null
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report when callee object is undefined', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    ;(node.callee as Record<string, unknown>).object = undefined
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report when callee object name is empty string', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    ;((node.callee as Record<string, unknown>).object as Record<string, unknown>).name = ''
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report when callee property name is empty string', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    ;((node.callee as Record<string, unknown>).property as Record<string, unknown>).name = ''
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for computed member Object["hasOwn"]', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    ;(node.callee as Record<string, unknown>).computed = true
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report when callee object type is MemberExpression', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    ;(node.callee as Record<string, unknown>).object = {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'window' },
      property: { type: 'Identifier', name: 'Object' },
      computed: false,
      optional: false,
    }
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for bare hasOwn(...arr) — no Object', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'hasOwn' },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      optional: false,
      loc: makeLoc(1, 0, 1, 20),
      range: [0, 20] as [number, number],
    }
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for Reflect.hasOwn(...arr)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = {
      ...makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]),
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'Reflect' },
        property: { type: 'Identifier', name: 'hasOwn' },
        computed: false,
        optional: false,
      },
    }
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for object (lowercase).hasOwn(...arr)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = {
      ...makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]),
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'object' },
        property: { type: 'Identifier', name: 'hasOwn' },
        computed: false,
        optional: false,
      },
    }
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for OBJECT (uppercase).hasOwn(...arr)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = {
      ...makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]),
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'OBJECT' },
        property: { type: 'Identifier', name: 'hasOwn' },
        computed: false,
        optional: false,
      },
    }
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report when callee property name is "hasown" (lowercase)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    ;((node.callee as Record<string, unknown>).property as Record<string, unknown>).name = 'hasown'
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report when arguments is missing', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'Object' },
        property: { type: 'Identifier', name: 'hasOwn' },
        computed: false,
        optional: false,
      },
      optional: false,
      loc: makeLoc(1, 0, 1, 30),
      range: [0, 30] as [number, number],
    }
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for Object.hasOwn with ThisExpression arg (not spread)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([{ type: 'ThisExpression' }])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for Object.hasOwn with Literal args', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      { type: 'Literal', value: 'prop' },
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for Object.hasOwn with two Literal args', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      { type: 'Literal', value: 42 },
      { type: 'Literal', value: 'key' },
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report when argument is CallExpression (not spread)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      { type: 'CallExpression', callee: { type: 'Identifier', name: 'getObject' }, arguments: [], optional: false },
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for null node', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const visitor = noUnnecessaryObjectHasOwnSpreadRule.create(ctx)
    expect(() => visitor.CallExpression(null)).not.toThrow()
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for undefined node', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const visitor = noUnnecessaryObjectHasOwnSpreadRule.create(ctx)
    expect(() => visitor.CallExpression(undefined)).not.toThrow()
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report when node is empty object', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const visitor = noUnnecessaryObjectHasOwnSpreadRule.create(ctx)
    expect(() => visitor.CallExpression({})).not.toThrow()
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for string primitive node', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const visitor = noUnnecessaryObjectHasOwnSpreadRule.create(ctx)
    expect(() => visitor.CallExpression('not a node' as never)).not.toThrow()
    expect(reportMock).not.toHaveBeenCalled()
  })

  test('does NOT report for number primitive node', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const visitor = noUnnecessaryObjectHasOwnSpreadRule.create(ctx)
    expect(() => visitor.CallExpression(42 as never)).not.toThrow()
    expect(reportMock).not.toHaveBeenCalled()
  })

  // ============================================================
  // 5. EDGE CASES (17)
  // ============================================================

  test('visitor functions are independent across calls (stateless)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const visitor = noUnnecessaryObjectHasOwnSpreadRule.create(ctx)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    visitor.CallExpression(node)
    visitor.CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(2)
  })

  test('accumulates reports across multiple calls', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const visitor = noUnnecessaryObjectHasOwnSpreadRule.create(ctx)
    const node1 = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'a' })], 1, 0, 1, 10)
    const node2 = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'b' })], 2, 0, 2, 10)
    visitor.CallExpression(node1)
    visitor.CallExpression(node2)
    expect(reportMock).toHaveBeenCalledTimes(2)
  })

  test('reports with correct loc when provided', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall(
      [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      5,
      10,
      5,
      40,
    )
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        loc: makeLoc(5, 10, 5, 40),
      }),
    )
  })

  test('handles node without loc gracefully', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    delete (node as Record<string, unknown>).loc
    expect(() => {
      noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    }).not.toThrow()
  })

  test('handles node without range gracefully', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    delete (node as Record<string, unknown>).range
    expect(() => {
      noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    }).not.toThrow()
  })

  test('handles node with extra properties', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = {
      ...makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]),
      extra: 'should not matter',
      comments: [],
      trailingComments: [],
    }
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('handles spread argument with extra properties', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([
      {
        ...makeSpreadArg({ type: 'Identifier', name: 'arr' }),
        extra: 'data',
        trailingComments: [],
      },
    ])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('handles optional CallExpression (Object?.hasOwn)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    ;(node as Record<string, unknown>).optional = true
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledTimes(1)
  })

  test('create() returns new visitor each call', () => {
    const ctx = createMockContext()
    const visitor1 = noUnnecessaryObjectHasOwnSpreadRule.create(ctx)
    const visitor2 = noUnnecessaryObjectHasOwnSpreadRule.create(ctx)
    expect(visitor1).not.toBe(visitor2)
  })

  test('different contexts produce independent report calls', () => {
    const reportMock1 = vi.fn()
    const reportMock2 = vi.fn()
    const ctx1 = createMockContext(reportMock1)
    const ctx2 = createMockContext(reportMock2)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx1).CallExpression(node)
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx2).CallExpression(node)
    expect(reportMock1).toHaveBeenCalledTimes(1)
    expect(reportMock2).toHaveBeenCalledTimes(1)
  })

  test('does not mutate the input node', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    const originalArgs = JSON.parse(JSON.stringify(node.arguments))
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(node.arguments).toEqual(originalArgs)
  })

  test('meta is same reference across multiple accesses', () => {
    const meta1 = noUnnecessaryObjectHasOwnSpreadRule.meta
    const meta2 = noUnnecessaryObjectHasOwnSpreadRule.meta
    expect(meta1).toBe(meta2)
  })

  test('mixed valid and invalid nodes report only violations', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const visitor = noUnnecessaryObjectHasOwnSpreadRule.create(ctx)
    visitor.CallExpression(makeObjectHasOwnCall([{ type: 'Identifier', name: 'obj' }, { type: 'Identifier', name: 'key' }]))
    visitor.CallExpression(makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
    visitor.CallExpression(makeObjectHasOwnCall([{ type: 'Identifier', name: 'obj' }]))
    visitor.CallExpression(makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'more' })]))
    visitor.CallExpression(makeObjectHasOwnCall([]))
    expect(reportMock).toHaveBeenCalledTimes(2)
  })

  test('meta docs description is a non-empty string', () => {
    expect(typeof noUnnecessaryObjectHasOwnSpreadRule.meta.docs?.description).toBe('string')
    expect((noUnnecessaryObjectHasOwnSpreadRule.meta.docs?.description ?? '').length).toBeGreaterThan(0)
  })

  test('report message contains "Object.hasOwn"', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    expect(reportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Object.hasOwn'),
      }),
    )
  })

  test('handles node with partial loc (missing end)', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = {
      ...makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]),
      loc: { start: { line: 3, column: 5 } },
    }
    expect(() => {
      noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    }).not.toThrow()
  })

  test('handles node with empty loc object', () => {
    const reportMock = vi.fn()
    const ctx = createMockContext(reportMock)
    const node = {
      ...makeObjectHasOwnCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]),
      loc: {},
    }
    expect(() => {
      noUnnecessaryObjectHasOwnSpreadRule.create(ctx).CallExpression(node)
    }).not.toThrow()
  })
})

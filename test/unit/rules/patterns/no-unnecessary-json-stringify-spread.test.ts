import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryJsonStringifySpreadRule } from '../../../../src/rules/patterns/no-unnecessary-json-stringify-spread.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function createMockContext(): RuleContext {
  return {
    report: vi.fn(),
    id: 'no-unnecessary-json-stringify-spread',
    options: {},
    filename: 'test.ts',
    source: '',
  } as unknown as RuleContext
}

function makeSpreadArg(argument: Record<string, unknown> = { type: 'Identifier', name: 'items' }) {
  return {
    type: 'SpreadElement',
    argument,
  }
}

function makeJsonStringifyCall(
  args: Array<Record<string, unknown> | null | undefined>,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
): Record<string, unknown> {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: 'JSON' },
      property: { type: 'Identifier', name: 'stringify' },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

describe('no-unnecessary-json-stringify-spread rule', () => {

  // 1. META TESTS (8)

  test('meta.type is suggestion', () => {
    expect(noUnnecessaryJsonStringifySpreadRule.meta.type).toBe('suggestion')
  })

  test('meta.severity is warn', () => {
    expect(noUnnecessaryJsonStringifySpreadRule.meta.severity).toBe('warn')
  })

  test('meta.docs.category is patterns', () => {
    expect(noUnnecessaryJsonStringifySpreadRule.meta.docs!.category).toBe('patterns')
  })

  test('meta.docs.recommended is false', () => {
    expect(noUnnecessaryJsonStringifySpreadRule.meta.docs!.recommended).toBe(false)
  })

  test('meta.docs.description mentions JSON.stringify and spread', () => {
    expect(noUnnecessaryJsonStringifySpreadRule.meta.docs!.description).toContain('JSON.stringify')
    expect(noUnnecessaryJsonStringifySpreadRule.meta.docs!.description).toContain('spread')
  })

  test('meta.schema is an empty array', () => {
    expect(noUnnecessaryJsonStringifySpreadRule.meta.schema).toEqual([])
  })

  test('meta.docs.url is the correct GitHub URL', () => {
    expect(noUnnecessaryJsonStringifySpreadRule.meta.docs!.url).toBe(
      'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-json-stringify-spread.ts',
    )
  })

  test('create returns an object with a CallExpression method', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonStringifySpreadRule.create(context)
    expect(typeof visitor.CallExpression).toBe('function')
  })

  // 2. STRUCTURE TESTS (2)

  test('rule has a create method', () => {
    expect(typeof noUnnecessaryJsonStringifySpreadRule.create).toBe('function')
  })

  test('rule has a meta property', () => {
    expect(noUnnecessaryJsonStringifySpreadRule.meta).toBeDefined()
    expect(typeof noUnnecessaryJsonStringifySpreadRule.meta).toBe('object')
  })

  // 3. POSITIVE CASES (28)

  test('reports JSON.stringify(...items)', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([makeSpreadArg()])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('report message matches exactly', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([makeSpreadArg()])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'JSON.stringify(...items) with spread is unusual. stringify() expects a value to serialize.',
      }),
    )
  })

  test('report includes the node', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([makeSpreadArg()])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledWith(expect.objectContaining({ node }))
  })

  test('report includes loc', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([makeSpreadArg()], 5, 10, 5, 40)
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledWith(expect.objectContaining({ loc: makeLoc(5, 10, 5, 40) }))
  })

  test('reports JSON.stringify(...arr) with Identifier argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...data) with Identifier argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([makeSpreadArg({ type: 'Identifier', name: 'data' })])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...obj) with Identifier argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([makeSpreadArg({ type: 'Identifier', name: 'obj' })])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...foo) with MemberExpression argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'items' },
      }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...bar) with CallExpression argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getItems' },
        arguments: [],
      }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...nested.val) with deep MemberExpression', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({
        type: 'MemberExpression',
        computed: true,
        object: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'state' },
          property: { type: 'Identifier', name: 'data' },
        },
        property: { type: 'Identifier', name: 'values' },
      }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...(x)) with ArrayExpression argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({ type: 'ArrayExpression', elements: [] }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...results) with ConditionalExpression argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'cond' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
      }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...x) with BinaryExpression argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...x) with LogicalExpression argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...x) with ArrowFunctionExpression argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'Identifier', name: 'x' },
      }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...x) with TemplateLiteral argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...x) with ObjectExpression argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({ type: 'ObjectExpression', properties: [] }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...x) with UnaryExpression argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({
        type: 'UnaryExpression',
        operator: '!',
        argument: { type: 'Identifier', name: 'x' },
      }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...x) with UpdateExpression argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({
        type: 'UpdateExpression',
        operator: '++',
        argument: { type: 'Identifier', name: 'x' },
        prefix: false,
      }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...x) with NewExpression argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
      }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...x) with SequenceExpression argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({
        type: 'SequenceExpression',
        expressions: [{ type: 'Identifier', name: 'a' }],
      }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...x) with AwaitExpression argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'promise' },
      }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...x) with YieldExpression argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({
        type: 'YieldExpression',
        argument: { type: 'Identifier', name: 'val' },
      }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...x) with TaggedTemplateExpression argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({
        type: 'TaggedTemplateExpression',
        tag: { type: 'Identifier', name: 'tag' },
        quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
      }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...x) with AssignmentExpression argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...x) with FunctionExpression argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...x) with ClassExpression argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({
        type: 'ClassExpression',
        id: null,
        superClass: null,
        body: { type: 'ClassBody', body: [] },
      }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.stringify(...x) with ThisExpression argument', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg({ type: 'ThisExpression' }),
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  // 4. NEGATIVE CASES (40)

  test('does NOT report Math.stringify(...items)', () => {
    const ctx = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'Math' },
        property: { type: 'Identifier', name: 'stringify' },
      },
      arguments: [makeSpreadArg()],
      loc: makeLoc(1, 0, 1, 30),
    }
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report Object.stringify(...items)', () => {
    const ctx = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'Object' },
        property: { type: 'Identifier', name: 'stringify' },
      },
      arguments: [makeSpreadArg()],
      loc: makeLoc(1, 0, 1, 30),
    }
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report console.stringify(...items)', () => {
    const ctx = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'stringify' },
      },
      arguments: [makeSpreadArg()],
      loc: makeLoc(1, 0, 1, 30),
    }
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report JSON.parse(...items)', () => {
    const ctx = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'JSON' },
        property: { type: 'Identifier', name: 'parse' },
      },
      arguments: [makeSpreadArg()],
      loc: makeLoc(1, 0, 1, 30),
    }
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report JSON.stringifyxxxx(...items)', () => {
    const ctx = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'JSON' },
        property: { type: 'Identifier', name: 'stringifyxxxx' },
      },
      arguments: [makeSpreadArg()],
      loc: makeLoc(1, 0, 1, 30),
    }
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report JSON.stringify(items)', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      { type: 'Identifier', name: 'items' },
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report JSON.stringify(obj)', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      { type: 'ObjectExpression', properties: [] },
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report JSON.stringify(42)', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      { type: 'Literal', value: 42 },
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report JSON.stringify("hello")', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      { type: 'Literal', value: 'hello' },
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report JSON.stringify(null)', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      { type: 'Literal', value: null },
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report JSON.stringify(true)', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      { type: 'Literal', value: true },
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report JSON.stringify(undefined_val)', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      { type: 'Identifier', name: 'undefined_val' },
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report JSON.stringify(arr) with ArrayExpression', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      { type: 'ArrayExpression', elements: [] },
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report JSON.stringify() with zero arguments', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report JSON.stringify(...items, null, 2) with three arguments', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg(),
      { type: 'Literal', value: null },
      { type: 'Literal', value: 2 },
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report JSON.stringify(...items, null) with two arguments', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      makeSpreadArg(),
      { type: 'Literal', value: null },
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report standalone stringify(...items)', () => {
    const ctx = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'stringify' },
      arguments: [makeSpreadArg()],
      loc: makeLoc(1, 0, 1, 30),
    }
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report JSON["stringify"](...items) with computed member', () => {
    const ctx = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'JSON' },
        property: { type: 'Literal', value: 'stringify' },
      },
      arguments: [makeSpreadArg()],
      loc: makeLoc(1, 0, 1, 30),
    }
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report when callee.object is not an Identifier', () => {
    const ctx = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        property: { type: 'Identifier', name: 'stringify' },
      },
      arguments: [makeSpreadArg()],
      loc: makeLoc(1, 0, 1, 30),
    }
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report when callee.property is not an Identifier', () => {
    const ctx = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'JSON' },
        property: { type: 'Literal', value: 'stringify' },
      },
      arguments: [makeSpreadArg()],
      loc: makeLoc(1, 0, 1, 30),
    }
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report for Identifier node type', () => {
    const ctx = createMockContext()
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression({ type: 'Identifier', name: 'x' })
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report for Literal node type', () => {
    const ctx = createMockContext()
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression({ type: 'Literal', value: 42 })
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report for ExpressionStatement node type', () => {
    const ctx = createMockContext()
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression({ type: 'ExpressionStatement' })
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report for MemberExpression node type', () => {
    const ctx = createMockContext()
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression({ type: 'MemberExpression' })
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report for VariableDeclaration node type', () => {
    const ctx = createMockContext()
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression({ type: 'VariableDeclaration' })
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report when node is null', () => {
    const ctx = createMockContext()
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(null)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report when node is undefined', () => {
    const ctx = createMockContext()
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(undefined)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report when callee is null', () => {
    const ctx = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: null,
      arguments: [makeSpreadArg()],
      loc: makeLoc(1, 0, 1, 30),
    }
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report when arguments is null', () => {
    const ctx = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'JSON' },
        property: { type: 'Identifier', name: 'stringify' },
      },
      arguments: null,
      loc: makeLoc(1, 0, 1, 30),
    }
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report when callee.object is null', () => {
    const ctx = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: null,
        property: { type: 'Identifier', name: 'stringify' },
      },
      arguments: [makeSpreadArg()],
      loc: makeLoc(1, 0, 1, 30),
    }
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report when callee.property is null', () => {
    const ctx = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'JSON' },
        property: null,
      },
      arguments: [makeSpreadArg()],
      loc: makeLoc(1, 0, 1, 30),
    }
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report when first argument is null', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([null])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report when first argument type is not SpreadElement', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      { type: 'SomeOtherType' },
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report JSON.parse(obj) with normal arg', () => {
    const ctx = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'JSON' },
        property: { type: 'Identifier', name: 'parse' },
      },
      arguments: [{ type: 'Identifier', name: 'obj' }],
      loc: makeLoc(1, 0, 1, 30),
    }
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report for empty arguments array', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report JSON.stringify(fn()) with CallExpression arg', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([
      {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getData' },
        arguments: [],
      },
    ])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report when callee.object name is lowercase "json"', () => {
    const ctx = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'json' },
        property: { type: 'Identifier', name: 'stringify' },
      },
      arguments: [makeSpreadArg()],
      loc: makeLoc(1, 0, 1, 30),
    }
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report when callee.object is a MemberExpression chain', () => {
    const ctx = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'JSON' },
        },
        property: { type: 'Identifier', name: 'stringify' },
      },
      arguments: [makeSpreadArg()],
      loc: makeLoc(1, 0, 1, 45),
    }
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report when callee.object is a CallExpression', () => {
    const ctx = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getJSON' },
          arguments: [],
        },
        property: { type: 'Identifier', name: 'stringify' },
      },
      arguments: [makeSpreadArg()],
      loc: makeLoc(1, 0, 1, 40),
    }
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report when callee property name is "parse" instead of "stringify"', () => {
    const ctx = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'JSON' },
        property: { type: 'Identifier', name: 'parse' },
      },
      arguments: [makeSpreadArg()],
      loc: makeLoc(1, 0, 1, 25),
    }
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  // 5. EDGE CASES (17)

  test('multiple calls accumulate reports independently', () => {
    const ctx = createMockContext()
    const visitor = noUnnecessaryJsonStringifySpreadRule.create(ctx)
    const node1 = makeJsonStringifyCall([makeSpreadArg()], 1, 0, 1, 20)
    const node2 = makeJsonStringifyCall([makeSpreadArg()], 2, 0, 2, 20)
    visitor.CallExpression(node1)
    visitor.CallExpression(node2)
    expect(ctx.report).toHaveBeenCalledTimes(2)
  })

  test('independent context instances do not share state', () => {
    const ctx1 = createMockContext()
    const ctx2 = createMockContext()
    const node = makeJsonStringifyCall([makeSpreadArg()])
    noUnnecessaryJsonStringifySpreadRule.create(ctx1).CallExpression(node)
    expect(ctx1.report).toHaveBeenCalledTimes(1)
    expect(ctx2.report).not.toHaveBeenCalled()
  })

  test('visitor returns only CallExpression key', () => {
    const ctx = createMockContext()
    const visitor = noUnnecessaryJsonStringifySpreadRule.create(ctx)
    const keys = Object.keys(visitor)
    expect(keys).toEqual(['CallExpression'])
  })

  test('report is called once for a single matching node', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([makeSpreadArg()])
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('create called multiple times produces independent visitors', () => {
    const ctx1 = createMockContext()
    const ctx2 = createMockContext()
    const visitor1 = noUnnecessaryJsonStringifySpreadRule.create(ctx1)
    const visitor2 = noUnnecessaryJsonStringifySpreadRule.create(ctx2)
    const node = makeJsonStringifyCall([makeSpreadArg()])
    visitor1.CallExpression(node)
    expect(ctx1.report).toHaveBeenCalledTimes(1)
    expect(ctx2.report).not.toHaveBeenCalled()
    visitor2.CallExpression(node)
    expect(ctx2.report).toHaveBeenCalledTimes(1)
  })

  test('loc is correctly extracted from node', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([makeSpreadArg()], 10, 5, 12, 30)
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    const reportCall = (ctx.report as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(reportCall.loc.start.line).toBe(10)
    expect(reportCall.loc.start.column).toBe(5)
    expect(reportCall.loc.end.line).toBe(12)
    expect(reportCall.loc.end.column).toBe(30)
  })

  test('loc with zero values is handled correctly', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([makeSpreadArg()], 0, 0, 0, 0)
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    expect(ctx.report).toHaveBeenCalledTimes(1)
    const reportCall = (ctx.report as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(reportCall.loc.start.line).toBe(0)
    expect(reportCall.loc.start.column).toBe(0)
  })

  test('does NOT report for node with type other than CallExpression', () => {
    const ctx = createMockContext()
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression({ type: 'FunctionDeclaration' })
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report for node with empty string type', () => {
    const ctx = createMockContext()
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression({ type: '' })
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('report is not called for mixed positive then negative nodes', () => {
    const ctx = createMockContext()
    const visitor = noUnnecessaryJsonStringifySpreadRule.create(ctx)
    const positiveNode = makeJsonStringifyCall([makeSpreadArg()])
    const negativeNode = makeJsonStringifyCall([
      { type: 'Identifier', name: 'obj' },
    ])
    visitor.CallExpression(positiveNode)
    visitor.CallExpression(negativeNode)
    expect(ctx.report).toHaveBeenCalledTimes(1)
  })

  test('does NOT report for node missing type property', () => {
    const ctx = createMockContext()
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression({})
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report for numeric node', () => {
    const ctx = createMockContext()
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(42)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report for string node', () => {
    const ctx = createMockContext()
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression('hello')
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('does NOT report for boolean node', () => {
    const ctx = createMockContext()
    noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(true)
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('rule does not crash when arguments array has undefined entries', () => {
    const ctx = createMockContext()
    const node = makeJsonStringifyCall([undefined])
    expect(() => {
      noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    }).not.toThrow()
    expect(ctx.report).not.toHaveBeenCalled()
  })

  test('rule does not crash when callee is missing type', () => {
    const ctx = createMockContext()
    const node = {
      type: 'CallExpression',
      callee: {
        object: { type: 'Identifier', name: 'JSON' },
        property: { type: 'Identifier', name: 'stringify' },
      },
      arguments: [makeSpreadArg()],
      loc: makeLoc(1, 0, 1, 30),
    }
    expect(() => {
      noUnnecessaryJsonStringifySpreadRule.create(ctx).CallExpression(node)
    }).not.toThrow()
  })

  test('rule handles three sequential positive matches correctly', () => {
    const ctx = createMockContext()
    const visitor = noUnnecessaryJsonStringifySpreadRule.create(ctx)
    visitor.CallExpression(makeJsonStringifyCall([makeSpreadArg()], 1, 0, 1, 20))
    visitor.CallExpression(makeJsonStringifyCall([makeSpreadArg()], 2, 0, 2, 20))
    visitor.CallExpression(makeJsonStringifyCall([makeSpreadArg()], 3, 0, 3, 20))
    expect(ctx.report).toHaveBeenCalledTimes(3)
  })
})

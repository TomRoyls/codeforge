import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryJsonParseSpreadRule, default as defaultExport } from '../../../../src/rules/patterns/no-unnecessary-json-parse-spread.js'
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
    id: 'test-rule',
    options: {},
    severity: 'warn' as const,
  } as unknown as RuleContext
}

function makeSpreadArg(argument: Record<string, unknown>) {
  return { type: 'SpreadElement', argument }
}

function makeJsonParseCall(
  args: unknown[],
  locStartLine = 0,
  locStartCol = 0,
  locEndLine = 0,
  locEndCol = 0,
) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: 'JSON' },
      property: { type: 'Identifier', name: 'parse' },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

describe('no-unnecessary-json-parse-spread rule', () => {
  // ─── META TESTS (8) ──────────────────────────────────────────────────

  test('meta.type is suggestion', () => {
    expect(noUnnecessaryJsonParseSpreadRule.meta.type).toBe('suggestion')
  })

  test('meta.severity is warn', () => {
    expect(noUnnecessaryJsonParseSpreadRule.meta.severity).toBe('warn')
  })

  test('meta.docs.category is patterns', () => {
    expect(noUnnecessaryJsonParseSpreadRule.meta.docs.category).toBe('patterns')
  })

  test('meta.docs.recommended is false', () => {
    expect(noUnnecessaryJsonParseSpreadRule.meta.docs.recommended).toBe(false)
  })

  test('meta.docs.description is present', () => {
    expect(noUnnecessaryJsonParseSpreadRule.meta.docs.description).toBeTruthy()
  })

  test('meta.docs.description mentions JSON.parse', () => {
    expect(noUnnecessaryJsonParseSpreadRule.meta.docs.description).toContain('JSON.parse')
  })

  test('meta.docs.url matches expected value', () => {
    expect(noUnnecessaryJsonParseSpreadRule.meta.docs.url).toBe(
      'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-json-parse-spread.ts',
    )
  })

  test('meta.schema is empty array', () => {
    expect(noUnnecessaryJsonParseSpreadRule.meta.schema).toEqual([])
  })

  // ─── STRUCTURE TESTS (2) ─────────────────────────────────────────────

  test('create() returns visitor with CallExpression method', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    expect(typeof visitor.CallExpression).toBe('function')
  })

  test('default export matches named export', () => {
    expect(defaultExport).toBe(noUnnecessaryJsonParseSpreadRule)
  })

  // ─── POSITIVE CASES (28) ─────────────────────────────────────────────

  test('reports JSON.parse(...arr)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(makeJsonParseCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('reports JSON.parse(...[1, 2, 3])', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([makeSpreadArg({ type: 'ArrayExpression', elements: [] })]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('reports with spread argument being Identifier', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([makeSpreadArg({ type: 'Identifier', name: 'items' })]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('reports with spread argument being ArrayExpression', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([makeSpreadArg({ type: 'ArrayExpression', elements: [1, 2, 3] })]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('reports with spread argument being CallExpression', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([
        makeSpreadArg({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }),
      ]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('reports with spread argument being MemberExpression', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([
        makeSpreadArg({
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'val' },
          computed: false,
        }),
      ]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('reports with spread argument being ObjectExpression', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([makeSpreadArg({ type: 'ObjectExpression', properties: [] })]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('reports with spread argument being FunctionExpression', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([
        makeSpreadArg({
          type: 'FunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        }),
      ]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('reports with spread argument being ArrowFunctionExpression', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([
        makeSpreadArg({
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
          expression: false,
        }),
      ]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('reports with spread argument being ConditionalExpression', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([
        makeSpreadArg({
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'x' },
          consequent: { type: 'Identifier', name: 'a' },
          alternate: { type: 'Identifier', name: 'b' },
        }),
      ]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('reports with spread argument being TemplateLiteral', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([
        makeSpreadArg({ type: 'TemplateLiteral', quasis: [], expressions: [] }),
      ]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('report message matches expected string', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(makeJsonParseCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
    expect(context.report).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'JSON.parse(...items) with spread is unusual. parse() expects a single string argument.',
      }),
    )
  })

  test('report loc matches node loc', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = makeJsonParseCall([makeSpreadArg({ type: 'Identifier', name: 'x' })], 5, 10, 5, 30)
    visitor.CallExpression(node)
    expect(context.report).toHaveBeenCalledWith(
      expect.objectContaining({
        loc: makeLoc(5, 10, 5, 30),
      }),
    )
  })

  test('report node is the CallExpression', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = makeJsonParseCall([makeSpreadArg({ type: 'Identifier', name: 'x' })])
    visitor.CallExpression(node)
    expect(context.report).toHaveBeenCalledWith(
      expect.objectContaining({ node }),
    )
  })

  test('reports with spread of BinaryExpression', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([
        makeSpreadArg({
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        }),
      ]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('reports with spread of NewExpression', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([
        makeSpreadArg({
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Set' },
          arguments: [],
        }),
      ]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('reports with spread of LogicalExpression', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([
        makeSpreadArg({
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        }),
      ]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('reports with spread of UnaryExpression', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([
        makeSpreadArg({
          type: 'UnaryExpression',
          operator: '!',
          argument: { type: 'Identifier', name: 'x' },
          prefix: true,
        }),
      ]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('reports with spread of SequenceExpression', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([
        makeSpreadArg({
          type: 'SequenceExpression',
          expressions: [{ type: 'Identifier', name: 'a' }],
        }),
      ]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('reports with spread of AwaitExpression', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([
        makeSpreadArg({
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'promise' },
        }),
      ]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('reports with spread of AssignmentExpression', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([
        makeSpreadArg({
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
        }),
      ]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('reports with spread of UpdateExpression', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([
        makeSpreadArg({
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        }),
      ]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('reports with specific loc values (10, 4, 10, 25)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = makeJsonParseCall([makeSpreadArg({ type: 'Identifier', name: 'd' })], 10, 4, 10, 25)
    visitor.CallExpression(node)
    expect(context.report).toHaveBeenCalledWith(
      expect.objectContaining({
        loc: { start: { line: 10, column: 4 }, end: { line: 10, column: 25 } },
      }),
    )
  })

  test('reports with specific loc values (1, 0, 3, 5)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = makeJsonParseCall([makeSpreadArg({ type: 'Identifier', name: 'e' })], 1, 0, 3, 5)
    visitor.CallExpression(node)
    expect(context.report).toHaveBeenCalledWith(
      expect.objectContaining({
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 5 } },
      }),
    )
  })

  test('multiple calls accumulate reports', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(makeJsonParseCall([makeSpreadArg({ type: 'Identifier', name: 'a' })]))
    visitor.CallExpression(makeJsonParseCall([makeSpreadArg({ type: 'Identifier', name: 'b' })]))
    visitor.CallExpression(makeJsonParseCall([makeSpreadArg({ type: 'Identifier', name: 'c' })]))
    expect(context.report).toHaveBeenCalledTimes(3)
  })

  test('reports with spread of TaggedTemplateExpression', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([
        makeSpreadArg({
          type: 'TaggedTemplateExpression',
          tag: { type: 'Identifier', name: 'tag' },
          quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        }),
      ]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('reports with spread of ArrayPattern', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([makeSpreadArg({ type: 'ArrayPattern', elements: [] })]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('reports with spread of ThisExpression', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([makeSpreadArg({ type: 'ThisExpression' })]),
    )
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  // ─── NEGATIVE CASES (40) ─────────────────────────────────────────────

  test('does NOT report for Object.parse(...arr)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'Object' },
        property: { type: 'Identifier', name: 'parse' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for console.parse(...arr)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'console' },
        property: { type: 'Identifier', name: 'parse' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for JSON.stringify(...arr)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'JSON' },
        property: { type: 'Identifier', name: 'stringify' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for JSON.parse(regularArg)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([{ type: 'Literal', value: '{"a":1}' }]),
    )
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for JSON.parse(...arr, extra)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([
        makeSpreadArg({ type: 'Identifier', name: 'arr' }),
        { type: 'Literal', value: null },
      ]),
    )
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for JSON.parse() with no args', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(makeJsonParseCall([]))
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for null node', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(null)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for undefined node', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(undefined)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for empty object node', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression({})
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for wrong node type BinaryExpression', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {} })
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for wrong node type Identifier', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression({ type: 'Identifier', name: 'foo' })
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for wrong node type ExpressionStatement', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression({ type: 'ExpressionStatement', expression: {} })
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for wrong node type VariableDeclaration', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const' })
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for wrong node type FunctionDeclaration', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression({ type: 'FunctionDeclaration', id: null, params: [], body: {} })
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report when callee is Identifier', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'parse' },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for computed member expression', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'JSON' },
        property: { type: 'Literal', value: 'parse' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report when callee object is missing', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        property: { type: 'Identifier', name: 'parse' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report when callee property is missing', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'JSON' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report when callee is missing', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report when callee object type is not Identifier', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'a' },
          property: { type: 'Identifier', name: 'b' },
          computed: false,
        },
        property: { type: 'Identifier', name: 'parse' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report when callee property type is not Identifier', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'JSON' },
        property: { type: 'Literal', value: 'parse' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for JSON.parse(plainString)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([{ type: 'Literal', value: '{"key":"value"}' }]),
    )
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for JSON.parse(variable)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([{ type: 'Identifier', name: 'jsonStr' }]),
    )
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for JSON.parse(template)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([{ type: 'TemplateLiteral', quasis: [], expressions: [] }]),
    )
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for Math.parse(...arr)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'Math' },
        property: { type: 'Identifier', name: 'parse' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for window.JSON.parse(...arr)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'JSON' },
          computed: false,
        },
        property: { type: 'Identifier', name: 'parse' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for JSON.parse(2 args with spread)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([
        makeSpreadArg({ type: 'Identifier', name: 'arr' }),
        { type: 'Identifier', name: 'reviver' },
      ]),
    )
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for JSON.parse(3 args)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([
        { type: 'Literal', value: '{}' },
        { type: 'Literal', value: null },
        { type: 'Literal', value: 2 },
      ]),
    )
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for node with null arguments', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'JSON' },
        property: { type: 'Identifier', name: 'parse' },
      },
      arguments: null,
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for Array.parse(...arr)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'Array' },
        property: { type: 'Identifier', name: 'parse' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for JSON.parse(callExpressionArg)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([{
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getText' },
        arguments: [],
      }]),
    )
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for Number.parse(...arr)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'Number' },
        property: { type: 'Identifier', name: 'parse' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for String.parse(...arr)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'String' },
        property: { type: 'Identifier', name: 'parse' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for JSON.parse(memberExpressionArg)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([{
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'res' },
        property: { type: 'Identifier', name: 'text' },
        computed: false,
      }]),
    )
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for Date.parse(...arr)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'Date' },
        property: { type: 'Identifier', name: 'parse' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for parseInt.parse(...arr)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'parseInt' },
        property: { type: 'Identifier', name: 'parse' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for JSON.parse(objectExpressionArg)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([{ type: 'ObjectExpression', properties: [] }]),
    )
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for JSON.parse(conditionalArg)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([{
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'flag' },
        consequent: { type: 'Literal', value: '{}' },
        alternate: { type: 'Literal', value: '[]' },
      }]),
    )
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for JSON.parse(concatenationArg)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([{
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: '{"a":' },
        right: { type: 'Identifier', name: 'val' },
      }]),
    )
    expect(context.report).not.toHaveBeenCalled()
  })

  test('does NOT report for JSON.parse(functionCallArg)', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(
      makeJsonParseCall([{
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getData' },
        arguments: [],
      }]),
    )
    expect(context.report).not.toHaveBeenCalled()
  })

  // ─── EDGE CASES (17) ─────────────────────────────────────────────────

  test('separate create() calls have independent state', () => {
    const ctx1 = createMockContext()
    const ctx2 = createMockContext()
    const visitor1 = noUnnecessaryJsonParseSpreadRule.create(ctx1)
    const visitor2 = noUnnecessaryJsonParseSpreadRule.create(ctx2)
    visitor1.CallExpression(makeJsonParseCall([makeSpreadArg({ type: 'Identifier', name: 'a' })]))
    visitor2.CallExpression(makeJsonParseCall([{ type: 'Literal', value: '{}' }]))
    expect(ctx1.report).toHaveBeenCalledTimes(1)
    expect(ctx2.report).not.toHaveBeenCalled()
  })

  test('visitor accumulates correctly over many calls', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    for (let i = 0; i < 10; i++) {
      visitor.CallExpression(makeJsonParseCall([makeSpreadArg({ type: 'Identifier', name: `a${i}` })]))
    }
    expect(context.report).toHaveBeenCalledTimes(10)
  })

  test('handles node without loc gracefully', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'JSON' },
        property: { type: 'Identifier', name: 'parse' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
    }
    visitor.CallExpression(node)
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('handles node with extra properties', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      ...makeJsonParseCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]),
      extra: true,
      range: [0, 20],
    }
    visitor.CallExpression(node)
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('handles empty loc object', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'JSON' },
        property: { type: 'Identifier', name: 'parse' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: {},
    }
    visitor.CallExpression(node)
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('handles partial loc with only start', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'JSON' },
        property: { type: 'Identifier', name: 'parse' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: { start: { line: 1, column: 0 } },
    }
    visitor.CallExpression(node)
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('multiple same violations all reported', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = makeJsonParseCall([makeSpreadArg({ type: 'Identifier', name: 'x' })])
    visitor.CallExpression(node)
    visitor.CallExpression(node)
    expect(context.report).toHaveBeenCalledTimes(2)
  })

  test('rule exports correctly as named and default', () => {
    expect(noUnnecessaryJsonParseSpreadRule).toBeDefined()
    expect(typeof noUnnecessaryJsonParseSpreadRule.create).toBe('function')
    expect(typeof noUnnecessaryJsonParseSpreadRule.meta).toBe('object')
  })

  test('node with _parent property still reports correctly', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      ...makeJsonParseCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]),
      _parent: { type: 'ExpressionStatement' },
    }
    visitor.CallExpression(node)
    expect(context.report).toHaveBeenCalledTimes(1)
  })

  test('computed property true blocks report', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: true,
        object: { type: 'Identifier', name: 'JSON' },
        property: { type: 'Literal', value: 'parse' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('mixed valid and invalid calls count correctly', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    visitor.CallExpression(makeJsonParseCall([makeSpreadArg({ type: 'Identifier', name: 'arr' })]))
    visitor.CallExpression(makeJsonParseCall([{ type: 'Literal', value: '{}' }]))
    visitor.CallExpression(makeJsonParseCall([makeSpreadArg({ type: 'Identifier', name: 'arr2' })]))
    visitor.CallExpression(
      makeJsonParseCall([
        makeSpreadArg({ type: 'Identifier', name: 'a' }),
        makeSpreadArg({ type: 'Identifier', name: 'b' }),
      ]),
    )
    expect(context.report).toHaveBeenCalledTimes(2)
  })

  test('meta object is same reference across accesses', () => {
    const meta1 = noUnnecessaryJsonParseSpreadRule.meta
    const meta2 = noUnnecessaryJsonParseSpreadRule.meta
    expect(meta1).toBe(meta2)
  })

  test('create returns new visitor each time', () => {
    const context = createMockContext()
    const visitor1 = noUnnecessaryJsonParseSpreadRule.create(context)
    const visitor2 = noUnnecessaryJsonParseSpreadRule.create(context)
    expect(visitor1).not.toBe(visitor2)
  })

  test('loc values are passed through exactly', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = makeJsonParseCall([makeSpreadArg({ type: 'Identifier', name: 'z' })], 42, 7, 42, 99)
    visitor.CallExpression(node)
    const reportedLoc = (context.report as ReturnType<typeof vi.fn>).mock.calls[0][0].loc
    expect(reportedLoc.start.line).toBe(42)
    expect(reportedLoc.start.column).toBe(7)
    expect(reportedLoc.end.line).toBe(42)
    expect(reportedLoc.end.column).toBe(99)
  })

  test('JSON.parse(...arr) with lowercase json does not report', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'json' },
        property: { type: 'Identifier', name: 'parse' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('JSON.parse(...arr) with PARSE uppercase does not report', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const node = {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'JSON' },
        property: { type: 'Identifier', name: 'PARSE' },
      },
      arguments: [makeSpreadArg({ type: 'Identifier', name: 'arr' })],
      loc: makeLoc(0, 0, 0, 0),
    }
    visitor.CallExpression(node)
    expect(context.report).not.toHaveBeenCalled()
  })

  test('SpreadElement as argument triggers report', () => {
    const context = createMockContext()
    const visitor = noUnnecessaryJsonParseSpreadRule.create(context)
    const spreadArg = { type: 'SpreadElement', argument: { type: 'Identifier', name: 'data' } }
    visitor.CallExpression(makeJsonParseCall([spreadArg]))
    expect(context.report).toHaveBeenCalledTimes(1)
  })
})

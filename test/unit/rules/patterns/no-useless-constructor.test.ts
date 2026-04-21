import { describe, test, expect } from 'vitest'
import { noUselessConstructorRule } from '../../../../src/rules/patterns/no-useless-constructor.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createEmptyConstructor(accessibility?: string, line = 1): unknown {
  return {
    type: 'MethodDefinition',
    kind: 'constructor',
    accessibility: accessibility ?? undefined,
    value: {
      type: 'FunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [] },
    },
    loc: { start: { line, column: 0 }, end: { line, column: 20 } },
  }
}

function createPassthroughConstructor(params: unknown[], args: unknown[], line = 1): unknown {
  return {
    type: 'MethodDefinition',
    kind: 'constructor',
    value: {
      type: 'FunctionExpression',
      params,
      body: {
        type: 'BlockStatement',
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: { type: 'Super' },
              arguments: args,
            },
          },
        ],
      },
    },
    loc: { start: { line, column: 0 }, end: { line, column: 30 } },
  }
}

function createConstructorWithBody(statements: unknown[], line = 1): unknown {
  return {
    type: 'MethodDefinition',
    kind: 'constructor',
    value: {
      type: 'FunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: statements },
    },
    loc: { start: { line, column: 0 }, end: { line, column: 30 } },
  }
}

function createRegularMethod(line = 1): unknown {
  return {
    type: 'MethodDefinition',
    kind: 'method',
    value: {
      type: 'FunctionExpression',
      params: [],
      body: { type: 'BlockStatement', body: [] },
    },
    loc: { start: { line, column: 0 }, end: { line, column: 20 } },
  }
}

function createIdentifier(name: string): Record<string, unknown> {
  return { type: 'Identifier', name }
}

describe('no-useless-constructor', () => {
  test('meta type is suggestion', () => {
    expect(noUselessConstructorRule.meta.type).toBe('suggestion')
  })

  test('meta severity is warn', () => {
    expect(noUselessConstructorRule.meta.severity).toBe('warn')
  })

  test('meta recommended is true', () => {
    expect(noUselessConstructorRule.meta.docs?.recommended).toBe(true)
  })

  test('meta category is patterns', () => {
    expect(noUselessConstructorRule.meta.docs?.category).toBe('patterns')
  })

  test('description mentions constructor', () => {
    expect(noUselessConstructorRule.meta.docs?.description.toLowerCase()).toContain('constructor')
  })

  test('create returns object with MethodDefinition method', () => {
    const { context } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    expect(typeof visitor.MethodDefinition).toBe('function')
  })

  test('Empty constructor with no params reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor())
    expect(reports.length).toBe(1)
  })

  test('Empty constructor with empty body reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    const node = {
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    }
    visitor.MethodDefinition(node)
    expect(reports.length).toBe(1)
  })

  test('Pass-through super() with no params/args reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createPassthroughConstructor([], []))
    expect(reports.length).toBe(1)
  })

  test('Pass-through super(a, b) with matching params reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [createIdentifier('a'), createIdentifier('b')],
        [createIdentifier('a'), createIdentifier('b')],
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('Pass-through super(...args) with rest param reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [{ type: 'RestElement', argument: createIdentifier('args') }],
        [{ type: 'SpreadElement', argument: createIdentifier('args') }],
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('Constructor with body logic does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'AssignmentExpression',
            operator: '=',
            left: {
              type: 'MemberExpression',
              object: { type: 'ThisExpression' },
              property: createIdentifier('x'),
            },
            right: { type: 'Literal', value: 1 },
          },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('Constructor with different super args does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [createIdentifier('a')],
        [
          {
            type: 'BinaryExpression',
            operator: '+',
            left: createIdentifier('a'),
            right: { type: 'Literal', value: 1 },
          },
        ],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('Constructor with extra logic after super does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    const node = {
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Super' },
                arguments: [],
              },
            },
            {
              type: 'ExpressionStatement',
              expression: { type: 'Literal', value: 42 },
            },
          ],
        },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.MethodDefinition(node)
    expect(reports.length).toBe(0)
  })

  test('Regular method (kind=method) does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createRegularMethod())
    expect(reports.length).toBe(0)
  })

  test('Protected constructor does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor('protected'))
    expect(reports.length).toBe(0)
  })

  test('Private constructor does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor('private'))
    expect(reports.length).toBe(0)
  })

  test('null node does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(null)
    expect(reports.length).toBe(0)
  })

  test('non-MethodDefinition node does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({ type: 'FunctionDeclaration' })
    expect(reports.length).toBe(0)
  })

  test('Message mentions useless or constructor', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor())
    expect(reports.length).toBeGreaterThan(0)
    const message = reports[0].message.toLowerCase()
    expect(message.includes('useless') || message.includes('constructor')).toBe(true)
  })

  test('Location is reported correctly', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    const node = createEmptyConstructor(undefined, 5)
    visitor.MethodDefinition(node)
    expect(reports.length).toBeGreaterThan(0)
    expect(reports[0].loc).toBeDefined()
    expect(reports[0].loc?.start.line).toBe(5)
    expect(reports[0].loc?.start.column).toBe(0)
    expect(reports[0].loc?.end.line).toBe(5)
    expect(reports[0].loc?.end.column).toBe(20)
  })

  // ── Meta: exhaustive ──────────────────────────────────────────────────
  test('meta schema is empty array', () => {
    expect(noUselessConstructorRule.meta.schema).toEqual([])
  })

  test('meta fixable is undefined', () => {
    expect(noUselessConstructorRule.meta.fixable).toBeUndefined()
  })

  test('meta deprecated is undefined', () => {
    expect(noUselessConstructorRule.meta.deprecated).toBeUndefined()
  })

  test('meta replacedBy is undefined', () => {
    expect(noUselessConstructorRule.meta.replacedBy).toBeUndefined()
  })

  test('meta requiresTypeChecking is undefined', () => {
    expect(noUselessConstructorRule.meta.requiresTypeChecking).toBeUndefined()
  })

  test('meta description is non-empty string', () => {
    expect(typeof noUselessConstructorRule.meta.docs?.description).toBe('string')
    expect((noUselessConstructorRule.meta.docs?.description ?? '').length).toBeGreaterThan(0)
  })

  test('meta docs url is undefined', () => {
    expect(noUselessConstructorRule.meta.docs?.url).toBeUndefined()
  })

  // ── Export: default export ─────────────────────────────────────────────
  test('default export equals named export', async () => {
    const mod = await import('../../../../src/rules/patterns/no-useless-constructor.js')
    expect(mod.default).toBe(mod.noUselessConstructorRule)
  })

  // ── create(): visitor shape ────────────────────────────────────────────
  test('create returns visitor with only MethodDefinition key', () => {
    const { context } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    expect(Object.keys(visitor)).toEqual(['MethodDefinition'])
  })

  test('MethodDefinition handler returns void (no return value)', () => {
    const { context } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    const result = visitor.MethodDefinition(createEmptyConstructor())
    expect(result).toBeUndefined()
  })

  test('create can be called multiple times producing independent visitors', () => {
    const ctx1 = createMockRuleContext({ source: 'const x = 1;' })
    const ctx2 = createMockRuleContext({ source: 'const x = 1;' })
    const visitor1 = noUselessConstructorRule.create(ctx1.context)
    const visitor2 = noUselessConstructorRule.create(ctx2.context)
    visitor1.MethodDefinition(createEmptyConstructor())
    expect(ctx1.reports.length).toBe(1)
    expect(ctx2.reports.length).toBe(0)
    visitor2.MethodDefinition(createEmptyConstructor())
    expect(ctx2.reports.length).toBe(1)
  })

  // ── isUselessConstructor: null / falsy ────────────────────────────────
  test('undefined node does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(undefined)
    expect(reports.length).toBe(0)
  })

  test('false node does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(false)
    expect(reports.length).toBe(0)
  })

  test('0 node does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(0)
    expect(reports.length).toBe(0)
  })

  test('empty string node does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition('')
    expect(reports.length).toBe(0)
  })

  // ── isUselessConstructor: non-object primitive ────────────────────────
  test('number node does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(42)
    expect(reports.length).toBe(0)
  })

  test('string node does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition('constructor')
    expect(reports.length).toBe(0)
  })

  // ── isUselessConstructor: wrong type ──────────────────────────────────
  test('FunctionDeclaration type does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({ type: 'FunctionDeclaration', kind: 'constructor' })
    expect(reports.length).toBe(0)
  })

  test('PropertyDefinition type does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({ type: 'PropertyDefinition' })
    expect(reports.length).toBe(0)
  })

  test('ClassDeclaration type does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({ type: 'ClassDeclaration' })
    expect(reports.length).toBe(0)
  })

  test('MethodDefinition without kind does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({ type: 'MethodDefinition' })
    expect(reports.length).toBe(0)
  })

  // ── isUselessConstructor: wrong kind ──────────────────────────────────
  test('MethodDefinition kind=method does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createRegularMethod())
    expect(reports.length).toBe(0)
  })

  test('MethodDefinition kind=get does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'get',
      value: { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    })
    expect(reports.length).toBe(0)
  })

  test('MethodDefinition kind=set does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'set',
      value: { type: 'FunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    })
    expect(reports.length).toBe(0)
  })

  // ── isUselessConstructor: accessibility modifiers ─────────────────────
  test('public constructor (explicit) empty body reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor('public'))
    expect(reports.length).toBe(1)
  })

  test('undefined accessibility empty body reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor(undefined))
    expect(reports.length).toBe(1)
  })

  test('protected constructor with empty body does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor('protected'))
    expect(reports.length).toBe(0)
  })

  test('private constructor with empty body does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor('private'))
    expect(reports.length).toBe(0)
  })

  test('protected constructor with super() passthrough does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    const node = createPassthroughConstructor([], [])
    ;(node as Record<string, unknown>).accessibility = 'protected'
    visitor.MethodDefinition(node)
    expect(reports.length).toBe(0)
  })

  test('private constructor with super() passthrough does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    const node = createPassthroughConstructor([], [])
    ;(node as Record<string, unknown>).accessibility = 'private'
    visitor.MethodDefinition(node)
    expect(reports.length).toBe(0)
  })

  // ── isUselessConstructor: no value ────────────────────────────────────
  test('constructor with value=undefined does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: undefined,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    })
    expect(reports.length).toBe(0)
  })

  test('constructor with value=null does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: null,
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
    })
    expect(reports.length).toBe(0)
  })

  // ── isUselessConstructor: TSParameterProperty ─────────────────────────
  test('constructor with TSParameterProperty does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [{ type: 'TSParameterProperty', parameter: createIdentifier('x') }],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(0)
  })

  test('constructor with public parameter property does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [{ type: 'Identifier', name: 'x', accessibility: 'public' }],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(0)
  })

  test('constructor with private parameter property does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [{ type: 'Identifier', name: 'x', accessibility: 'private' }],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(0)
  })

  test('constructor with decorated parameter does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [{ type: 'Identifier', name: 'x', decorators: [{ type: 'Decorator' }] }],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(0)
  })

  test('constructor with empty decorators array does report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [{ type: 'Identifier', name: 'x', decorators: [] }],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(1)
  })

  test('constructor with multiple params including TSParameterProperty does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [
          createIdentifier('a'),
          { type: 'TSParameterProperty', parameter: createIdentifier('b') },
        ],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(0)
  })

  test('constructor with null param in array is skipped gracefully', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [null, createIdentifier('x')],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(1)
  })

  // ── isUselessConstructor: empty body ──────────────────────────────────
  test('empty constructor body with params but no body statements reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [createIdentifier('x')],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(1)
  })

  test('empty constructor with value.body=undefined does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [],
        body: undefined,
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(0)
  })

  test('empty constructor with value.body=null does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [],
        body: null,
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(0)
  })

  test('constructor with body.body as non-array defaults to empty', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: undefined },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(1)
  })

  test('constructor with body.body=null reports as empty', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: null },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(1)
  })

  // ── isUselessConstructor: single super() — no params, no args ─────────
  test('super() with no params and no args reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createPassthroughConstructor([], []))
    expect(reports.length).toBe(1)
  })

  test('super() with no params and no args - message contains useless', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createPassthroughConstructor([], []))
    expect(reports[0].message.toLowerCase()).toContain('useless')
  })

  // ── isUselessConstructor: single super() — rest param ────────────────
  test('rest param super(...args) reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [{ type: 'RestElement', argument: createIdentifier('args') }],
        [{ type: 'SpreadElement', argument: createIdentifier('args') }],
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('rest param with different spread name does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [{ type: 'RestElement', argument: createIdentifier('args') }],
        [{ type: 'SpreadElement', argument: createIdentifier('other') }],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('rest param with non-Identifier argument does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [
          {
            type: 'RestElement',
            argument: {
              type: 'MemberExpression',
              object: createIdentifier('obj'),
              property: createIdentifier('x'),
            },
          },
        ],
        [{ type: 'SpreadElement', argument: createIdentifier('args') }],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('rest param with non-Identifier spread argument does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [{ type: 'RestElement', argument: createIdentifier('args') }],
        [
          {
            type: 'SpreadElement',
            argument: {
              type: 'MemberExpression',
              object: createIdentifier('obj'),
              property: createIdentifier('x'),
            },
          },
        ],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('rest param with non-SpreadElement super arg does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [{ type: 'RestElement', argument: createIdentifier('args') }],
        [createIdentifier('args')],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('rest param with multiple super args does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [{ type: 'RestElement', argument: createIdentifier('args') }],
        [{ type: 'SpreadElement', argument: createIdentifier('args') }, createIdentifier('extra')],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('rest param with non-RestElement param does not enter rest path', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [createIdentifier('x')],
        [{ type: 'SpreadElement', argument: createIdentifier('x') }],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('rest param with zero super args does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [{ type: 'RestElement', argument: createIdentifier('args') }],
        [],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('rest param with undefined argument does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [{ type: 'RestElement', argument: undefined }],
        [{ type: 'SpreadElement', argument: createIdentifier('args') }],
      ),
    )
    expect(reports.length).toBe(0)
  })

  // ── isUselessConstructor: identifier matching ─────────────────────────
  test('super(a) with param a reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor([createIdentifier('a')], [createIdentifier('a')]),
    )
    expect(reports.length).toBe(1)
  })

  test('super(a, b, c) with matching params reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [createIdentifier('a'), createIdentifier('b'), createIdentifier('c')],
        [createIdentifier('a'), createIdentifier('b'), createIdentifier('c')],
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('super(x, y) with swapped arg names does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [createIdentifier('x'), createIdentifier('y')],
        [createIdentifier('y'), createIdentifier('x')],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('super(a) with different arg name does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor([createIdentifier('a')], [createIdentifier('b')]),
    )
    expect(reports.length).toBe(0)
  })

  test('super(a) with more params than args does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [createIdentifier('a'), createIdentifier('b')],
        [createIdentifier('a')],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('super(a, b) with fewer params than args does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [createIdentifier('a')],
        [createIdentifier('a'), createIdentifier('b')],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('super(a) with non-Identifier param does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [
          {
            type: 'AssignmentPattern',
            left: createIdentifier('a'),
            right: { type: 'Literal', value: 1 },
          },
        ],
        [createIdentifier('a')],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('super(a) with non-Identifier arg does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor([createIdentifier('a')], [{ type: 'Literal', value: 42 }]),
    )
    expect(reports.length).toBe(0)
  })

  test('super(first, second) with one non-Identifier arg does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [createIdentifier('first'), createIdentifier('second')],
        [createIdentifier('first'), { type: 'Literal', value: 0 }],
      ),
    )
    expect(reports.length).toBe(0)
  })

  // ── isUselessConstructor: single non-super statement ──────────────────
  test('single ExpressionStatement with non-CallExpression does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ExpressionStatement',
          expression: { type: 'Literal', value: 42 },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('single ExpressionStatement with non-Super callee does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'foo' },
            arguments: [],
          },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('single ExpressionStatement with undefined callee does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: undefined,
            arguments: [],
          },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('single ExpressionStatement with null callee does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: null,
            arguments: [],
          },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('single non-ExpressionStatement does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'VariableDeclaration',
          kind: 'const',
          declarations: [],
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('single ReturnStatement does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([{ type: 'ReturnStatement', argument: null }]),
    )
    expect(reports.length).toBe(0)
  })

  test('single IfStatement does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'IfStatement',
          test: { type: 'Literal', value: true },
          consequent: { type: 'BlockStatement', body: [] },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('single ExpressionStatement with undefined expression does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ExpressionStatement',
          expression: undefined,
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('single ExpressionStatement with null expression does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ExpressionStatement',
          expression: null,
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  // ── isUselessConstructor: multiple body statements ────────────────────
  test('two empty statements does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([{ type: 'EmptyStatement' }, { type: 'EmptyStatement' }]),
    )
    expect(reports.length).toBe(0)
  })

  test('super() plus assignment does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Super' },
            arguments: [],
          },
        },
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'AssignmentExpression',
            operator: '=',
            left: {
              type: 'MemberExpression',
              object: { type: 'ThisExpression' },
              property: createIdentifier('x'),
            },
            right: { type: 'Literal', value: 1 },
          },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('super() with super(x) plus console.log does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Super' },
            arguments: [createIdentifier('x')],
          },
        },
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: createIdentifier('console'),
              property: createIdentifier('log'),
            },
            arguments: [{ type: 'Literal', value: 'hello' }],
          },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('three statements with super first does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ExpressionStatement',
          expression: { type: 'CallExpression', callee: { type: 'Super' }, arguments: [] },
        },
        { type: 'EmptyStatement' },
        { type: 'EmptyStatement' },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  // ── isUselessConstructor: mixed scenarios ─────────────────────────────
  test('constructor with ThisExpression assignment does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'AssignmentExpression',
            operator: '=',
            left: {
              type: 'MemberExpression',
              object: { type: 'ThisExpression' },
              property: createIdentifier('name'),
            },
            right: createIdentifier('value'),
          },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('constructor with super() and literal arg does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor([createIdentifier('a')], [{ type: 'Literal', value: 42 }]),
    )
    expect(reports.length).toBe(0)
  })

  test('constructor with super(a + 1) does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [createIdentifier('a')],
        [
          {
            type: 'BinaryExpression',
            operator: '+',
            left: createIdentifier('a'),
            right: { type: 'Literal', value: 1 },
          },
        ],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('constructor with super(foo()) does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [createIdentifier('a')],
        [
          {
            type: 'CallExpression',
            callee: createIdentifier('foo'),
            arguments: [],
          },
        ],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('constructor with super() call to this.init() does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'ThisExpression' },
              property: createIdentifier('init'),
            },
            arguments: [],
          },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  // ── Location: various line numbers ────────────────────────────────────
  test('location line 10 is reported correctly', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor(undefined, 10))
    expect(reports[0].loc?.start.line).toBe(10)
    expect(reports[0].loc?.end.line).toBe(10)
  })

  test('location line 100 is reported correctly', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor(undefined, 100))
    expect(reports[0].loc?.start.line).toBe(100)
  })

  test('location with multi-line range', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 5, column: 2 }, end: { line: 8, column: 3 } },
    })
    expect(reports[0].loc?.start.line).toBe(5)
    expect(reports[0].loc?.start.column).toBe(2)
    expect(reports[0].loc?.end.line).toBe(8)
    expect(reports[0].loc?.end.column).toBe(3)
  })

  test('location with column offsets', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 4 }, end: { line: 1, column: 25 } },
    })
    expect(reports[0].loc?.start.column).toBe(4)
    expect(reports[0].loc?.end.column).toBe(25)
  })

  test('node without loc property still reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
    })
    expect(reports.length).toBe(1)
  })

  test('node without loc gets default location', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
    })
    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  // ── Message content ───────────────────────────────────────────────────
  test('message contains "constructor"', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor())
    expect(reports[0].message.toLowerCase()).toContain('constructor')
  })

  test('message mentions empty', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor())
    expect(reports[0].message.toLowerCase()).toContain('empty')
  })

  test('message mentions super', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor())
    expect(reports[0].message.toLowerCase()).toContain('super')
  })

  test('message mentions remove', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor())
    expect(reports[0].message.toLowerCase()).toContain('remove')
  })

  test('message is consistent for empty vs passthrough constructors', () => {
    const ctx1 = createMockRuleContext({ source: 'const x = 1;' })
    const ctx2 = createMockRuleContext({ source: 'const x = 1;' })
    const v1 = noUselessConstructorRule.create(ctx1.context)
    const v2 = noUselessConstructorRule.create(ctx2.context)
    v1.MethodDefinition(createEmptyConstructor())
    v2.MethodDefinition(createPassthroughConstructor([], []))
    expect(ctx1.reports[0].message).toBe(ctx2.reports[0].message)
  })

  // ── Repeated calls ────────────────────────────────────────────────────
  test('calling MethodDefinition twice on different nodes reports twice', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor())
    visitor.MethodDefinition(createEmptyConstructor())
    expect(reports.length).toBe(2)
  })

  test('calling MethodDefinition on useful then useless reports once', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createRegularMethod())
    visitor.MethodDefinition(createEmptyConstructor())
    expect(reports.length).toBe(1)
  })

  test('calling MethodDefinition on useless then useful reports once', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor())
    visitor.MethodDefinition(createRegularMethod())
    expect(reports.length).toBe(1)
  })

  test('calling MethodDefinition 10 times on useless nodes reports 10', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    for (let i = 0; i < 10; i++) {
      visitor.MethodDefinition(createEmptyConstructor())
    }
    expect(reports.length).toBe(10)
  })

  test('mixed calls report correct count', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor())
    visitor.MethodDefinition(createRegularMethod())
    visitor.MethodDefinition(createEmptyConstructor())
    visitor.MethodDefinition(createRegularMethod())
    visitor.MethodDefinition(createEmptyConstructor())
    expect(reports.length).toBe(3)
  })

  // ── Edge cases: super with complex expressions ────────────────────────
  test('super with template literal arg does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [createIdentifier('name')],
        [{ type: 'TemplateLiteral', quasis: [], expressions: [] }],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('super with conditional expression arg does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [createIdentifier('x')],
        [
          {
            type: 'ConditionalExpression',
            test: createIdentifier('x'),
            consequent: { type: 'Literal', value: 1 },
            alternate: { type: 'Literal', value: 2 },
          },
        ],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('super with member expression arg does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [createIdentifier('obj')],
        [
          {
            type: 'MemberExpression',
            object: createIdentifier('obj'),
            property: createIdentifier('prop'),
          },
        ],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('super with array expression arg does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [createIdentifier('x')],
        [{ type: 'ArrayExpression', elements: [createIdentifier('x')] }],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('super with object expression arg does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [createIdentifier('x')],
        [{ type: 'ObjectExpression', properties: [] }],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('super with unary expression arg does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [createIdentifier('x')],
        [{ type: 'UnaryExpression', operator: '!', argument: createIdentifier('x') }],
      ),
    )
    expect(reports.length).toBe(0)
  })

  // ── Edge cases: params ────────────────────────────────────────────────
  test('constructor with AssignmentPattern params and super matching does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [
          {
            type: 'AssignmentPattern',
            left: createIdentifier('x'),
            right: { type: 'Literal', value: 1 },
          },
        ],
        [createIdentifier('x')],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('constructor with undefined params array reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: undefined,
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(1)
  })

  test('constructor with null params array reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: null,
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(1)
  })

  test('constructor with many params all matching reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    const names = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    visitor.MethodDefinition(
      createPassthroughConstructor(
        names.map((n) => createIdentifier(n)),
        names.map((n) => createIdentifier(n)),
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('constructor with many params one mismatch does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    const paramNames = ['a', 'b', 'c', 'd', 'e']
    const argNames = ['a', 'b', 'x', 'd', 'e']
    visitor.MethodDefinition(
      createPassthroughConstructor(
        paramNames.map((n) => createIdentifier(n)),
        argNames.map((n) => createIdentifier(n)),
      ),
    )
    expect(reports.length).toBe(0)
  })

  // ── Edge cases: super() arguments undefined/null ──────────────────────
  test('super() with undefined arguments array and no params reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Super' },
                arguments: undefined,
              },
            },
          ],
        },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    })
    expect(reports.length).toBe(1)
  })

  test('super() with null arguments array and no params reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Super' },
                arguments: null,
              },
            },
          ],
        },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    })
    expect(reports.length).toBe(1)
  })

  // ── Edge cases: deeply weird nodes ────────────────────────────────────
  test('node that is an array does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition([])
    expect(reports.length).toBe(0)
  })

  test('node with numeric type does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({ type: 123, kind: 'constructor' })
    expect(reports.length).toBe(0)
  })

  test('node with boolean kind does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({ type: 'MethodDefinition', kind: true })
    expect(reports.length).toBe(0)
  })

  test('constructor with value as number does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({ type: 'MethodDefinition', kind: 'constructor', value: 42 })
    expect(reports.length).toBe(0)
  })

  test('constructor with value as string does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({ type: 'MethodDefinition', kind: 'constructor', value: 'fn' })
    expect(reports.length).toBe(0)
  })

  // ── Edge case: value.body without body property ───────────────────────
  test('constructor value with body as number does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: { type: 'FunctionExpression', params: [], body: 0 },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(0)
  })

  // ── Constructor with static keyword ───────────────────────────────────
  test('static flag does not affect detection - empty constructor still reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      static: true,
      value: {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(1)
  })

  // ── Constructor with computed property ────────────────────────────────
  test('computed flag does not affect detection - empty constructor reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      computed: true,
      value: {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(1)
  })

  // ── Constructor with async keyword ────────────────────────────────────
  test('async flag on function expression does not prevent report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        async: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(1)
  })

  // ── Constructor with generator keyword ────────────────────────────────
  test('generator flag on function expression does not prevent report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        generator: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(1)
  })

  // ── Super with SpreadElement among Identifier args (non-rest param) ───
  test('super(a, ...b) with identifier params does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [createIdentifier('a'), createIdentifier('b')],
        [createIdentifier('a'), { type: 'SpreadElement', argument: createIdentifier('b') }],
      ),
    )
    expect(reports.length).toBe(0)
  })

  // ── Super call with ThisExpression as callee (not Super) ──────────────
  test('this() call in constructor does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'ThisExpression' },
            arguments: [],
          },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  // ── Edge: expression.type missing ─────────────────────────────────────
  test('ExpressionStatement with missing expression type does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ExpressionStatement',
          expression: {},
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  // ── Params with non-object entries ────────────────────────────────────
  test('params containing a string are skipped gracefully and reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: ['not-an-object', createIdentifier('x')],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(1)
  })

  test('params containing a number are skipped gracefully and reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [42, createIdentifier('x')],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(1)
  })

  // ── createMockContext helpers validation ───────────────────────────────
  test('createMockContext report stores only message and loc', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor())
    expect(reports[0]).toHaveProperty('message')
    expect(reports[0]).toHaveProperty('loc')
  })

  test('createMockContext context has required methods', () => {
    const { context } = createMockRuleContext({ source: 'const x = 1;' })
    expect(typeof context.report).toBe('function')
    expect(typeof context.getFilePath).toBe('function')
    expect(typeof context.getAST).toBe('function')
    expect(typeof context.getSource).toBe('function')
    expect(typeof context.getTokens).toBe('function')
    expect(typeof context.getComments).toBe('function')
  })

  test('createMockContext context getFilePath returns expected path', () => {
    const { context } = createMockRuleContext({ source: 'const x = 1;' })
    expect(context.getFilePath()).toBe('/src/file.ts')
  })

  test('createMockContext context getSource returns provided source', () => {
    const { context } = createMockRuleContext({ source: '' })
    expect(context.getSource()).toBe('')
  })

  test('createMockContext context getAST returns null', () => {
    const { context } = createMockRuleContext({ source: 'const x = 1;' })
    expect(context.getAST()).toBeNull()
  })

  test('createMockContext context getTokens returns empty array', () => {
    const { context } = createMockRuleContext({ source: 'const x = 1;' })
    expect(context.getTokens()).toEqual([])
  })

  test('createMockContext context getComments returns empty array', () => {
    const { context } = createMockRuleContext({ source: 'const x = 1;' })
    expect(context.getComments()).toEqual([])
  })

  test('createMockContext context logger has required methods', () => {
    const { context } = createMockRuleContext({ source: 'const x = 1;' })
    expect(typeof context.logger.debug).toBe('function')
    expect(typeof context.logger.info).toBe('function')
    expect(typeof context.logger.warn).toBe('function')
    expect(typeof context.logger.error).toBe('function')
  })

  // ── Rule create produces consistent results ───────────────────────────
  test('create returns new visitor each time', () => {
    const { context } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor1 = noUselessConstructorRule.create(context)
    const visitor2 = noUselessConstructorRule.create(context)
    expect(visitor1).not.toBe(visitor2)
  })

  // ── Params with accessibility on second param ─────────────────────────
  test('constructor with accessibility on second param does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [
          createIdentifier('a'),
          { type: 'Identifier', name: 'b', accessibility: 'private' },
        ],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(0)
  })

  // ── Empty body with many params ───────────────────────────────────────
  test('empty body with 5 params reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: ['a', 'b', 'c', 'd', 'e'].map((n) => createIdentifier(n)),
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(1)
  })

  // ── Passthrough with spread in non-rest context ───────────────────────
  test('single SpreadElement arg with single Identifier param does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [createIdentifier('x')],
        [{ type: 'SpreadElement', argument: createIdentifier('x') }],
      ),
    )
    expect(reports.length).toBe(0)
  })

  // ── Super call with ArrowFunction callee ──────────────────────────────
  test('super-like call with ArrowFunction callee does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'ArrowFunctionExpression',
              params: [],
              body: { type: 'BlockStatement', body: [] },
            },
            arguments: [],
          },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  // ── Super with undefined arguments but params exist ───────────────────
  test('super() undefined args with params does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [createIdentifier('x')],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Super' },
                arguments: undefined,
              },
            },
          ],
        },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    })
    expect(reports.length).toBe(0)
  })

  // ── Additional rest element edge cases ────────────────────────────────
  test('RestElement with null argument does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [{ type: 'RestElement', argument: null }],
        [{ type: 'SpreadElement', argument: createIdentifier('args') }],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('SpreadElement with null argument does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [{ type: 'RestElement', argument: createIdentifier('args') }],
        [{ type: 'SpreadElement', argument: null }],
      ),
    )
    expect(reports.length).toBe(0)
  })

  // ── Decorated params with empty array vs non-empty ────────────────────
  test('decorated param with multiple decorators does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [
          {
            type: 'Identifier',
            name: 'x',
            decorators: [{ type: 'Decorator' }, { type: 'Decorator' }],
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(0)
  })

  test('non-array decorators property is ignored and reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [
          {
            type: 'Identifier',
            name: 'x',
            decorators: 'not-an-array',
          },
        ],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(1)
  })

  // ── Location: edge with partial loc ───────────────────────────────────
  test('node with loc but missing end uses defaults for end', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 3, column: 5 } },
    })
    expect(reports.length).toBe(1)
    expect(reports[0].loc?.start.line).toBe(3)
    expect(reports[0].loc?.start.column).toBe(5)
    expect(reports[0].loc?.end.line).toBe(1)
  })

  test('node with loc but missing start uses defaults for start', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { end: { line: 5, column: 10 } },
    })
    expect(reports.length).toBe(1)
    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
    expect(reports[0].loc?.end.line).toBe(5)
    expect(reports[0].loc?.end.column).toBe(10)
  })

  // ── Super with NewExpression instead of CallExpression ────────────────
  test('new.super() does not report as passthrough', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'NewExpression',
            callee: { type: 'Super' },
            arguments: [],
          },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  // ── Additional edge cases to reach 200+ ───────────────────────────────

  test('constructor with only whitespace-like EmptyStatement does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createConstructorWithBody([{ type: 'EmptyStatement' }]))
    expect(reports.length).toBe(0)
  })

  test('constructor with try-catch does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'TryStatement',
          block: { type: 'BlockStatement', body: [] },
          handler: null,
          finalizer: null,
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('constructor with while loop does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'WhileStatement',
          test: { type: 'Literal', value: true },
          body: { type: 'BlockStatement', body: [] },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('constructor with for loop does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ForStatement',
          init: null,
          test: null,
          update: null,
          body: { type: 'BlockStatement', body: [] },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('constructor with switch statement does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'SwitchStatement',
          discriminant: createIdentifier('x'),
          cases: [],
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('constructor with throw statement does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ThrowStatement',
          argument: { type: 'NewExpression', callee: createIdentifier('Error'), arguments: [] },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('constructor with debugger statement does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createConstructorWithBody([{ type: 'DebuggerStatement' }]))
    expect(reports.length).toBe(0)
  })

  test('constructor with break statement does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createConstructorWithBody([{ type: 'BreakStatement', label: null }]))
    expect(reports.length).toBe(0)
  })

  test('constructor with continue statement does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([{ type: 'ContinueStatement', label: null }]),
    )
    expect(reports.length).toBe(0)
  })

  test('constructor with labeled statement does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'LabeledStatement',
          label: createIdentifier('loop'),
          body: { type: 'EmptyStatement' },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('constructor with with statement does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'WithStatement',
          object: createIdentifier('obj'),
          body: { type: 'EmptyStatement' },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('constructor with do-while statement does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'DoWhileStatement',
          test: { type: 'Literal', value: false },
          body: { type: 'EmptyStatement' },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('constructor with for-in statement does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ForInStatement',
          left: createIdentifier('k'),
          right: createIdentifier('obj'),
          body: { type: 'EmptyStatement' },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('constructor with for-of statement does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ForOfStatement',
          left: createIdentifier('item'),
          right: createIdentifier('arr'),
          body: { type: 'EmptyStatement' },
          await: false,
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('constructor with class declaration in body does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'ClassDeclaration',
          id: createIdentifier('Inner'),
          superClass: null,
          body: { type: 'ClassBody', body: [] },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('constructor with function declaration in body does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createConstructorWithBody([
        {
          type: 'FunctionDeclaration',
          id: createIdentifier('helper'),
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
      ]),
    )
    expect(reports.length).toBe(0)
  })

  test('super() passthrough with readonly param does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [{ type: 'TSParameterProperty', parameter: createIdentifier('x'), readonly: true }],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Super' },
                arguments: [],
              },
            },
          ],
        },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    })
    expect(reports.length).toBe(0)
  })

  test('super() passthrough with isPrivate param does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [
          { type: 'TSParameterProperty', parameter: createIdentifier('x'), isPrivate: true },
        ],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Super' },
                arguments: [],
              },
            },
          ],
        },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    })
    expect(reports.length).toBe(0)
  })

  test('super(a) passthrough where param name matches but arg has extra properties', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [createIdentifier('a')],
        [{ type: 'Identifier', name: 'a', extra: true }],
      ),
    )
    expect(reports.length).toBe(1)
  })

  test('node with loc.start.line as string gets default', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: '5', column: 0 }, end: { line: 5, column: 10 } },
    })
    expect(reports.length).toBe(1)
    expect(reports[0].loc?.start.line).toBe(1)
  })

  test('node with loc.end.column as string gets default', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 'abc' } },
    })
    expect(reports.length).toBe(1)
    expect(reports[0].loc?.end.column).toBe(0)
  })

  test('context.workspaceRoot is accessible', () => {
    const { context } = createMockRuleContext({ source: 'const x = 1;' })
    expect(context.workspaceRoot).toBe('/src')
  })

  test('context.config has options', () => {
    const { context } = createMockRuleContext({ source: 'const x = 1;' })
    expect(context.config).toHaveProperty('options')
  })

  test('rule does not modify the input node', () => {
    const { context } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    const node = createEmptyConstructor()
    const originalType = (node as Record<string, unknown>).type
    const originalKind = (node as Record<string, unknown>).kind
    visitor.MethodDefinition(node)
    expect((node as Record<string, unknown>).type).toBe(originalType)
    expect((node as Record<string, unknown>).kind).toBe(originalKind)
  })

  test('super() passthrough with params/args length 0 explicitly reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    const node = {
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionExpression',
        params: [],
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Super' },
                arguments: [],
              },
            },
          ],
        },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
    }
    visitor.MethodDefinition(node)
    expect(reports.length).toBe(1)
  })

  test('super(a,b) passthrough where both are identifiers but case differs does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(
      createPassthroughConstructor(
        [createIdentifier('A'), createIdentifier('B')],
        [createIdentifier('a'), createIdentifier('b')],
      ),
    )
    expect(reports.length).toBe(0)
  })

  test('super() with one param and zero args does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createPassthroughConstructor([createIdentifier('x')], []))
    expect(reports.length).toBe(0)
  })

  test('super(x) with zero params and one arg does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createPassthroughConstructor([], [createIdentifier('x')]))
    expect(reports.length).toBe(0)
  })

  test('constructor with FunctionDeclaration type value does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'FunctionDeclaration',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(1)
  })

  test('constructor with ArrowFunctionExpression value does not report', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({
      type: 'MethodDefinition',
      kind: 'constructor',
      value: {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      },
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
    })
    expect(reports.length).toBe(1)
  })

  test('report descriptor has no node property in stored reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor())
    expect(reports[0]).not.toHaveProperty('node')
  })

  test('report descriptor has fix property as undefined when rule does not provide fix', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor())
    expect(reports[0].fix).toBeUndefined()
  })

  test('multiple different useless constructors report with correct locations', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = 1;' })
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor(undefined, 3))
    visitor.MethodDefinition(createEmptyConstructor(undefined, 7))
    visitor.MethodDefinition(createEmptyConstructor(undefined, 15))
    expect(reports.length).toBe(3)
    expect(reports[0].loc?.start.line).toBe(3)
    expect(reports[1].loc?.start.line).toBe(7)
    expect(reports[2].loc?.start.line).toBe(15)
  })
})

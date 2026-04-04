import { describe, test, expect, vi } from 'vitest'
import { noUselessConstructorRule } from '../../../../src/rules/patterns/no-useless-constructor.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({ message: descriptor.message, loc: descriptor.loc })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => '',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [] },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    workspaceRoot: '/src',
  } as unknown as RuleContext
  return { context, reports }
}

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
    const { context } = createMockContext()
    const visitor = noUselessConstructorRule.create(context)
    expect(typeof visitor.MethodDefinition).toBe('function')
  })

  test('Empty constructor with no params reports', () => {
    const { context, reports } = createMockContext()
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor())
    expect(reports.length).toBe(1)
  })

  test('Empty constructor with empty body reports', () => {
    const { context, reports } = createMockContext()
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
    const { context, reports } = createMockContext()
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createPassthroughConstructor([], []))
    expect(reports.length).toBe(1)
  })

  test('Pass-through super(a, b) with matching params reports', () => {
    const { context, reports } = createMockContext()
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
    const { context, reports } = createMockContext()
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
    const { context, reports } = createMockContext()
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
    const { context, reports } = createMockContext()
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
    const { context, reports } = createMockContext()
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
    const { context, reports } = createMockContext()
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createRegularMethod())
    expect(reports.length).toBe(0)
  })

  test('Protected constructor does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor('protected'))
    expect(reports.length).toBe(0)
  })

  test('Private constructor does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor('private'))
    expect(reports.length).toBe(0)
  })

  test('null node does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(null)
    expect(reports.length).toBe(0)
  })

  test('non-MethodDefinition node does not report', () => {
    const { context, reports } = createMockContext()
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition({ type: 'FunctionDeclaration' })
    expect(reports.length).toBe(0)
  })

  test('Message mentions useless or constructor', () => {
    const { context, reports } = createMockContext()
    const visitor = noUselessConstructorRule.create(context)
    visitor.MethodDefinition(createEmptyConstructor())
    expect(reports.length).toBeGreaterThan(0)
    const message = reports[0].message.toLowerCase()
    expect(message.includes('useless') || message.includes('constructor')).toBe(true)
  })

  test('Location is reported correctly', () => {
    const { context, reports } = createMockContext()
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
})

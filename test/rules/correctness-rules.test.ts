import { describe, expect, it, vi } from 'vitest'

import type { ReportDescriptor, RuleContext, RuleVisitor } from '../../src/plugins/types.js'

import { noApproximateConstantsRule } from '../../src/rules/correctness/no-approximate-constants.js'
import { noAsyncConstructorRule } from '../../src/rules/correctness/no-async-constructor.js'
import { noConstantBinaryExpressionRule } from '../../src/rules/correctness/no-constant-binary-expression.js'
import { noEmptyCatchRule } from '../../src/rules/correctness/no-empty-catch.js'
import { noEmptyFunctionRule } from '../../src/rules/correctness/no-empty-function.js'

// ─── Mock context factory ───

function createMockContext(
  options: unknown = {},
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    config: { options: options as Record<string, unknown> },
    getAST: () => null,
    getComments: () => [],
    getFilePath: () => 'test.ts',
    getSource: () => '',
    getTokens: () => [],
    logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
    report(descriptor: ReportDescriptor) {
      reports.push(descriptor)
    },
    workspaceRoot: '/test',
  }

  return { context, reports }
}

// ─── Synthetic node helpers ───

function withLoc(node: Record<string, unknown>, line = 1, column = 0) {
  return {
    ...node,
    loc: {
      end: { column: column + 1, line },
      start: { column, line },
    },
  }
}

function literalNode(value: unknown, line = 1, column = 0) {
  return withLoc({ type: 'Literal', value }, line, column)
}

function methodDefinition(
  kind: string,
  fnProps: Record<string, unknown> = {},
  line = 1,
  column = 0,
) {
  return withLoc(
    {
      kind,
      type: 'MethodDefinition',
      value: { async: false, body: { body: [], type: 'BlockStatement' }, type: 'FunctionExpression', ...fnProps },
      ...({ key: { name: kind, type: 'Identifier' } }),
    },
    line,
    column,
  )
}

function catchClause(body: Record<string, unknown>, line = 1, column = 0) {
  return withLoc({ body, type: 'CatchClause' }, line, column)
}

function emptyBlock() {
  return { body: [], type: 'BlockStatement' }
}

function blockWith(statements: unknown[]) {
  return { body: statements, type: 'BlockStatement' }
}

// ─── no-approximate-constants ───

describe('no-approximate-constants', () => {
  it('reports approximate PI literal 3.14159', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noApproximateConstantsRule.create(context)

    visitor.Literal!(literalNode(3.14159))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Math.PI')
  })

  it('reports exact PI literal 3.141592653589793', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noApproximateConstantsRule.create(context)

    visitor.Literal!(literalNode(3.141592653589793))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Math.PI')
  })

  it('reports approximate E literal 2.71828', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noApproximateConstantsRule.create(context)

    visitor.Literal!(literalNode(2.71828))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Math.E')
  })

  it('reports SQRT2 approximate literal 1.41421', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noApproximateConstantsRule.create(context)

    visitor.Literal!(literalNode(1.41421))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Math.SQRT2')
  })

  it('reports golden ratio approximate literal 1.61803', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noApproximateConstantsRule.create(context)

    visitor.Literal!(literalNode(1.61803))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Golden ratio')
  })

  it('reports Euler-Mascheroni constant', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noApproximateConstantsRule.create(context)

    visitor.Literal!(literalNode(0.5772156649015329))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Euler-Mascheroni')
  })

  it('does not report ordinary number literals', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noApproximateConstantsRule.create(context)

    visitor.Literal!(literalNode(42))
    visitor.Literal!(literalNode(3.15))
    visitor.Literal!(literalNode(0))

    expect(reports).toHaveLength(0)
  })

  it('does not report string literals', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noApproximateConstantsRule.create(context)

    visitor.Literal!(literalNode('3.14159'))

    expect(reports).toHaveLength(0)
  })

  it('does not report non-Literal nodes', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noApproximateConstantsRule.create(context)

    visitor.Literal!(withLoc({ name: 'x', type: 'Identifier' }))

    expect(reports).toHaveLength(0)
  })

  it('captures location in reports', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noApproximateConstantsRule.create(context)

    visitor.Literal!(literalNode(3.14159, 5, 10))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.loc).toEqual({
      end: { column: 11, line: 5 },
      start: { column: 10, line: 5 },
    })
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noApproximateConstantsRule.meta.docs?.category).toBe('correctness')
    expect(noApproximateConstantsRule.meta.severity).toBe('warn')
    expect(noApproximateConstantsRule.meta.type).toBe('suggestion')
  })
})

// ─── no-async-constructor ───

describe('no-async-constructor', () => {
  it('reports async constructor', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAsyncConstructorRule.create(context)

    visitor.MethodDefinition!(
      methodDefinition('constructor', { async: true }),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Constructor should not be async')
  })

  it('does not report regular (non-async) constructor', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAsyncConstructorRule.create(context)

    visitor.MethodDefinition!(
      methodDefinition('constructor', { async: false }),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report async method that is not a constructor', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAsyncConstructorRule.create(context)

    visitor.MethodDefinition!(
      methodDefinition('method', { async: true }),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report non-MethodDefinition nodes', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAsyncConstructorRule.create(context)

    visitor.MethodDefinition!(
      withLoc({ type: 'FunctionDeclaration' }),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report constructor with non-FunctionExpression value', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAsyncConstructorRule.create(context)

    visitor.MethodDefinition!(
      withLoc({
        kind: 'constructor',
        type: 'MethodDefinition',
        value: { type: 'ArrowFunctionExpression', async: true },
      }),
    )

    expect(reports).toHaveLength(0)
  })

  it('reports multiple async constructors independently', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAsyncConstructorRule.create(context)

    visitor.MethodDefinition!(methodDefinition('constructor', { async: true }, 1, 0))
    visitor.MethodDefinition!(methodDefinition('constructor', { async: true }, 3, 5))

    expect(reports).toHaveLength(2)
  })

  it('captures location information in reports', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noAsyncConstructorRule.create(context)

    visitor.MethodDefinition!(
      methodDefinition('constructor', { async: true }, 7, 2),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.loc).toEqual({
      end: { column: 3, line: 7 },
      start: { column: 2, line: 7 },
    })
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noAsyncConstructorRule.meta.docs?.category).toBe('correctness')
    expect(noAsyncConstructorRule.meta.docs?.recommended).toBe(true)
    expect(noAsyncConstructorRule.meta.severity).toBe('error')
    expect(noAsyncConstructorRule.meta.type).toBe('problem')
  })
})

// ─── no-empty-catch ───

describe('no-empty-catch', () => {
  it('reports empty catch clause', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEmptyCatchRule.create(context)

    visitor.CatchClause!(catchClause(emptyBlock()))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Empty catch clause')
  })

  it('does not report catch clause with real statements', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEmptyCatchRule.create(context)

    visitor.CatchClause!(
      catchClause(blockWith([{ type: 'ExpressionStatement' }])),
    )

    expect(reports).toHaveLength(0)
  })

  it('reports catch clause with only EmptyStatement', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEmptyCatchRule.create(context)

    visitor.CatchClause!(
      catchClause(blockWith([{ type: 'EmptyStatement' }])),
    )

    expect(reports).toHaveLength(1)
  })

  it('does not report empty catch when allowComments is true and block has only EmptyStatements', () => {
    const { context, reports } = createMockContext([{ allowComments: true }])
    const visitor: RuleVisitor = noEmptyCatchRule.create(context)

    visitor.CatchClause!(
      catchClause(blockWith([{ type: 'EmptyStatement' }])),
    )

    expect(reports).toHaveLength(0)
  })

  it('reports empty catch when allowComments is false', () => {
    const { context, reports } = createMockContext([{ allowComments: false }])
    const visitor: RuleVisitor = noEmptyCatchRule.create(context)

    visitor.CatchClause!(catchClause(emptyBlock()))

    expect(reports).toHaveLength(1)
  })

  it('reports empty catch with null body by default', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEmptyCatchRule.create(context)

    visitor.CatchClause!(catchClause(emptyBlock()))

    expect(reports).toHaveLength(1)
  })

  it('does not report non-CatchClause nodes', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEmptyCatchRule.create(context)

    visitor.CatchClause!(withLoc({ type: 'TryStatement' }))

    expect(reports).toHaveLength(0)
  })

  it('reports catch clause with only BlockStatement children', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEmptyCatchRule.create(context)

    visitor.CatchClause!(
      catchClause(blockWith([{ type: 'BlockStatement', body: [] }])),
    )

    expect(reports).toHaveLength(1)
  })

  it('captures location information in reports', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEmptyCatchRule.create(context)

    visitor.CatchClause!(catchClause(emptyBlock(), 10, 4))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.loc).toEqual({
      end: { column: 5, line: 10 },
      start: { column: 4, line: 10 },
    })
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noEmptyCatchRule.meta.docs?.category).toBe('correctness')
    expect(noEmptyCatchRule.meta.docs?.recommended).toBe(true)
    expect(noEmptyCatchRule.meta.severity).toBe('warn')
    expect(noEmptyCatchRule.meta.type).toBe('problem')
  })
})

// ─── no-empty-function ───

describe('no-empty-function', () => {
  it('reports empty FunctionDeclaration', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEmptyFunctionRule.create(context)

    visitor.FunctionDeclaration!(
      withLoc({
        body: emptyBlock(),
        id: { name: 'emptyFn', type: 'Identifier' },
        type: 'FunctionDeclaration',
      }),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Unexpected empty function')
    expect(reports[0]!.message).toContain('emptyFn')
  })

  it('reports empty ArrowFunctionExpression with block body', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEmptyFunctionRule.create(context)

    visitor.ArrowFunctionExpression!(
      withLoc({
        body: emptyBlock(),
        type: 'ArrowFunctionExpression',
      }),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Unexpected empty arrow function')
  })

  it('does not report arrow function with expression body', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEmptyFunctionRule.create(context)

    visitor.ArrowFunctionExpression!(
      withLoc({
        body: { type: 'Identifier', name: 'x' },
        type: 'ArrowFunctionExpression',
      }),
    )

    expect(reports).toHaveLength(0)
  })

  it('reports empty FunctionExpression', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEmptyFunctionRule.create(context)

    visitor.FunctionExpression!(
      withLoc({
        body: emptyBlock(),
        type: 'FunctionExpression',
      }),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Unexpected empty function expression')
  })

  it('reports empty MethodDefinition', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEmptyFunctionRule.create(context)

    visitor.MethodDefinition!(
      methodDefinition('method'),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Unexpected empty method')
  })

  it('does not report empty arrow function when allowArrowFunctions is true', () => {
    const { context, reports } = createMockContext([{ allowArrowFunctions: true }])
    const visitor: RuleVisitor = noEmptyFunctionRule.create(context)

    visitor.ArrowFunctionExpression!(
      withLoc({
        body: emptyBlock(),
        type: 'ArrowFunctionExpression',
      }),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report async function when allowAsyncFunctions is true', () => {
    const { context, reports } = createMockContext([{ allowAsyncFunctions: true }])
    const visitor: RuleVisitor = noEmptyFunctionRule.create(context)

    visitor.FunctionDeclaration!(
      withLoc({
        async: true,
        body: emptyBlock(),
        type: 'FunctionDeclaration',
      }),
    )

    expect(reports).toHaveLength(0)
  })

  it('reports async function when allowAsyncFunctions is false', () => {
    const { context, reports } = createMockContext([{ allowAsyncFunctions: false }])
    const visitor: RuleVisitor = noEmptyFunctionRule.create(context)

    visitor.FunctionDeclaration!(
      withLoc({
        async: true,
        body: emptyBlock(),
        type: 'FunctionDeclaration',
      }),
    )

    expect(reports).toHaveLength(1)
  })

  it('does not report constructor with super call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEmptyFunctionRule.create(context)

    visitor.MethodDefinition!(
      withLoc({
        kind: 'constructor',
        type: 'MethodDefinition',
        value: {
          body: blockWith([
            {
              expression: {
                arguments: [],
                callee: { type: 'Super' },
                type: 'CallExpression',
              },
              type: 'ExpressionStatement',
            },
          ]),
          type: 'FunctionExpression',
        },
      }),
    )

    expect(reports).toHaveLength(0)
  })

  it('reports constructor without super call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEmptyFunctionRule.create(context)

    visitor.MethodDefinition!(
      methodDefinition('constructor'),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Unexpected empty constructor')
  })

  it('does not report constructor when allowConstructors is true', () => {
    const { context, reports } = createMockContext([{ allowConstructors: true }])
    const visitor: RuleVisitor = noEmptyFunctionRule.create(context)

    visitor.MethodDefinition!(
      methodDefinition('constructor'),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report method with override decorator when allowOverrideMethods is true', () => {
    const { context, reports } = createMockContext([{ allowOverrideMethods: true }])
    const visitor: RuleVisitor = noEmptyFunctionRule.create(context)

    visitor.MethodDefinition!(
      withLoc({
        decorators: [{ expression: { name: 'override', type: 'Identifier' } }],
        kind: 'method',
        type: 'MethodDefinition',
        value: {
          body: emptyBlock(),
          type: 'FunctionExpression',
        },
      }),
    )

    expect(reports).toHaveLength(0)
  })

  it('reports method with override decorator when allowOverrideMethods is false', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEmptyFunctionRule.create(context)

    visitor.MethodDefinition!(
      withLoc({
        decorators: [{ expression: { name: 'override', type: 'Identifier' } }],
        kind: 'method',
        type: 'MethodDefinition',
        value: {
          body: emptyBlock(),
          type: 'FunctionExpression',
        },
      }),
    )

    expect(reports).toHaveLength(1)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noEmptyFunctionRule.meta.docs?.category).toBe('correctness')
    expect(noEmptyFunctionRule.meta.docs?.recommended).toBe(true)
    expect(noEmptyFunctionRule.meta.severity).toBe('warn')
    expect(noEmptyFunctionRule.meta.type).toBe('problem')
  })
})

// ─── no-constant-binary-expression ───

describe('no-constant-binary-expression', () => {
  function binaryExpr(
    operator: string,
    left: Record<string, unknown>,
    right: Record<string, unknown>,
    line = 1,
    column = 0,
  ) {
    return withLoc({ left, operator, right, type: 'BinaryExpression' }, line, column)
  }

  it('reports comparison with boolean true on the right', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noConstantBinaryExpressionRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('===', { name: 'x', type: 'Identifier' }, { type: 'Literal', value: true }),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('constant boolean')
    expect(reports[0]!.message).toContain('right side')
  })

  it('reports comparison with boolean false on the left', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noConstantBinaryExpressionRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('!==', { type: 'Literal', value: false }, { name: 'y', type: 'Identifier' }),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('constant boolean')
    expect(reports[0]!.message).toContain('left side')
  })

  it('reports comparison with numeric constant 0', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noConstantBinaryExpressionRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('===', { name: 'count', type: 'Identifier' }, { type: 'Literal', value: 0 }),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('constant numeric')
  })

  it('reports comparison with negated boolean !true', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noConstantBinaryExpressionRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr(
        '!==',
        { argument: { type: 'Literal', value: true }, operator: '!', type: 'UnaryExpression' },
        { name: 'flag', type: 'Identifier' },
      ),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('constant boolean')
  })

  it('does not report comparison between two variables', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noConstantBinaryExpressionRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('===', { name: 'x', type: 'Identifier' }, { name: 'y', type: 'Identifier' }),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report non-equality binary operators', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noConstantBinaryExpressionRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('==', { name: 'x', type: 'Identifier' }, { type: 'Literal', value: true }),
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report comparison with string literal', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noConstantBinaryExpressionRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('===', { name: 'x', type: 'Identifier' }, { type: 'Literal', value: 'hello' }),
    )

    expect(reports).toHaveLength(0)
  })

  it('reports both sides constant (reports the left)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noConstantBinaryExpressionRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('===', { type: 'Literal', value: true }, { type: 'Literal', value: false }),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('left side')
  })

  it('captures location information in reports', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noConstantBinaryExpressionRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr(
        '===',
        { name: 'x', type: 'Identifier' },
        { type: 'Literal', value: 1 },
        8,
        12,
      ),
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.loc).toEqual({
      end: { column: 13, line: 8 },
      start: { column: 12, line: 8 },
    })
  })

  it('does not report UnaryExpression with non-boolean literal', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noConstantBinaryExpressionRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr(
        '===',
        { argument: { type: 'Literal', value: 42 }, operator: '!', type: 'UnaryExpression' },
        { name: 'x', type: 'Identifier' },
      ),
    )

    expect(reports).toHaveLength(0)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noConstantBinaryExpressionRule.meta.docs?.category).toBe('correctness')
    expect(noConstantBinaryExpressionRule.meta.docs?.recommended).toBe(true)
    expect(noConstantBinaryExpressionRule.meta.severity).toBe('warn')
    expect(noConstantBinaryExpressionRule.meta.type).toBe('problem')
  })
})

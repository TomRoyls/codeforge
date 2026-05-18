import { describe, expect, it, vi } from 'vitest'

import type { ReportDescriptor, RuleContext } from '../../src/plugins/types.js'

import { noNestedTemplateLiteralsRule } from '../../src/rules/best-practices/no-nested-template-literals.js'
import { noCompareNegationRule } from '../../src/rules/correctness/no-compare-negation.js'
import { noUnnecessaryNullishCoalescingRule } from '../../src/rules/patterns/no-unnecessary-nullish-coalescing.js'

// ─── Mock context factory ───

function createMockContext(
  options: Record<string, unknown> = {},
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    config: { options },
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

function binaryExpr(
  operator: string,
  left: Record<string, unknown>,
  right: Record<string, unknown>,
  line = 1,
  column = 0,
) {
  return withLoc(
    {
      left,
      operator,
      right,
      type: 'BinaryExpression',
    },
    line,
    column,
  )
}

function identifier(name: string): Record<string, unknown> {
  return { name, type: 'Identifier' }
}

function literal(value: unknown): Record<string, unknown> {
  return { type: 'Literal', value }
}

function unaryExpr(
  operator: string,
  argument: Record<string, unknown>,
  line = 1,
  column = 0,
): Record<string, unknown> {
  return withLoc(
    {
      argument,
      operator,
      prefix: true,
      type: 'UnaryExpression',
    },
    line,
    column,
  )
}

function templateLiteral(line = 1, column = 0): Record<string, unknown> {
  return withLoc(
    {
      expressions: [],
      quasis: [],
      type: 'TemplateLiteral',
    },
    line,
    column,
  )
}

function templateExpression(
  expression: Record<string, unknown>,
  line = 1,
  column = 0,
): Record<string, unknown> {
  return withLoc(
    {
      expression,
      type: 'TemplateExpression',
    },
    line,
    column,
  )
}

// ─── no-nested-template-literals ───

describe('no-nested-template-literals rule', () => {
  it('reports nested template literal inside template expression', () => {
    const { context, reports } = createMockContext()
    const visitor = noNestedTemplateLiteralsRule.create(context)

    const inner = templateLiteral()
    inner.parent = templateExpression(identifier('x'))

    visitor.TemplateLiteral!(inner)

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Unexpected nested template literal')
    expect(reports[0]!.message).toContain('Extract the inner template')
  })

  it('does not report top-level template literal without parent', () => {
    const { context, reports } = createMockContext()
    const visitor = noNestedTemplateLiteralsRule.create(context)

    visitor.TemplateLiteral!(templateLiteral())

    expect(reports).toHaveLength(0)
  })

  it('does not report template literal with non-template-expression parent', () => {
    const { context, reports } = createMockContext()
    const visitor = noNestedTemplateLiteralsRule.create(context)

    const node = templateLiteral()
    node.parent = { type: 'CallExpression', arguments: [], callee: identifier('fn') }

    visitor.TemplateLiteral!(node)

    expect(reports).toHaveLength(0)
  })

  it('does not report template literal with VariableDeclarator parent', () => {
    const { context, reports } = createMockContext()
    const visitor = noNestedTemplateLiteralsRule.create(context)

    const node = templateLiteral()
    node.parent = { id: identifier('str'), type: 'VariableDeclarator' }

    visitor.TemplateLiteral!(node)

    expect(reports).toHaveLength(0)
  })

  it('does not crash on non-TemplateLiteral node type', () => {
    const { context, reports } = createMockContext()
    const visitor = noNestedTemplateLiteralsRule.create(context)

    visitor.TemplateLiteral!({ type: 'Literal', value: 42 })

    expect(reports).toHaveLength(0)
  })

  it('does not crash on null node', () => {
    const { context, reports } = createMockContext()
    const visitor = noNestedTemplateLiteralsRule.create(context)

    visitor.TemplateLiteral!(null)

    expect(reports).toHaveLength(0)
  })

  it('does not crash on node with null parent', () => {
    const { context, reports } = createMockContext()
    const visitor = noNestedTemplateLiteralsRule.create(context)

    const node = templateLiteral()
    node.parent = null

    visitor.TemplateLiteral!(node)

    expect(reports).toHaveLength(0)
  })

  it('captures location in report', () => {
    const { context, reports } = createMockContext()
    const visitor = noNestedTemplateLiteralsRule.create(context)

    const inner = templateLiteral(8, 4)
    inner.parent = templateExpression(identifier('x'))

    visitor.TemplateLiteral!(inner)

    expect(reports).toHaveLength(1)
    expect(reports[0]!.loc).toEqual({
      end: { column: 5, line: 8 },
      start: { column: 4, line: 8 },
    })
  })

  it('reports multiple nested template literals independently', () => {
    const { context, reports } = createMockContext()
    const visitor = noNestedTemplateLiteralsRule.create(context)

    const inner1 = templateLiteral()
    inner1.parent = templateExpression(identifier('a'))

    const inner2 = templateLiteral()
    inner2.parent = templateExpression(identifier('b'))

    const outer = templateLiteral()

    visitor.TemplateLiteral!(inner1)
    visitor.TemplateLiteral!(inner2)
    visitor.TemplateLiteral!(outer)

    expect(reports).toHaveLength(2)
  })

  it('has correct meta properties', () => {
    expect(noNestedTemplateLiteralsRule.meta.docs?.category).toBe('best-practices')
    expect(noNestedTemplateLiteralsRule.meta.docs?.recommended).toBe(false)
    expect(noNestedTemplateLiteralsRule.meta.severity).toBe('warn')
    expect(noNestedTemplateLiteralsRule.meta.type).toBe('suggestion')
  })
})

// ─── no-compare-negation ───

describe('no-compare-negation rule', () => {
  it('reports !x === y', () => {
    const { context, reports } = createMockContext()
    const visitor = noCompareNegationRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('===', unaryExpr('!', identifier('x')), identifier('y'))
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Unexpected negation')
    expect(reports[0]!.message).toContain('===')
  })

  it('reports !x !== y', () => {
    const { context, reports } = createMockContext()
    const visitor = noCompareNegationRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('!==', unaryExpr('!', identifier('x')), identifier('y'))
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('!==')
  })

  it('reports !x == y', () => {
    const { context, reports } = createMockContext()
    const visitor = noCompareNegationRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('==', unaryExpr('!', identifier('x')), identifier('y'))
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('==')
  })

  it('reports !x != y', () => {
    const { context, reports } = createMockContext()
    const visitor = noCompareNegationRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('!=', unaryExpr('!', identifier('x')), identifier('y'))
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('!=')
  })

  it('does not report x === y without negation', () => {
    const { context, reports } = createMockContext()
    const visitor = noCompareNegationRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('===', identifier('x'), identifier('y'))
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report negation with non-comparison operators', () => {
    const { context, reports } = createMockContext()
    const visitor = noCompareNegationRule.create(context)

    for (const op of ['&&', '||', '+', '-', '*', '/', '<', '>', '<=', '>=', '??']) {
      visitor.BinaryExpression!(
        binaryExpr(op, unaryExpr('!', identifier('x')), identifier('y'))
      )
    }

    expect(reports).toHaveLength(0)
  })

  it('does not report comparison with non-negation unary operator', () => {
    const { context, reports } = createMockContext()
    const visitor = noCompareNegationRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('===', unaryExpr('-', identifier('x')), identifier('y'))
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report comparison with typeof unary operator', () => {
    const { context, reports } = createMockContext()
    const visitor = noCompareNegationRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('===', unaryExpr('typeof', identifier('x')), literal('string'))
    )

    expect(reports).toHaveLength(0)
  })

  it('does not crash on non-BinaryExpression node type', () => {
    const { context, reports } = createMockContext()
    const visitor = noCompareNegationRule.create(context)

    visitor.BinaryExpression!({ type: 'Literal', value: 42 })

    expect(reports).toHaveLength(0)
  })

  it('does not crash on null node', () => {
    const { context, reports } = createMockContext()
    const visitor = noCompareNegationRule.create(context)

    visitor.BinaryExpression!(null)

    expect(reports).toHaveLength(0)
  })

  it('captures location of the negation expression in report', () => {
    const { context, reports } = createMockContext()
    const visitor = noCompareNegationRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('===', unaryExpr('!', identifier('x'), 5, 10), identifier('y'))
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.loc).toEqual({
      end: { column: 11, line: 5 },
      start: { column: 10, line: 5 },
    })
  })

  it('reports multiple violations independently', () => {
    const { context, reports } = createMockContext()
    const visitor = noCompareNegationRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('===', unaryExpr('!', identifier('a')), identifier('b'))
    )
    visitor.BinaryExpression!(
      binaryExpr('==', identifier('c'), identifier('d'))
    )
    visitor.BinaryExpression!(
      binaryExpr('!=', unaryExpr('!', identifier('e')), identifier('f'))
    )

    expect(reports).toHaveLength(2)
  })

  it('has correct meta properties', () => {
    expect(noCompareNegationRule.meta.docs?.category).toBe('patterns')
    expect(noCompareNegationRule.meta.docs?.recommended).toBe(true)
    expect(noCompareNegationRule.meta.severity).toBe('warn')
    expect(noCompareNegationRule.meta.type).toBe('problem')
  })
})

// ─── no-unnecessary-nullish-coalescing ───

describe('no-unnecessary-nullish-coalescing rule', () => {
  it('reports ?? null (identifier)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullishCoalescingRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('??', identifier('a'), identifier('null'))
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Unnecessary nullish coalescing')
    expect(reports[0]!.message).toContain('null or undefined')
  })

  it('reports ?? undefined (identifier)', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullishCoalescingRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('??', identifier('a'), identifier('undefined'))
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('null or undefined')
  })

  it('reports ?? with NullLiteral node', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullishCoalescingRule.create(context)

    const nullLiteral: Record<string, unknown> = { type: 'NullLiteral' }

    visitor.BinaryExpression!(
      binaryExpr('??', identifier('a'), nullLiteral)
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Unnecessary nullish coalescing with null')
  })

  it('does not report ?? with string fallback', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullishCoalescingRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('??', identifier('a'), literal('fallback'))
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report ?? with numeric fallback', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullishCoalescingRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('??', identifier('a'), literal(0))
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report ?? with identifier fallback', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullishCoalescingRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('??', identifier('a'), identifier('defaultValue'))
    )

    expect(reports).toHaveLength(0)
  })

  it('does not report non-?? operators with null identifier', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullishCoalescingRule.create(context)

    for (const op of ['||', '&&', '===', '==']) {
      visitor.BinaryExpression!(
        binaryExpr(op, identifier('a'), identifier('null'))
      )
    }

    expect(reports).toHaveLength(0)
  })

  it('does not crash on non-BinaryExpression node type', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullishCoalescingRule.create(context)

    visitor.BinaryExpression!({ type: 'Literal', value: 42 })

    expect(reports).toHaveLength(0)
  })

  it('does not crash on null node', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullishCoalescingRule.create(context)

    visitor.BinaryExpression!(null)

    expect(reports).toHaveLength(0)
  })

  it('does not crash when right side is null', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullishCoalescingRule.create(context)

    const node = withLoc({
      left: identifier('a'),
      operator: '??',
      right: null,
      type: 'BinaryExpression',
    })

    visitor.BinaryExpression!(node)

    expect(reports).toHaveLength(0)
  })

  it('captures location in report for identifier null', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullishCoalescingRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('??', identifier('a'), identifier('null'), 7, 3)
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]!.loc).toEqual({
      end: { column: 4, line: 7 },
      start: { column: 3, line: 7 },
    })
  })

  it('reports multiple violations independently', () => {
    const { context, reports } = createMockContext()
    const visitor = noUnnecessaryNullishCoalescingRule.create(context)

    visitor.BinaryExpression!(
      binaryExpr('??', identifier('a'), identifier('null'))
    )
    visitor.BinaryExpression!(
      binaryExpr('??', identifier('b'), literal('fallback'))
    )
    visitor.BinaryExpression!(
      binaryExpr('??', identifier('c'), identifier('undefined'))
    )

    expect(reports).toHaveLength(2)
  })

  it('has correct meta properties', () => {
    expect(noUnnecessaryNullishCoalescingRule.meta.docs?.category).toBe('patterns')
    expect(noUnnecessaryNullishCoalescingRule.meta.docs?.recommended).toBe(false)
    expect(noUnnecessaryNullishCoalescingRule.meta.severity).toBe('warn')
    expect(noUnnecessaryNullishCoalescingRule.meta.type).toBe('suggestion')
  })
})

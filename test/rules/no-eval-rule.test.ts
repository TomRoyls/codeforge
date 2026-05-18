/**
 * @file Proof-of-concept tests for the no-eval rule.
 *
 * Testing pattern:
 *   1. Import the rule's `RuleDefinition` (plugin-level, not adapted).
 *   2. Create a mock `RuleContext` that captures `report()` calls.
 *   3. Call `rule.create(context)` to obtain the `RuleVisitor`.
 *   4. Craft synthetic AST nodes that match what the rule expects
 *      (the rule uses `toASTNode()` which just casts `unknown` → `ASTNode`).
 *   5. Invoke the relevant visitor handler with the synthetic node.
 *   6. Assert violations via the captured reports.
 *
 * This avoids the full adapter/ts-morph pipeline and tests rule logic in isolation.
 */

import { describe, expect, it, vi } from 'vitest'

import type { ReportDescriptor, RuleContext, RuleVisitor } from '../../src/plugins/types.js'

import { noEvalRule } from '../../src/rules/security/no-eval.js'

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

/** Minimal node shape with location that satisfies `extractLocation()` + `toASTNode()`. */
function withLoc(node: Record<string, unknown>, line = 1, column = 0) {
  return {
    ...node,
    loc: {
      end: { column: column + 1, line },
      start: { column, line },
    },
  }
}

/** `eval("code")` — CallExpression with Identifier callee. */
function evalCall(line = 1, column = 0) {
  return withLoc(
    {
      arguments: [{ type: 'Literal', value: 'code' }],
      callee: { name: 'eval', type: 'Identifier' },
      type: 'CallExpression',
    },
    line,
    column,
  )
}

/** `Function("code")` — CallExpression with Identifier callee. */
function functionCall(line = 1, column = 0) {
  return withLoc(
    {
      arguments: [{ type: 'Literal', value: 'return 1' }],
      callee: { name: 'Function', type: 'Identifier' },
      type: 'CallExpression',
    },
    line,
    column,
  )
}

/** `window.eval("code")` — CallExpression with MemberExpression callee. */
function memberEvalCall(methodName: string, line = 1, column = 0) {
  return withLoc(
    {
      arguments: [{ type: 'Literal', value: 'code' }],
      callee: {
        object: { name: 'window', type: 'Identifier' },
        property: { name: methodName, type: 'Identifier' },
        type: 'MemberExpression',
      },
      type: 'CallExpression',
    },
    line,
    column,
  )
}

/** `new Function("code")` — NewExpression. */
function newFunctionExpr(line = 1, column = 0) {
  return withLoc(
    {
      arguments: [{ type: 'Literal', value: 'return 1' }],
      callee: { name: 'Function', type: 'Identifier' },
      type: 'NewExpression',
    },
    line,
    column,
  )
}

/** `with (obj) {}` — WithStatement. */
function withStatement(line = 1, column = 0) {
  return withLoc(
    {
      body: { body: [], type: 'BlockStatement' },
      object: { name: 'obj', type: 'Identifier' },
      type: 'WithStatement',
    },
    line,
    column,
  )
}

/** A safe call like `console.log()` — should NOT trigger. */
function safeCall() {
  return withLoc({
    arguments: [],
    callee: {
      object: { name: 'console', type: 'Identifier' },
      property: { name: 'log', type: 'Identifier' },
      type: 'MemberExpression',
    },
    type: 'CallExpression',
  })
}

// ─── Tests ───

describe('no-eval rule', () => {
  it('reports eval() call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEvalRule.create(context)

    visitor.CallExpression!(evalCall())

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("Unexpected use of 'eval'")
  })

  it('reports Function() constructor call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEvalRule.create(context)

    visitor.CallExpression!(functionCall())

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("Unexpected use of 'Function'")
  })

  it('reports new Function() as NewExpression', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEvalRule.create(context)

    visitor.NewExpression!(newFunctionExpr())

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("Unexpected use of 'new Function()")
  })

  it('reports member expression calls to dangerous functions (setTimeout)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEvalRule.create(context)

    visitor.CallExpression!(memberEvalCall('setTimeout'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("Unexpected use of 'setTimeout'")
  })

  it('reports member expression calls to eval', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEvalRule.create(context)

    visitor.CallExpression!(memberEvalCall('eval'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("Unexpected use of 'eval'")
  })

  it('does not report safe calls', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEvalRule.create(context)

    visitor.CallExpression!(safeCall())

    expect(reports).toHaveLength(0)
  })

  it('reports with statement by default', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEvalRule.create(context)

    visitor.WithStatement!(withStatement())

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Unexpected use of with statement')
  })

  it('does not report with statement when allowWith is true', () => {
    const { context, reports } = createMockContext([{ allowWith: true }])
    const visitor: RuleVisitor = noEvalRule.create(context)

    visitor.WithStatement!(withStatement())

    expect(reports).toHaveLength(0)
  })

  it('does not report indirect eval when allowIndirect is true and callee is MemberExpression', () => {
    const { context, reports } = createMockContext([{ allowIndirect: true }])
    const visitor: RuleVisitor = noEvalRule.create(context)

    // window.eval("code") — indirect via member expression
    visitor.CallExpression!(memberEvalCall('eval'))

    expect(reports).toHaveLength(0)
  })

  it('still reports direct eval when allowIndirect is true', () => {
    const { context, reports } = createMockContext([{ allowIndirect: true }])
    const visitor: RuleVisitor = noEvalRule.create(context)

    // Direct eval("code") — not via member expression
    visitor.CallExpression!(evalCall())

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain("Unexpected use of 'eval'")
  })

  it('reports multiple violations independently', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEvalRule.create(context)

    visitor.CallExpression!(evalCall(1, 0))
    visitor.CallExpression!(evalCall(3, 5))
    visitor.NewExpression!(newFunctionExpr(7, 0))

    expect(reports).toHaveLength(3)
  })

  it('captures location information in reports', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noEvalRule.create(context)

    visitor.CallExpression!(evalCall(4, 8))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.loc).toEqual({
      end: { column: 9, line: 4 },
      start: { column: 8, line: 4 },
    })
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noEvalRule.meta.docs?.category).toBe('security')
    expect(noEvalRule.meta.docs?.recommended).toBe(true)
    expect(noEvalRule.meta.severity).toBe('error')
    expect(noEvalRule.meta.type).toBe('problem')
    expect(noEvalRule.meta.fixable).toBe('code')
  })
})

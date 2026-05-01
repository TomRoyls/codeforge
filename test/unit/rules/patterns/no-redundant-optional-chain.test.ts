import { describe, expect, test, vi } from 'vitest'
import { noRedundantOptionalChainRule } from '../../../../src/rules/patterns/no-redundant-optional-chain.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
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
    getSource: () => 'a.b?.c',
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

function makeMemberExpr(
  optional: boolean,
  object: unknown,
  property: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 5,
): unknown {
  return {
    type: 'MemberExpression',
    optional,
    object,
    property,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeIdentifier(name: string): unknown {
  return { type: 'Identifier', name, loc: makeLoc(1, 0, 1, name.length) }
}

// ===== META TESTS (8) =====

describe('no-redundant-optional-chain rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noRedundantOptionalChainRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noRedundantOptionalChainRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noRedundantOptionalChainRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noRedundantOptionalChainRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noRedundantOptionalChainRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning optional chaining', () => {
      const desc = noRedundantOptionalChainRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/optional/)
    })

    test('should have correct docs URL', () => {
      expect(noRedundantOptionalChainRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-redundant-optional-chain',
      )
    })

    test('should have empty schema', () => {
      expect(noRedundantOptionalChainRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with MemberExpression', () => {
      const { context } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      expect(visitor).toHaveProperty('MemberExpression')
      expect(typeof visitor.MemberExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noRedundantOptionalChainRule).toBeDefined()
      expect(noRedundantOptionalChainRule.meta).toBeDefined()
      expect(noRedundantOptionalChainRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS REDUNDANT OPTIONAL CHAIN (20) =====

  describe('positive cases — reports redundant optional chain', () => {
    test('reports a.b?.c where inner is non-optional MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('report message mentions "redundant"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports[0].message.toLowerCase()).toContain('redundant')
    })

    test('report message mentions "non-optional"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports[0].message.toLowerCase()).toContain('non-optional')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the outer MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports[0].node).toBe(outer)
    })

    test('reports for deeply nested chain: a.b.c?.d', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const innerInner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const inner = makeMemberExpr(false, innerInner, makeIdentifier('c'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('d'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('reports with computed property access: a.b?.["c"]', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, { type: 'Literal', value: 'c' })
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner1 = makeMemberExpr(false, makeIdentifier('x'), makeIdentifier('y'))
      const outer1 = makeMemberExpr(true, inner1, makeIdentifier('z'))
      const inner2 = makeMemberExpr(false, makeIdentifier('p'), makeIdentifier('q'))
      const outer2 = makeMemberExpr(true, inner2, makeIdentifier('r'))
      visitor.MemberExpression(outer1)
      visitor.MemberExpression(outer2)
      expect(reports.length).toBe(2)
    })

    test('report loc reflects the outer node location', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'), 3, 5, 3, 12)
      visitor.MemberExpression(outer)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports when inner has optional undefined (falsy)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = { type: 'MemberExpression', object: makeIdentifier('a'), property: makeIdentifier('b'), loc: makeLoc(1, 0, 1, 3) }
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('reports when inner has optional false explicitly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('reports with longer property names', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('namespace'), makeIdentifier('module'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('export'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('reports message contains "Remove"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports[0].message).toContain('Remove')
    })

    test('reports message contains "?." reference', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports[0].message).toContain('?.')
    })

    test('reports for single-letter identifiers a.b?.c', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop?.subprop pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('obj'), makeIdentifier('prop'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('subprop'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('report loc has both start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner1 = makeMemberExpr(false, makeIdentifier('x'), makeIdentifier('y'))
      const outer1 = makeMemberExpr(true, inner1, makeIdentifier('z'))
      const inner2 = makeMemberExpr(false, makeIdentifier('p'), makeIdentifier('q'))
      const outer2 = makeMemberExpr(true, inner2, makeIdentifier('r'))
      visitor.MemberExpression(outer1)
      visitor.MemberExpression(outer2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('message is exactly as defined in the rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports[0].message).toBe(
        "Optional chaining is redundant here because the base is already non-optional. Remove the unnecessary '?.'.",
      )
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for fully optional chain a?.b?.c', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(true, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(0)
    })

    test('does not report for fully non-optional a.b.c', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(false, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(0)
    })

    test('does not report for simple optional a?.b', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const outer = makeMemberExpr(true, makeIdentifier('a'), makeIdentifier('b'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(0)
    })

    test('does not report for simple non-optional a.b', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const outer = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      expect(() => visitor.MemberExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      expect(() => visitor.MemberExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      expect(() => visitor.MemberExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression(makeIdentifier('foo'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is Identifier (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const outer = makeMemberExpr(true, makeIdentifier('a'), makeIdentifier('b'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(0)
    })

    test('does not report when object is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const callExpr = { type: 'CallExpression', callee: makeIdentifier('fn'), arguments: [], loc: makeLoc(1, 0, 1, 5) }
      const outer = makeMemberExpr(true, callExpr, makeIdentifier('prop'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(0)
    })

    test('does not report when outer is non-optional and inner is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(false, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(0)
    })

    test('does not report when inner is optional true', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(true, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(0)
    })

    test('does not report for non-object node (string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      expect(() => visitor.MemberExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for non-object node (number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      expect(() => visitor.MemberExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'ObjectExpression', properties: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for NewExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'NewExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 8) })
      expect(reports.length).toBe(0)
    })

    test('does not report for AssignmentExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'AssignmentExpression', operator: '=', left: {}, right: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'MemberExpression', optional: true, property: makeIdentifier('c'), loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'MemberExpression', optional: true, object: null, property: makeIdentifier('c'), loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'MemberExpression', optional: true, object: 'string', property: makeIdentifier('c'), loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for a?.b.c (inner non-optional, outer optional, but object is optional)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(true, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(false, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(0)
    })

    test('does not report for a?.b?.c?.d (all optional)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const innerInner = makeMemberExpr(true, makeIdentifier('a'), makeIdentifier('b'))
      const inner = makeMemberExpr(true, innerInner, makeIdentifier('c'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('d'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression({ type: 'StringLiteral', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (30) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noRedundantOptionalChainRule.create(ctx1)
      const visitor2 = noRedundantOptionalChainRule.create(ctx2)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor1.MemberExpression(outer)
      visitor2.MemberExpression(makeMemberExpr(false, makeIdentifier('x'), makeIdentifier('y')))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner1 = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      visitor.MemberExpression(makeMemberExpr(true, inner1, makeIdentifier('c')))
      visitor.MemberExpression(makeMemberExpr(false, makeIdentifier('x'), makeIdentifier('y')))
      const inner3 = makeMemberExpr(false, makeIdentifier('p'), makeIdentifier('q'))
      visitor.MemberExpression(makeMemberExpr(true, inner3, makeIdentifier('r')))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = { type: 'MemberExpression', optional: false, object: makeIdentifier('a'), property: makeIdentifier('b') }
      const outer = { type: 'MemberExpression', optional: true, object: inner, property: makeIdentifier('c') }
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = { type: 'MemberExpression', optional: false, object: makeIdentifier('a'), property: makeIdentifier('b') }
      const outer = { type: 'MemberExpression', optional: true, object: inner, property: makeIdentifier('c') }
      visitor.MemberExpression(outer)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      visitor.MemberExpression(makeMemberExpr(true, makeIdentifier('a'), makeIdentifier('b')))
      const inner2 = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      visitor.MemberExpression(makeMemberExpr(true, inner2, makeIdentifier('c')))
      const inner3 = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      visitor.MemberExpression(makeMemberExpr(false, inner3, makeIdentifier('c')))
      const inner4 = makeMemberExpr(false, makeIdentifier('x'), makeIdentifier('y'))
      visitor.MemberExpression(makeMemberExpr(true, inner4, makeIdentifier('z')))
      const inner5 = makeMemberExpr(true, makeIdentifier('a'), makeIdentifier('b'))
      visitor.MemberExpression(makeMemberExpr(true, inner5, makeIdentifier('c')))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noRedundantOptionalChainRule.create(context)
      const visitor2 = noRedundantOptionalChainRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noRedundantOptionalChainRule.meta
      const meta2 = noRedundantOptionalChainRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = { type: 'MemberExpression', optional: false, object: makeIdentifier('a'), property: makeIdentifier('b'), loc: makeLoc(1, 0, 1, 3), range: [0, 3], extra: true }
      const outer = { type: 'MemberExpression', optional: true, object: inner, property: makeIdentifier('c'), loc: makeLoc(1, 0, 1, 6), range: [0, 6], extra: true }
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = { type: 'MemberExpression', optional: false, object: makeIdentifier('a'), property: makeIdentifier('b'), loc: {} }
      const outer = { type: 'MemberExpression', optional: true, object: inner, property: makeIdentifier('c'), loc: {} }
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = { type: 'MemberExpression', optional: false, object: makeIdentifier('a'), property: makeIdentifier('b'), loc: { start: { line: 3, column: 5 } } }
      const outer = { type: 'MemberExpression', optional: true, object: inner, property: makeIdentifier('c'), loc: { start: { line: 3, column: 5 } } }
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      visitor.MemberExpression(outer)
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(3)
    })

    test('rule name is exported correctly', () => {
      expect(noRedundantOptionalChainRule).toBeDefined()
      expect(typeof noRedundantOptionalChainRule.create).toBe('function')
      expect(typeof noRedundantOptionalChainRule.meta).toBe('object')
    })

    test('reports only once per node for same redundant chain', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('handles node where object is a MemberExpression with optional undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = { type: 'MemberExpression', object: makeIdentifier('a'), property: makeIdentifier('b'), loc: makeLoc(1, 0, 1, 3) }
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('handles boolean node (non-object)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      expect(() => visitor.MemberExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      expect(() => visitor.MemberExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('location with specific line/column values preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'), 10, 4, 10, 12)
      visitor.MemberExpression(outer)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('does not report when object is a ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const thisExpr = { type: 'ThisExpression', loc: makeLoc(1, 0, 1, 4) }
      const outer = makeMemberExpr(true, thisExpr, makeIdentifier('prop'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(0)
    })

    test('reports for three-level chain a.b.c?.d', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const lvl1 = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const lvl2 = makeMemberExpr(false, lvl1, makeIdentifier('c'))
      const outer = makeMemberExpr(true, lvl2, makeIdentifier('d'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('reports for four-level chain with only last optional', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const lvl1 = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const lvl2 = makeMemberExpr(false, lvl1, makeIdentifier('c'))
      const lvl3 = makeMemberExpr(false, lvl2, makeIdentifier('d'))
      const outer = makeMemberExpr(true, lvl3, makeIdentifier('e'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('does not report when middle of chain is optional a?.b.c?.d', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(true, makeIdentifier('a'), makeIdentifier('b'))
      const mid = makeMemberExpr(false, inner, makeIdentifier('c'))
      const outer = makeMemberExpr(true, mid, makeIdentifier('d'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('handles optional set to 0 (falsy number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = { type: 'MemberExpression', optional: 0, object: makeIdentifier('a'), property: makeIdentifier('b'), loc: makeLoc(1, 0, 1, 3) }
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('handles optional set to empty string (falsy)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = { type: 'MemberExpression', optional: '', object: makeIdentifier('a'), property: makeIdentifier('b'), loc: makeLoc(1, 0, 1, 3) }
      const outer = makeMemberExpr(true, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('does not report when outer optional is false', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = makeMemberExpr(false, inner, makeIdentifier('c'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(0)
    })

    test('does not report when outer optional is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = { type: 'MemberExpression', object: inner, property: makeIdentifier('c'), loc: makeLoc(1, 0, 1, 5) }
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(0)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer = { type: 'MemberExpression', optional: true, object: inner, property: makeIdentifier('c'), loc: makeLoc(1, 0, 1, 6), _parent: {} }
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner1 = makeMemberExpr(false, makeIdentifier('a'), makeIdentifier('b'))
      const outer1 = makeMemberExpr(true, inner1, makeIdentifier('c'))
      const inner2 = makeMemberExpr(false, makeIdentifier('x'), makeIdentifier('y'))
      const outer2 = makeMemberExpr(true, inner2, makeIdentifier('z'))
      visitor.MemberExpression(outer1)
      visitor.MemberExpression(outer2)
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when inner object type is not MemberExpression even if optional true', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantOptionalChainRule.create(context)
      const inner = { type: 'CallExpression', callee: makeIdentifier('fn'), arguments: [], optional: false, loc: makeLoc(1, 0, 1, 5) }
      const outer = makeMemberExpr(true, inner, makeIdentifier('prop'))
      visitor.MemberExpression(outer)
      expect(reports.length).toBe(0)
    })
  })
})

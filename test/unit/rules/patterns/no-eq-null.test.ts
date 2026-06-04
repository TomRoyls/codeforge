import { describe, expect, test, vi } from 'vitest'
import { noEqNullRule } from '../../../../src/rules/patterns/no-eq-null.js'
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
    getSource: () => 'x == null',
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

function makeNullLiteral(): Record<string, unknown> {
  return { type: 'NullLiteral' }
}

function makeIdentifier(name: string): Record<string, unknown> {
  return { type: 'Identifier', name }
}

function makeLiteral(value: unknown): Record<string, unknown> {
  return { type: 'Literal', value }
}

function makeBinaryExpr(
  operator: string,
  left: Record<string, unknown>,
  right: Record<string, unknown>,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-eq-null rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noEqNullRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noEqNullRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noEqNullRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noEqNullRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noEqNullRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning null or equality', () => {
      const desc = noEqNullRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/null|==|!=/)
    })

    test('should have correct docs URL', () => {
      expect(noEqNullRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-eq-null',
      )
    })

    test('should have empty schema', () => {
      expect(noEqNullRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noEqNullRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noEqNullRule).toBeDefined()
      expect(noEqNullRule.meta).toBeDefined()
      expect(noEqNullRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — == WITH NULL LITERAL (5) =====

  describe('positive cases — == with NullLiteral', () => {
    test('reports for x == null', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeNullLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for null == x', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeNullLiteral(), makeIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('reports for null == null', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeNullLiteral(), makeNullLiteral()))
      expect(reports.length).toBe(1)
    })

    test('report message for == is exactly correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeNullLiteral()))
      expect(reports[0].message).toBe(
        "Use '=== null' instead of '== null' for type-safe comparison.",
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeNullLiteral()))
      expect(reports[0].loc).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — != WITH NULL LITERAL (5) =====

  describe('positive cases — != with NullLiteral', () => {
    test('reports for x != null', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('x'), makeNullLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for null != x', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeNullLiteral(), makeIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('reports for null != null', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeNullLiteral(), makeNullLiteral()))
      expect(reports.length).toBe(1)
    })

    test('report message for != is exactly correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('x'), makeNullLiteral()))
      expect(reports[0].message).toBe(
        "Use '!== null' instead of '!= null' for type-safe comparison.",
      )
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      const node = makeBinaryExpr('!=', makeIdentifier('x'), makeNullLiteral())
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })
  })

  // ===== POSITIVE CASES — == WITH UNDEFINED IDENTIFIER (5) =====

  describe('positive cases — == with undefined Identifier', () => {
    test('reports for x == undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeIdentifier('undefined')))
      expect(reports.length).toBe(1)
    })

    test('reports for undefined == x', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('undefined'), makeIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('reports for undefined == undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('undefined'), makeIdentifier('undefined')))
      expect(reports.length).toBe(1)
    })

    test('message for == with undefined still uses == null format', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeIdentifier('undefined')))
      expect(reports[0].message).toBe(
        "Use '=== null' instead of '== null' for type-safe comparison.",
      )
    })

    test('report node matches input node for undefined case', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      const node = makeBinaryExpr('==', makeIdentifier('x'), makeIdentifier('undefined'))
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })
  })

  // ===== POSITIVE CASES — != WITH UNDEFINED IDENTIFIER (5) =====

  describe('positive cases — != with undefined Identifier', () => {
    test('reports for x != undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('x'), makeIdentifier('undefined')))
      expect(reports.length).toBe(1)
    })

    test('reports for undefined != x', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('undefined'), makeIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('reports for undefined != undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('undefined'), makeIdentifier('undefined')))
      expect(reports.length).toBe(1)
    })

    test('message for != with undefined still uses != null format', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('x'), makeIdentifier('undefined')))
      expect(reports[0].message).toBe(
        "Use '!== null' instead of '!= null' for type-safe comparison.",
      )
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('x'), makeNullLiteral()))
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('y'), makeNullLiteral()))
      expect(reports.length).toBe(2)
    })
  })

  // ===== POSITIVE CASES — MIXED NULL/UNDEFINED (4) =====

  describe('positive cases — mixed null/undefined', () => {
    test('reports for null == undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeNullLiteral(), makeIdentifier('undefined')))
      expect(reports.length).toBe(1)
    })

    test('reports for undefined == null', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('undefined'), makeNullLiteral()))
      expect(reports.length).toBe(1)
    })

    test('reports for null != undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeNullLiteral(), makeIdentifier('undefined')))
      expect(reports.length).toBe(1)
    })

    test('reports for undefined != null', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('undefined'), makeNullLiteral()))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — STRICT EQUALITY (6) =====

  describe('negative cases — strict equality operators', () => {
    test('does not report for x === null', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeNullLiteral()))
      expect(reports.length).toBe(0)
    })

    test('does not report for null === x', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeNullLiteral(), makeIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('does not report for x !== null', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeIdentifier('x'), makeNullLiteral()))
      expect(reports.length).toBe(0)
    })

    test('does not report for null !== x', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!==', makeNullLiteral(), makeIdentifier('x')))
      expect(reports.length).toBe(0)
    })

    test('does not report for x === undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('x'), makeIdentifier('undefined')))
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined === x', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('undefined'), makeIdentifier('x')))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — OTHER OPERATORS (8) =====

  describe('negative cases — other operators', () => {
    test('does not report for x < null', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('<', makeIdentifier('x'), makeNullLiteral()))
      expect(reports.length).toBe(0)
    })

    test('does not report for x > null', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('>', makeIdentifier('x'), makeNullLiteral()))
      expect(reports.length).toBe(0)
    })

    test('does not report for x <= null', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('<=', makeIdentifier('x'), makeNullLiteral()))
      expect(reports.length).toBe(0)
    })

    test('does not report for x >= null', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('>=', makeIdentifier('x'), makeNullLiteral()))
      expect(reports.length).toBe(0)
    })

    test('does not report for x + null', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('+', makeIdentifier('x'), makeNullLiteral()))
      expect(reports.length).toBe(0)
    })

    test('does not report for x - null', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('-', makeIdentifier('x'), makeNullLiteral()))
      expect(reports.length).toBe(0)
    })

    test('does not report for x * null', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('*', makeIdentifier('x'), makeNullLiteral()))
      expect(reports.length).toBe(0)
    })

    test('does not report for x / null', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('/', makeIdentifier('x'), makeNullLiteral()))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — NEITHER SIDE NULL/UNDEFINED (4) =====

  describe('negative cases — neither side null/undefined', () => {
    test('does not report for x == y (both regular Identifiers)', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeIdentifier('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for x != y', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('x'), makeIdentifier('y')))
      expect(reports.length).toBe(0)
    })

    test('does not report for x == 5', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeLiteral(5)))
      expect(reports.length).toBe(0)
    })

    test('does not report for x == "hello"', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeLiteral('hello')))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — INVALID NODES (17) =====

  describe('negative cases — invalid nodes', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      expect(() => visitor.BinaryExpression('x == null')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      expect(() => visitor.BinaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      expect(() => visitor.BinaryExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'Identifier', name: 'x', loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'Literal', value: 42, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression({ type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (26) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noEqNullRule.create(ctx1)
      const visitor2 = noEqNullRule.create(ctx2)
      visitor1.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeNullLiteral()))
      visitor2.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeIdentifier('y')))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeNullLiteral()))
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('a'), makeIdentifier('b')))
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('y'), makeNullLiteral()))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      const node = { type: 'BinaryExpression', operator: '==', left: makeIdentifier('x'), right: makeNullLiteral() }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      const node = { type: 'BinaryExpression', operator: '==', left: makeIdentifier('x'), right: makeNullLiteral() }
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeIdentifier('y')))
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeNullLiteral()))
      visitor.BinaryExpression(makeBinaryExpr('===', makeIdentifier('a'), makeNullLiteral()))
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('b'), makeNullLiteral()))
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('c'), makeIdentifier('undefined')))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noEqNullRule.create(context)
      const visitor2 = noEqNullRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noEqNullRule.meta
      const meta2 = noEqNullRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeNullLiteral()))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '==',
        left: makeIdentifier('x'),
        right: makeNullLiteral(),
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        _parent: {},
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      const node = { type: 'BinaryExpression', operator: '==', left: makeIdentifier('x'), right: makeNullLiteral(), loc: {} }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      const node = { type: 'BinaryExpression', operator: '==', left: makeIdentifier('x'), right: makeNullLiteral(), loc: { start: { line: 3, column: 5 } } }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      const node = makeBinaryExpr('==', makeIdentifier('x'), makeNullLiteral())
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noEqNullRule).toBeDefined()
      expect(typeof noEqNullRule.create).toBe('function')
      expect(typeof noEqNullRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '==',
        left: makeIdentifier('x'),
        right: makeNullLiteral(),
        loc: makeLoc(1, 0, 1, 10),
        _parent: { type: 'ExpressionStatement' },
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeNullLiteral()))
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('x'), makeNullLiteral()))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('===')
      expect(reports[1].message).toContain('!==')
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeNullLiteral(), 10, 4, 10, 14))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(14)
    })

    test('does not report when operator is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: makeIdentifier('x'),
        right: makeNullLiteral(),
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when left is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '==',
        right: makeNullLiteral(),
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '==',
        left: makeIdentifier('x'),
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when left is null primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '==',
        left: null,
        right: makeNullLiteral(),
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right is null primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '==',
        left: makeIdentifier('x'),
        right: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('report loc end values preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeNullLiteral(), 5, 2, 7, 15))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('report message for == mentions ===', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeNullLiteral()))
      expect(reports[0].message).toContain('===')
    })

    test('report message for != mentions !==', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('x'), makeNullLiteral()))
      expect(reports[0].message).toContain('!==')
    })

    test('all reports have the same message format for ==', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeNullLiteral()))
      visitor.BinaryExpression(makeBinaryExpr('==', makeNullLiteral(), makeIdentifier('x')))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('BinaryExpression with non-null Literal on right side does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeLiteral('foo')))
      expect(reports.length).toBe(0)
    })
  })

  describe('ESTree null-literal compatibility', () => {
    test('reports x == null where null is ESTree Literal{value:null}', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeIdentifier('x'), makeLiteral(null)))
      expect(reports.length).toBe(1)
    })

    test('reports null == x where null is ESTree Literal{value:null}', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('==', makeLiteral(null), makeIdentifier('x')))
      expect(reports.length).toBe(1)
    })

    test('reports x != null where null is ESTree Literal{value:null}', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('x'), makeLiteral(null)))
      expect(reports.length).toBe(1)
    })

    test('reports message for != uses !== not ====', () => {
      const { context, reports } = createMockContext()
      const visitor = noEqNullRule.create(context)
      visitor.BinaryExpression(makeBinaryExpr('!=', makeIdentifier('x'), makeLiteral(null)))
      expect(reports[0].message).toContain('!==')
      expect(reports[0].message).not.toContain('====')
    })
  })
})

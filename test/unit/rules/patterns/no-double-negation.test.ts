import { describe, expect, test, vi } from 'vitest'
import { noDoubleNegationRule } from '../../../../src/rules/patterns/no-double-negation.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
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
    getSource: () => 'if (!!x) {}',
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

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function makeDoubleNegIf(
  innerExpr: unknown = { type: 'Identifier', name: 'x' },
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'IfStatement',
    test: {
      type: 'UnaryExpression',
      operator: '!',
      argument: {
        type: 'UnaryExpression',
        operator: '!',
        argument: innerExpr,
      },
      loc: makeLoc(line, column, line, column + 5),
    },
    consequent: { type: 'BlockStatement', body: [] },
    loc: makeLoc(line, column, line, column + 12),
  }
}

function makeDoubleNegTernary(
  innerExpr: unknown = { type: 'Identifier', name: 'x' },
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ConditionalExpression',
    test: {
      type: 'UnaryExpression',
      operator: '!',
      argument: {
        type: 'UnaryExpression',
        operator: '!',
        argument: innerExpr,
      },
      loc: makeLoc(line, column, line, column + 5),
    },
    consequent: { type: 'Identifier', name: 'a' },
    alternate: { type: 'Identifier', name: 'b' },
    loc: makeLoc(line, column, line, column + 15),
  }
}

function makeDoubleNegWhile(
  innerExpr: unknown = { type: 'Identifier', name: 'x' },
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'WhileStatement',
    test: {
      type: 'UnaryExpression',
      operator: '!',
      argument: {
        type: 'UnaryExpression',
        operator: '!',
        argument: innerExpr,
      },
      loc: makeLoc(line, column, line, column + 5),
    },
    body: { type: 'BlockStatement', body: [] },
    loc: makeLoc(line, column, line, column + 15),
  }
}

describe('no-double-negation rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noDoubleNegationRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noDoubleNegationRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noDoubleNegationRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noDoubleNegationRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noDoubleNegationRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning double negation', () => {
      const desc = noDoubleNegationRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/double negation/)
    })

    test('should have correct docs URL', () => {
      expect(noDoubleNegationRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-double-negation',
      )
    })

    test('should have empty schema', () => {
      expect(noDoubleNegationRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with IfStatement, ConditionalExpression, WhileStatement', () => {
      const { context } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      expect(visitor).toHaveProperty('IfStatement')
      expect(visitor).toHaveProperty('ConditionalExpression')
      expect(visitor).toHaveProperty('WhileStatement')
      expect(typeof visitor.IfStatement).toBe('function')
      expect(typeof visitor.ConditionalExpression).toBe('function')
      expect(typeof visitor.WhileStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noDoubleNegationRule).toBeDefined()
      expect(noDoubleNegationRule.meta).toBeDefined()
      expect(noDoubleNegationRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — detects !! in boolean contexts', () => {
    test('reports if (!!x) — double negation in if condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf())
      expect(reports.length).toBe(1)
    })

    test('reports !!x ? a : b — double negation in ternary condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.ConditionalExpression(makeDoubleNegTernary())
      expect(reports.length).toBe(1)
    })

    test('reports while (!!x) — double negation in while condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.WhileStatement(makeDoubleNegWhile())
      expect(reports.length).toBe(1)
    })

    test('if context message mentions "if condition"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf())
      expect(reports[0].message.toLowerCase()).toContain('if condition')
    })

    test('ternary context message mentions "ternary condition"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.ConditionalExpression(makeDoubleNegTernary())
      expect(reports[0].message.toLowerCase()).toContain('ternary condition')
    })

    test('while context message mentions "while condition"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.WhileStatement(makeDoubleNegWhile())
      expect(reports[0].message.toLowerCase()).toContain('while condition')
    })

    test('if message mentions "if (!!x)"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf())
      expect(reports[0].message).toContain('if (!!x)')
    })

    test('ternary message mentions "!!x ? a : b"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.ConditionalExpression(makeDoubleNegTernary())
      expect(reports[0].message).toContain('!!x ? a : b')
    })

    test('while message mentions "while (!!x)"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.WhileStatement(makeDoubleNegWhile())
      expect(reports[0].message).toContain('while (!!x)')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf())
      expect(reports[0].node).toBeDefined()
    })

    test('report node is the outer UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = makeDoubleNegIf() as { test: unknown }
      visitor.IfStatement(node)
      expect(reports[0].node).toBe((node as Record<string, unknown>).test)
    })

    test('reports if (!!flag) with Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf({ type: 'Identifier', name: 'flag' }))
      expect(reports.length).toBe(1)
    })

    test('reports if (!!getValue()) with CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getValue' },
        arguments: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf(undefined, 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('reports multiple if violations in same source', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf())
      visitor.IfStatement(makeDoubleNegIf())
      visitor.IfStatement(makeDoubleNegIf())
      expect(reports.length).toBe(3)
    })

    test('visitor accumulates reports across different visitor methods', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf())
      visitor.ConditionalExpression(makeDoubleNegTernary())
      visitor.WhileStatement(makeDoubleNegWhile())
      expect(reports.length).toBe(3)
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf())
      expect(reports.length).toBe(1)
    })

    test('message mentions "redundant"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf())
      expect(reports[0].message.toLowerCase()).toContain('redundant')
    })

    test('message mentions "clarity"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf())
      expect(reports[0].message.toLowerCase()).toContain('clarity')
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report if (x) — no negation', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report if (!x) — single negation', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'IfStatement',
        test: {
          type: 'UnaryExpression',
          operator: '!',
          argument: { type: 'Identifier', name: 'x' },
        },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report if (!!x) when outer operator is not "!"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'IfStatement',
        test: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: {
            type: 'UnaryExpression',
            operator: '!',
            argument: { type: 'Identifier', name: 'x' },
          },
        },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report if (!x) where inner is not UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'IfStatement',
        test: {
          type: 'UnaryExpression',
          operator: '!',
          argument: { type: 'Identifier', name: 'x' },
        },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report x ? a : b — no negation in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report !x ? a : b — single negation in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: {
          type: 'UnaryExpression',
          operator: '!',
          argument: { type: 'Identifier', name: 'x' },
        },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 14),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report while (x) — no negation', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'WhileStatement',
        test: { type: 'Identifier', name: 'x' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.WhileStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report while (!x) — single negation', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'WhileStatement',
        test: {
          type: 'UnaryExpression',
          operator: '!',
          argument: { type: 'Identifier', name: 'x' },
        },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.WhileStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report !!x outside boolean context — variable assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'y' },
        init: {
          type: 'UnaryExpression',
          operator: '!',
          argument: {
            type: 'UnaryExpression',
            operator: '!',
            argument: { type: 'Identifier', name: 'x' },
          },
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report !!x in return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'ReturnStatement',
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          argument: {
            type: 'UnaryExpression',
            operator: '!',
            argument: { type: 'Identifier', name: 'x' },
          },
        },
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully for IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      expect(() => visitor.IfStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully for IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      expect(() => visitor.IfStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully for ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      expect(() => visitor.ConditionalExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully for WhileStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      expect(() => visitor.WhileStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — non-IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      expect(() => visitor.IfStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — non-ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      expect(() => visitor.ConditionalExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — non-WhileStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      expect(() => visitor.WhileStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string) for IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      expect(() => visitor.IfStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number) for IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      expect(() => visitor.IfStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report IfStatement with null test', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'IfStatement',
        test: null,
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report IfStatement with undefined test', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'IfStatement',
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ConditionalExpression with null test', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: null,
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report WhileStatement with null test', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'WhileStatement',
        test: null,
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.WhileStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report if (x > 0) — BinaryExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'IfStatement',
        test: {
          type: 'BinaryExpression',
          operator: '>',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 0 },
        },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report if (x && y) — LogicalExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'IfStatement',
        test: {
          type: 'LogicalExpression',
          operator: '&&',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Identifier', name: 'y' },
        },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 14),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report if (!!x) where inner operator is "-" not "!"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'IfStatement',
        test: {
          type: 'UnaryExpression',
          operator: '!',
          argument: {
            type: 'UnaryExpression',
            operator: '-',
            argument: { type: 'Identifier', name: 'x' },
          },
        },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ConditionalExpression with Literal test', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'ConditionalExpression',
        test: { type: 'Literal', value: true },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 13),
      }
      visitor.ConditionalExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report WhileStatement with CallExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'WhileStatement',
        test: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'condition' },
          arguments: [],
        },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.WhileStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ForStatement passed to IfStatement visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'ForStatement',
        test: {
          type: 'UnaryExpression',
          operator: '!',
          argument: {
            type: 'UnaryExpression',
            operator: '!',
            argument: { type: 'Identifier', name: 'x' },
          },
        },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report DoWhileStatement passed to WhileStatement visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'DoWhileStatement',
        test: {
          type: 'UnaryExpression',
          operator: '!',
          argument: {
            type: 'UnaryExpression',
            operator: '!',
            argument: { type: 'Identifier', name: 'x' },
          },
        },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.WhileStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report if test argument is null for inner UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'IfStatement',
        test: {
          type: 'UnaryExpression',
          operator: '!',
          argument: null,
        },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report if (typeof x) — typeof UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'IfStatement',
        test: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'Identifier', name: 'x' },
        },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ExpressionStatement passed to IfStatement visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report SwitchStatement passed to IfStatement visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('does not report if (!!x) where inner UnaryExpression has no operator property', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'IfStatement',
        test: {
          type: 'UnaryExpression',
          operator: '!',
          argument: {
            type: 'UnaryExpression',
            argument: { type: 'Identifier', name: 'x' },
          },
        },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noDoubleNegationRule.create(ctx1)
      const visitor2 = noDoubleNegationRule.create(ctx2)

      visitor1.IfStatement(makeDoubleNegIf())
      visitor2.IfStatement({
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across multiple IfStatement calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf())
      visitor.IfStatement(makeDoubleNegIf())
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'IfStatement',
        test: {
          type: 'UnaryExpression',
          operator: '!',
          argument: {
            type: 'UnaryExpression',
            operator: '!',
            argument: { type: 'Identifier', name: 'x' },
          },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf())
      visitor.IfStatement({
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(2, 0, 2, 10),
      })
      visitor.WhileStatement(makeDoubleNegWhile())
      visitor.IfStatement({
        type: 'ExpressionStatement',
        loc: makeLoc(3, 0, 3, 10),
      })
      visitor.ConditionalExpression(makeDoubleNegTernary())
      expect(reports.length).toBe(3)
    })

    test('reports in all three contexts simultaneously', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf())
      visitor.ConditionalExpression(makeDoubleNegTernary())
      visitor.WhileStatement(makeDoubleNegWhile())
      expect(reports.length).toBe(3)
    })

    test('reports if (!!obj.prop) — MemberExpression inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports while (!!arr[0]) — MemberExpression computed inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.WhileStatement(makeDoubleNegWhile({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'arr' },
        property: { type: 'Literal', value: 0 },
        computed: true,
      }))
      expect(reports.length).toBe(1)
    })

    test('reports ternary with !!binaryExpr as inner', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.ConditionalExpression(makeDoubleNegTernary({
        type: 'BinaryExpression',
        operator: '>',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noDoubleNegationRule.create(context)
      const visitor2 = noDoubleNegationRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('location with specific line/column values for ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.ConditionalExpression(makeDoubleNegTernary(undefined, 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('location with specific line/column values for while', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.WhileStatement(makeDoubleNegWhile(undefined, 7, 2))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf())
      visitor.IfStatement(makeDoubleNegIf())
      visitor.IfStatement(makeDoubleNegIf())
      expect(reports.length).toBe(3)
    })

    test('handles IfStatement with test but no test argument on inner unary', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'IfStatement',
        test: {
          type: 'UnaryExpression',
          operator: '!',
          argument: {
            type: 'UnaryExpression',
            operator: '!',
          },
        },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with missing type property on outer unary', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'IfStatement',
        test: {
          operator: '!',
          argument: {
            type: 'UnaryExpression',
            operator: '!',
            argument: { type: 'Identifier', name: 'x' },
          },
        },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('handles deeply nested condition via WhileStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'WhileStatement',
        test: {
          type: 'UnaryExpression',
          operator: '!',
          argument: {
            type: 'UnaryExpression',
            operator: '!',
            argument: {
              type: 'UnaryExpression',
              operator: '!',
              argument: { type: 'Identifier', name: 'x' },
            },
          },
          loc: makeLoc(3, 5, 3, 12),
        },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(3, 0, 3, 20),
      }
      visitor.WhileStatement(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('all violation messages for if context are identical', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf())
      visitor.IfStatement(makeDoubleNegIf())
      visitor.IfStatement(makeDoubleNegIf())
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('messages differ between if and ternary contexts', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf())
      visitor.ConditionalExpression(makeDoubleNegTernary())
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('messages differ between if and while contexts', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf())
      visitor.WhileStatement(makeDoubleNegWhile())
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('messages differ between ternary and while contexts', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.ConditionalExpression(makeDoubleNegTernary())
      visitor.WhileStatement(makeDoubleNegWhile())
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('rule meta is the same reference across multiple accesses', () => {
      const meta1 = noDoubleNegationRule.meta
      const meta2 = noDoubleNegationRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noDoubleNegationRule', () => {
      expect(noDoubleNegationRule).toBeDefined()
      expect(typeof noDoubleNegationRule.create).toBe('function')
      expect(typeof noDoubleNegationRule.meta).toBe('object')
    })

    test('if message mentions "Remove the !!"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf())
      expect(reports[0].message).toContain('Remove the !!')
    })

    test('ternary message mentions "Remove the !!"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.ConditionalExpression(makeDoubleNegTernary())
      expect(reports[0].message).toContain('Remove the !!')
    })

    test('while message mentions "Remove the !!"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.WhileStatement(makeDoubleNegWhile())
      expect(reports[0].message).toContain('Remove the !!')
    })

    test('if message mentions "equivalent to"', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf())
      expect(reports[0].message.toLowerCase()).toContain('equivalent to')
    })

    test('does not report IfStatement with MemberExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'IfStatement',
        test: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        consequent: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 14),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('reports if (!!x) with consequent having body', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'IfStatement',
        test: {
          type: 'UnaryExpression',
          operator: '!',
          argument: {
            type: 'UnaryExpression',
            operator: '!',
            argument: { type: 'Identifier', name: 'x' },
          },
          loc: makeLoc(1, 3, 1, 8),
        },
        consequent: {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: 1 } }],
        },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('does not report while with LogicalExpression test', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      const node = {
        type: 'WhileStatement',
        test: {
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Identifier', name: 'y' },
        },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.WhileStatement(node)
      expect(reports.length).toBe(0)
    })

    test('accumulates 5 reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noDoubleNegationRule.create(context)
      visitor.IfStatement(makeDoubleNegIf())
      visitor.ConditionalExpression(makeDoubleNegTernary())
      visitor.WhileStatement(makeDoubleNegWhile())
      visitor.IfStatement(makeDoubleNegIf())
      visitor.ConditionalExpression(makeDoubleNegTernary())
      expect(reports.length).toBe(5)
    })

    test('meta docs description contains "double negation" and "!!"', () => {
      const desc = noDoubleNegationRule.meta.docs?.description ?? ''
      expect(desc).toMatch(/double negation/)
      expect(desc).toContain('!!')
    })
  })
})

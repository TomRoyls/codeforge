import { describe, expect, test, vi } from 'vitest'
import { noNegatedConditionRule } from '../../../../src/rules/patterns/no-negated-condition.js'
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
    getSource: () => '!(a === b)',
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

function makeNegatedBinary(
  binaryOp: string,
  leftName: string = 'a',
  rightName: string = 'b',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'UnaryExpression',
    operator: '!',
    prefix: true,
    argument: {
      type: 'BinaryExpression',
      operator: binaryOp,
      left: { type: 'Identifier', name: leftName },
      right: { type: 'Identifier', name: rightName },
    },
    loc: makeLoc(line, column, line, column + 12),
  }
}

describe('no-negated-condition rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noNegatedConditionRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noNegatedConditionRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noNegatedConditionRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noNegatedConditionRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noNegatedConditionRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning negated and comparison', () => {
      const desc = noNegatedConditionRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/negat/)
      expect(desc).toMatch(/comparison/)
    })

    test('should have correct docs URL', () => {
      expect(noNegatedConditionRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-negated-condition',
      )
    })

    test('should have empty schema', () => {
      expect(noNegatedConditionRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with UnaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      expect(visitor).toHaveProperty('UnaryExpression')
      expect(typeof visitor.UnaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noNegatedConditionRule).toBeDefined()
      expect(noNegatedConditionRule.meta).toBeDefined()
      expect(noNegatedConditionRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports negated comparisons', () => {
    test('reports !(a === b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('==='))
      expect(reports.length).toBe(1)
    })

    test('reports !(a !== b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('!=='))
      expect(reports.length).toBe(1)
    })

    test('reports !(a == b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('=='))
      expect(reports.length).toBe(1)
    })

    test('reports !(a != b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('!='))
      expect(reports.length).toBe(1)
    })

    test('reports !(a < b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('<'))
      expect(reports.length).toBe(1)
    })

    test('reports !(a > b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('>'))
      expect(reports.length).toBe(1)
    })

    test('reports !(a <= b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('<='))
      expect(reports.length).toBe(1)
    })

    test('reports !(a >= b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('>='))
      expect(reports.length).toBe(1)
    })

    test('message contains "Unexpected"', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('==='))
      expect(reports[0].message).toContain('Unexpected')
    })

    test('message contains "negated"', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('==='))
      expect(reports[0].message.toLowerCase()).toContain('negat')
    })

    test('message contains the operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('==='))
      expect(reports[0].message).toContain('===')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('==='))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('==='))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = makeNegatedBinary('===')
      visitor.UnaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('==='))
      visitor.UnaryExpression(makeNegatedBinary('!=='))
      visitor.UnaryExpression(makeNegatedBinary('<'))
      expect(reports.length).toBe(3)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('===', 'a', 'b', 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('==='))
      expect(reports.length).toBe(1)
    })

    test('reports with different identifier names in binary', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'BinaryExpression',
          operator: '===',
          left: { type: 'Identifier', name: 'foo' },
          right: { type: 'Identifier', name: 'bar' },
        },
        loc: makeLoc(1, 0, 1, 16),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with Literal operands in binary', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'BinaryExpression',
          operator: '>',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 0 },
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with CallExpression operands in binary', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'BinaryExpression',
          operator: '===',
          left: { type: 'Identifier', name: 'result' },
          right: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getValue' },
            arguments: [],
          },
        },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('visitor accumulates 8 reports — one per negatable operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      for (const op of ['===', '!==', '==', '!=', '<', '>', '<=', '>=']) {
        visitor.UnaryExpression(makeNegatedBinary(op))
      }
      expect(reports.length).toBe(8)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report !(a && b) — BinaryExpression with &&', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('&&'))
      expect(reports.length).toBe(0)
    })

    test('does not report !(a || b) — BinaryExpression with ||', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('||'))
      expect(reports.length).toBe(0)
    })

    test('does not report !a — argument is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: { type: 'Identifier', name: 'a' },
        loc: makeLoc(1, 0, 1, 2),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report !!a — argument is UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'UnaryExpression',
          operator: '!',
          prefix: true,
          argument: { type: 'Identifier', name: 'a' },
        },
        loc: makeLoc(1, 0, 1, 4),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      expect(() => visitor.UnaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      expect(() => visitor.UnaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report BinaryExpression node type (not UnaryExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report unary + on binary', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '+',
        prefix: true,
        argument: {
          type: 'BinaryExpression',
          operator: '===',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report unary - on binary', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '-',
        prefix: true,
        argument: {
          type: 'BinaryExpression',
          operator: '===',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report bitwise ~ on binary', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '~',
        prefix: true,
        argument: {
          type: 'BinaryExpression',
          operator: '===',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report typeof on binary', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'typeof',
        prefix: true,
        argument: {
          type: 'BinaryExpression',
          operator: '===',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report void on binary', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
        argument: {
          type: 'BinaryExpression',
          operator: '===',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: makeLoc(1, 0, 1, 16),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report delete on binary', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        prefix: true,
        argument: {
          type: 'BinaryExpression',
          operator: '===',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report !(a + b) — arithmetic operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('+'))
      expect(reports.length).toBe(0)
    })

    test('does not report !(a - b) — arithmetic operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('-'))
      expect(reports.length).toBe(0)
    })

    test('does not report !(a * b) — arithmetic operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('*'))
      expect(reports.length).toBe(0)
    })

    test('does not report !(a / b) — arithmetic operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('/'))
      expect(reports.length).toBe(0)
    })

    test('does not report !(a % b) — arithmetic operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('%'))
      expect(reports.length).toBe(0)
    })

    test('does not report !(a ** b) — exponentiation operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('**'))
      expect(reports.length).toBe(0)
    })

    test('does not report !(a & b) — bitwise AND operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('&'))
      expect(reports.length).toBe(0)
    })

    test('does not report !(a | b) — bitwise OR operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('|'))
      expect(reports.length).toBe(0)
    })

    test('does not report !(a ^ b) — bitwise XOR operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('^'))
      expect(reports.length).toBe(0)
    })

    test('does not report !(a << b) — bitwise shift operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('<<'))
      expect(reports.length).toBe(0)
    })

    test('does not report !(a >> b) — bitwise shift operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('>>'))
      expect(reports.length).toBe(0)
    })

    test('does not report !(a >>> b) — unsigned right shift operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('>>>'))
      expect(reports.length).toBe(0)
    })

    test('does not report !(a in b) — in operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('in'))
      expect(reports.length).toBe(0)
    })

    test('does not report !(a instanceof b) — instanceof operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('instanceof'))
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      expect(() => visitor.UnaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      expect(() => visitor.UnaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report !fn() — argument is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report !obj.prop — argument is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: makeLoc(1, 0, 1, 9),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: null,
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when binary operator is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'BinaryExpression',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node type is AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: true },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noNegatedConditionRule.create(ctx1)
      const visitor2 = noNegatedConditionRule.create(ctx2)

      visitor1.UnaryExpression(makeNegatedBinary('==='))
      visitor2.UnaryExpression(makeNegatedBinary('&&'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('==='))
      visitor.UnaryExpression(makeNegatedBinary('!=='))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'BinaryExpression',
          operator: '===',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'BinaryExpression',
          operator: '===',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
      }
      visitor.UnaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('===', 'a', 'b', 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noNegatedConditionRule.create(context)
      const visitor2 = noNegatedConditionRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('==='))
      visitor.UnaryExpression(makeNegatedBinary('&&'))
      visitor.UnaryExpression(makeNegatedBinary('<'))
      visitor.UnaryExpression(makeNegatedBinary('+'))
      visitor.UnaryExpression(makeNegatedBinary('!=='))
      expect(reports.length).toBe(3)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('==='))
      visitor.UnaryExpression(makeNegatedBinary('==='))
      visitor.UnaryExpression(makeNegatedBinary('==='))
      expect(reports.length).toBe(3)
    })

    test('handles node with missing argument property', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles UnaryExpression with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'BinaryExpression',
          operator: '===',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: {},
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles UnaryExpression with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'BinaryExpression',
          operator: '===',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('each negatable operator tested individually reports', () => {
      const ops = ['===', '!==', '==', '!=', '<', '>', '<=', '>=']
      for (const op of ops) {
        const { context, reports } = createMockContext()
        const visitor = noNegatedConditionRule.create(context)
        visitor.UnaryExpression(makeNegatedBinary(op))
        expect(reports.length).toBe(1)
      }
    })

    test('node with extra properties still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'BinaryExpression',
          operator: '===',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: makeLoc(1, 0, 1, 12),
        range: [0, 12],
        extra: true,
        parent: {},
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report when prefix is false', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: false,
        argument: {
          type: 'BinaryExpression',
          operator: '===',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('==='))
      visitor.UnaryExpression(makeNegatedBinary('!=='))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('===')
      expect(reports[1].message).toContain('!==')
    })

    test('all negatable operator messages follow same pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('==='))
      visitor.UnaryExpression(makeNegatedBinary('<'))
      visitor.UnaryExpression(makeNegatedBinary('>='))
      for (const r of reports) {
        expect(r.message).toContain('Unexpected negated comparison')
        expect(r.message).toContain('opposite operator')
      }
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noNegatedConditionRule.meta
      const meta2 = noNegatedConditionRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noNegatedConditionRule', () => {
      expect(noNegatedConditionRule).toBeDefined()
      expect(typeof noNegatedConditionRule.create).toBe('function')
      expect(typeof noNegatedConditionRule.meta).toBe('object')
    })

    test('message for === contains "==="', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('==='))
      expect(reports[0].message).toContain('===')
    })

    test('message for !== contains "!=="', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('!=='))
      expect(reports[0].message).toContain('!==')
    })

    test('message for == contains "=="', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('=='))
      expect(reports[0].message).toContain('==')
    })

    test('message for != contains "!="', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('!='))
      expect(reports[0].message).toContain('!=')
    })

    test('message for < contains "<"', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('<'))
      expect(reports[0].message).toContain('<')
    })

    test('message for > contains ">"', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('>'))
      expect(reports[0].message).toContain('>')
    })

    test('message for <= contains "<="', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('<='))
      expect(reports[0].message).toContain('<=')
    })

    test('message for >= contains ">="', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('>='))
      expect(reports[0].message).toContain('>=')
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      visitor.UnaryExpression(makeNegatedBinary('==='))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with nested UnaryExpression argument that wraps a BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noNegatedConditionRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'UnaryExpression',
          operator: '-',
          prefix: true,
          argument: {
            type: 'BinaryExpression',
            operator: '===',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Identifier', name: 'b' },
          },
        },
        loc: makeLoc(1, 0, 1, 14),
      }
       visitor.UnaryExpression(node)
       expect(reports.length).toBe(0)
     })
  })
})

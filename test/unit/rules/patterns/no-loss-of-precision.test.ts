import { describe, test, expect, vi } from 'vitest'
import { noLossOfPrecisionRule } from '../../../../src/rules/patterns/no-loss-of-precision.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = '0.1 + 0.2;',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
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

function createBinaryExpression(
  operator: string,
  left: unknown,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

describe('no-loss-of-precision rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noLossOfPrecisionRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noLossOfPrecisionRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noLossOfPrecisionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noLossOfPrecisionRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noLossOfPrecisionRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noLossOfPrecisionRule.meta.fixable).toBeUndefined()
    })

    test('should mention precision in description', () => {
      expect(noLossOfPrecisionRule.meta.docs?.description.toLowerCase()).toContain('precision')
    })

    test('should mention IEEE 754 in description', () => {
      expect(noLossOfPrecisionRule.meta.docs?.description).toContain('IEEE 754')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  describe('detecting precision problems', () => {
    test('should report 0.1 + 0.2', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('0.1')
      expect(reports[0].message).toContain('0.2')
    })

    test('should report 0.2 + 0.1', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('+', createLiteral(0.2), createLiteral(0.1))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report 0.3 - 0.1', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('-', createLiteral(0.3), createLiteral(0.1))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report 0.07 * 100', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('*', createLiteral(0.07), createLiteral(100))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report 0.55 * 100', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('*', createLiteral(0.55), createLiteral(100))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report 0.5 / 3.0 (division with non-power-of-2)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('/', createLiteral(0.5), createLiteral(3))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report 19.08 + 2.01', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('+', createLiteral(19.08), createLiteral(2.01))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x + 0.1 (variable with decimal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('x'), createLiteral(0.1))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report 0.1 + x (decimal with variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('+', createLiteral(0.1), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting safe operations', () => {
    test('should not report 1 + 2', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('+', createLiteral(1), createLiteral(2))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report 10 + 20', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('+', createLiteral(10), createLiteral(20))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report 100 * 50', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('*', createLiteral(100), createLiteral(50))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report 0.5 + 0.5 (float arithmetic)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('+', createLiteral(0.5), createLiteral(0.5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report 0.25 + 0.25 (float arithmetic)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('+', createLiteral(0.25), createLiteral(0.25))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report 0.125 + 0.125 (float arithmetic)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('+', createLiteral(0.125), createLiteral(0.125))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report x + y (no literals)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x + 1 (integer literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('x'), createLiteral(1))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x - 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('-', createIdentifier('x'), createLiteral(1))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x > 0.1', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('>', createIdentifier('x'), createLiteral(0.1))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x < 0.1', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('<', createIdentifier('x'), createLiteral(0.1))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === y', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createLiteral(0.1),
        right: createLiteral(0.2),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2), 25, 10)

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))

      expect(reports.length).toBe(1)
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral(0.1),
        right: createLiteral(0.2),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without left/right', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
    })

    test('should handle non-number literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('+', createLiteral('a'), createLiteral('b'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report 0.1 + "a" (float with string - reports float side)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('+', createLiteral(0.1), createLiteral('a'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention floating-point in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))

      expect(reports[0].message.toLowerCase()).toContain('floating-point')
    })

    test('should mention IEEE 754 in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))

      expect(reports[0].message).toContain('IEEE 754')
    })

    test('should include operands in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))

      expect(reports[0].message).toContain('0.1')
      expect(reports[0].message).toContain('0.2')
    })

    test('should include operator in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))

      expect(reports[0].message).toContain('+')
    })

    test('should mention integer arithmetic as alternative', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))

      expect(reports[0].message.toLowerCase()).toContain('integer')
    })
  })
})

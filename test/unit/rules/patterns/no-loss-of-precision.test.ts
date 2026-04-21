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
  // ============================================================
  // META (20 tests)
  // ============================================================
  describe('meta', () => {
    test('should have meta property defined', () => {
      expect(noLossOfPrecisionRule.meta).toBeDefined()
    })

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

    test('should have schema as array', () => {
      expect(Array.isArray(noLossOfPrecisionRule.meta.schema)).toBe(true)
    })

    test('should have empty schema', () => {
      expect(noLossOfPrecisionRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noLossOfPrecisionRule.meta.fixable).toBeUndefined()
    })

    test('should not be deprecated', () => {
      expect(noLossOfPrecisionRule.meta.deprecated).toBeFalsy()
    })

    test('should have docs property', () => {
      expect(noLossOfPrecisionRule.meta.docs).toBeDefined()
    })

    test('should have docs description as non-empty string', () => {
      expect(typeof noLossOfPrecisionRule.meta.docs?.description).toBe('string')
      expect(noLossOfPrecisionRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs url', () => {
      expect(noLossOfPrecisionRule.meta.docs?.url).toBeDefined()
      expect(typeof noLossOfPrecisionRule.meta.docs?.url).toBe('string')
    })

    test('should mention precision in description', () => {
      expect(noLossOfPrecisionRule.meta.docs?.description.toLowerCase()).toContain('precision')
    })

    test('should mention IEEE 754 in description', () => {
      expect(noLossOfPrecisionRule.meta.docs?.description).toContain('IEEE 754')
    })

    test('should mention floating-point in description', () => {
      expect(noLossOfPrecisionRule.meta.docs?.description.toLowerCase()).toContain('floating-point')
    })

    test('should mention arithmetic in description', () => {
      expect(noLossOfPrecisionRule.meta.docs?.description.toLowerCase()).toContain('arithmetic')
    })

    test('should mention JavaScript in description', () => {
      expect(noLossOfPrecisionRule.meta.docs?.description).toContain('JavaScript')
    })

    test('should include example 0.1 + 0.2 in description', () => {
      expect(noLossOfPrecisionRule.meta.docs?.description).toContain('0.1 + 0.2')
    })

    test('should mention integer as alternative in description', () => {
      expect(noLossOfPrecisionRule.meta.docs?.description.toLowerCase()).toContain('integer')
    })
  })

  // ============================================================
  // CREATE / VISITOR (8 tests)
  // ============================================================
  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should return visitor with BinaryExpression as function', () => {
      const { context } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('should return a new visitor for each create call', () => {
      const { context } = createMockContext()
      const visitor1 = noLossOfPrecisionRule.create(context)
      const visitor2 = noLossOfPrecisionRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context with empty options', () => {
      const { context } = createMockContext({})
      expect(() => noLossOfPrecisionRule.create(context)).not.toThrow()
    })

    test('should accept context with source code', () => {
      const { context } = createMockContext({}, '/src/file.ts', 'const x = 0.1 + 0.2;')
      expect(() => noLossOfPrecisionRule.create(context)).not.toThrow()
    })

    test('should not throw when creating visitor', () => {
      const { context } = createMockContext()
      expect(() => noLossOfPrecisionRule.create(context)).not.toThrow()
    })

    test('should return non-null visitor', () => {
      const { context } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)
      expect(visitor).not.toBeNull()
    })

    test('create should be a function on the rule', () => {
      expect(typeof noLossOfPrecisionRule.create).toBe('function')
    })
  })

  // ============================================================
  // DETECTION: ADDITION (8 tests)
  // ============================================================
  describe('detecting precision problems', () => {
    describe('addition', () => {
      test('should report 0.1 + 0.2', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)),
        )

        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain('0.1')
        expect(reports[0].message).toContain('0.2')
      })

      test('should report 0.2 + 0.1', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createLiteral(0.2), createLiteral(0.1)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report 19.08 + 2.01', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createLiteral(19.08), createLiteral(2.01)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report 0.99 + 0.01', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createLiteral(0.99), createLiteral(0.01)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report 0.7 + 0.3', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createLiteral(0.7), createLiteral(0.3)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report 0.2 + 0.4', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createLiteral(0.2), createLiteral(0.4)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report 0.0001 + 0.0002', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createLiteral(0.0001), createLiteral(0.0002)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report x + 0.1 (variable with decimal)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createIdentifier('x'), createLiteral(0.1)),
        )

        expect(reports.length).toBe(1)
      })
    })

    // ============================================================
    // DETECTION: SUBTRACTION (7 tests)
    // ============================================================
    describe('subtraction', () => {
      test('should report 0.3 - 0.1', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('-', createLiteral(0.3), createLiteral(0.1)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report 0.1 - 0.01', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('-', createLiteral(0.1), createLiteral(0.01)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report 1.5 - 0.5', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('-', createLiteral(1.5), createLiteral(0.5)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report 0.8 - 0.1', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('-', createLiteral(0.8), createLiteral(0.1)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report 0.6 - 0.2', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('-', createLiteral(0.6), createLiteral(0.2)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report x - 0.5 (variable minus float)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('-', createIdentifier('x'), createLiteral(0.5)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report 0.5 - x (float minus variable)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('-', createLiteral(0.5), createIdentifier('x')),
        )

        expect(reports.length).toBe(1)
      })
    })

    // ============================================================
    // DETECTION: MULTIPLICATION (7 tests)
    // ============================================================
    describe('multiplication', () => {
      test('should report 0.07 * 100', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('*', createLiteral(0.07), createLiteral(100)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report 0.55 * 100', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('*', createLiteral(0.55), createLiteral(100)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report 0.1 * 0.2 (float * float)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('*', createLiteral(0.1), createLiteral(0.2)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report 0.33 * 3 (repeating decimal)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('*', createLiteral(0.33), createLiteral(3)))

        expect(reports.length).toBe(1)
      })

      test('should report 0.1 * 3 (float * integer)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('*', createLiteral(0.1), createLiteral(3)))

        expect(reports.length).toBe(1)
      })

      test('should report 0.9 * 0.9', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('*', createLiteral(0.9), createLiteral(0.9)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report 0.5 * x (float * variable)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('*', createLiteral(0.5), createIdentifier('x')),
        )

        expect(reports.length).toBe(1)
      })
    })

    // ============================================================
    // DETECTION: DIVISION (8 tests)
    // ============================================================
    describe('division', () => {
      test('should report 0.5 / 3 (division with non-power-of-2)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('/', createLiteral(0.5), createLiteral(3)))

        expect(reports.length).toBe(1)
      })

      test('should report 0.5 / 0.5 (float divisor)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('/', createLiteral(0.5), createLiteral(0.5)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report 1.5 / 3', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('/', createLiteral(1.5), createLiteral(3)))

        expect(reports.length).toBe(1)
      })

      test('should report 0.1 / 0.3', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('/', createLiteral(0.1), createLiteral(0.3)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report 0.7 / 3', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('/', createLiteral(0.7), createLiteral(3)))

        expect(reports.length).toBe(1)
      })

      test('should report 0.5 / 0 (division by zero)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('/', createLiteral(0.5), createLiteral(0)))

        expect(reports.length).toBe(1)
      })

      test('should report 0.5 / -2 (negative divisor)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('/', createLiteral(0.5), createLiteral(-2)))

        expect(reports.length).toBe(1)
      })

      test('should report x / 0.5 (variable divided by float)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('/', createIdentifier('x'), createLiteral(0.5)),
        )

        expect(reports.length).toBe(1)
      })
    })
  })

  // ============================================================
  // NOT REPORTING: SAFE OPERATORS (8 tests)
  // ============================================================
  describe('not reporting safe operations', () => {
    describe('safe operators', () => {
      test('should not report x + y (no literals)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createIdentifier('x'), createIdentifier('y')),
        )

        expect(reports.length).toBe(0)
      })

      test('should not report x > 0.1 (comparison)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('>', createIdentifier('x'), createLiteral(0.1)),
        )

        expect(reports.length).toBe(0)
      })

      test('should not report x < 0.1 (comparison)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('<', createIdentifier('x'), createLiteral(0.1)),
        )

        expect(reports.length).toBe(0)
      })

      test('should not report x === y (strict equality)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('===', createIdentifier('x'), createIdentifier('y')),
        )

        expect(reports.length).toBe(0)
      })

      test('should not report x !== y (strict inequality)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('!==', createIdentifier('x'), createIdentifier('y')),
        )

        expect(reports.length).toBe(0)
      })

      test('should not report x >= 0.1 (comparison)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('>=', createIdentifier('x'), createLiteral(0.1)),
        )

        expect(reports.length).toBe(0)
      })

      test('should not report x <= 0.1 (comparison)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('<=', createIdentifier('x'), createLiteral(0.1)),
        )

        expect(reports.length).toBe(0)
      })

      test('should not report 0.1 % 0.2 (modulo not checked)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('%', createLiteral(0.1), createLiteral(0.2)),
        )

        expect(reports.length).toBe(0)
      })
    })

    // ============================================================
    // NOT REPORTING: INTEGER OPERANDS (7 tests)
    // ============================================================
    describe('integer operands', () => {
      test('should not report 1 + 2', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('+', createLiteral(1), createLiteral(2)))

        expect(reports.length).toBe(0)
      })

      test('should not report 10 + 20', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('+', createLiteral(10), createLiteral(20)))

        expect(reports.length).toBe(0)
      })

      test('should not report 100 * 50', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('*', createLiteral(100), createLiteral(50)))

        expect(reports.length).toBe(0)
      })

      test('should not report x + 1 (variable with integer)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createIdentifier('x'), createLiteral(1)),
        )

        expect(reports.length).toBe(0)
      })

      test('should not report x - 1', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('-', createIdentifier('x'), createLiteral(1)),
        )

        expect(reports.length).toBe(0)
      })

      test('should not report 10 / 2 (integer division)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('/', createLiteral(10), createLiteral(2)))

        expect(reports.length).toBe(0)
      })

      test('should not report 0 + 0', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0), createLiteral(0)))

        expect(reports.length).toBe(0)
      })
    })

    // ============================================================
    // NOT REPORTING: COMPARISON OPERATORS (8 tests)
    // ============================================================
    describe('comparison operators with floats', () => {
      test('should not report 0.1 > 0.2', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('>', createLiteral(0.1), createLiteral(0.2)),
        )

        expect(reports.length).toBe(0)
      })

      test('should not report 0.1 < 0.2', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('<', createLiteral(0.1), createLiteral(0.2)),
        )

        expect(reports.length).toBe(0)
      })

      test('should not report 0.1 >= 0.2', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('>=', createLiteral(0.1), createLiteral(0.2)),
        )

        expect(reports.length).toBe(0)
      })

      test('should not report 0.1 <= 0.2', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('<=', createLiteral(0.1), createLiteral(0.2)),
        )

        expect(reports.length).toBe(0)
      })

      test('should not report 0.1 == 0.2', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('==', createLiteral(0.1), createLiteral(0.2)),
        )

        expect(reports.length).toBe(0)
      })

      test('should not report 0.1 != 0.2', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('!=', createLiteral(0.1), createLiteral(0.2)),
        )

        expect(reports.length).toBe(0)
      })

      test('should not report 0.1 === 0.2', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('===', createLiteral(0.1), createLiteral(0.2)),
        )

        expect(reports.length).toBe(0)
      })

      test('should not report 0.1 !== 0.2', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('!==', createLiteral(0.1), createLiteral(0.2)),
        )

        expect(reports.length).toBe(0)
      })
    })

    // ============================================================
    // NOT REPORTING: SAFE DIVISION (7 tests)
    // ============================================================
    describe('safe division by power of 2', () => {
      test('should not report 0.5 / 1', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('/', createLiteral(0.5), createLiteral(1)))

        expect(reports.length).toBe(0)
      })

      test('should not report 0.5 / 2', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('/', createLiteral(0.5), createLiteral(2)))

        expect(reports.length).toBe(0)
      })

      test('should not report 0.5 / 4', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('/', createLiteral(0.5), createLiteral(4)))

        expect(reports.length).toBe(0)
      })

      test('should not report 0.5 / 8', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('/', createLiteral(0.5), createLiteral(8)))

        expect(reports.length).toBe(0)
      })

      test('should not report 0.5 / 16', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('/', createLiteral(0.5), createLiteral(16)))

        expect(reports.length).toBe(0)
      })

      test('should not report 0.5 / 32', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('/', createLiteral(0.5), createLiteral(32)))

        expect(reports.length).toBe(0)
      })

      test('should not report 0.5 / 64', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('/', createLiteral(0.5), createLiteral(64)))

        expect(reports.length).toBe(0)
      })
    })
  })

  // ============================================================
  // EDGE CASES: NULL / UNDEFINED / MALFORMED (10 tests)
  // ============================================================
  describe('edge cases', () => {
    describe('null/undefined/malformed nodes', () => {
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

      test('should handle non-object node (string)', () => {
        const { context } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        expect(() => visitor.BinaryExpression('string')).not.toThrow()
      })

      test('should handle non-object node (number)', () => {
        const { context } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

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

      test('should handle empty options', () => {
        const { context, reports } = createMockContext({})
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)),
        )

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
        expect(reports.length).toBe(0)
      })

      test('should handle node with null left', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        const node = createBinaryExpression('+', null, createLiteral(0.2))

        expect(() => visitor.BinaryExpression(node)).not.toThrow()
        expect(reports.length).toBe(1)
      })

      test('should handle node with null right', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        const node = createBinaryExpression('+', createLiteral(0.1), null)

        expect(() => visitor.BinaryExpression(node)).not.toThrow()
        expect(reports.length).toBe(1)
      })
    })

    // ============================================================
    // EDGE CASES: SPECIAL NUMBERS (8 tests)
    // ============================================================
    describe('special number values', () => {
      test('should report NaN + 0.1 (NaN treated as float)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createLiteral(NaN), createLiteral(0.1)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report Infinity + 0.1', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createLiteral(Infinity), createLiteral(0.1)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report 0.1 + NaN', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createLiteral(0.1), createLiteral(NaN)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report NaN + NaN', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createLiteral(NaN), createLiteral(NaN)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report Infinity - Infinity', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('-', createLiteral(Infinity), createLiteral(Infinity)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report Number.EPSILON + 0.1', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createLiteral(Number.EPSILON), createLiteral(0.1)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report Number.MIN_VALUE + 0.1', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createLiteral(Number.MIN_VALUE), createLiteral(0.1)),
        )

        expect(reports.length).toBe(1)
      })

      test('should report -0.1 + 0.1 (negative float)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createLiteral(-0.1), createLiteral(0.1)),
        )

        expect(reports.length).toBe(1)
      })
    })

    // ============================================================
    // EDGE CASES: NON-NUMERIC LITERALS (7 tests)
    // ============================================================
    describe('non-numeric literals', () => {
      test('should not report non-number literals ("a" + "b")', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createLiteral('a'), createLiteral('b')),
        )

        expect(reports.length).toBe(0)
      })

      test('should report 0.1 + "a" (float with string operand)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createLiteral(0.1), createLiteral('a')),
        )

        expect(reports.length).toBe(1)
      })

      test('should not report true + false (boolean operands)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createLiteral(true), createLiteral(false)),
        )

        expect(reports.length).toBe(0)
      })

      test('should not report null + null', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createLiteral(null), createLiteral(null)),
        )

        expect(reports.length).toBe(0)
      })

      test('should not report with undefined literal values', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression('+', createLiteral(undefined), createLiteral(undefined)),
        )

        expect(reports.length).toBe(0)
      })

      test('should not report empty string + empty string', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('+', createLiteral(''), createLiteral('')))

        expect(reports.length).toBe(0)
      })

      test('should report 0.1 + empty string (float with non-number)', () => {
        const { context, reports } = createMockContext()
        const visitor = noLossOfPrecisionRule.create(context)

        visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral('')))

        expect(reports.length).toBe(1)
      })
    })
  })

  // ============================================================
  // LOCATION REPORTING (15 tests)
  // ============================================================
  describe('location reporting', () => {
    test('should report correct location at line 25 column 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2), 25, 10),
      )

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2), 1, 0),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 100 column 50', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2), 100, 50),
      )

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location at line 5 column 20', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2), 5, 20),
      )

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should include both start and end in location', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2), 3, 5),
      )

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2), 3, 5),
      )

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('should report location for subtraction operations', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createLiteral(0.3), createLiteral(0.1), 7, 3),
      )

      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('should report location for multiplication operations', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('*', createLiteral(0.07), createLiteral(100), 12, 8),
      )

      expect(reports[0].loc?.start.line).toBe(12)
    })

    test('should report location for division operations', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('/', createLiteral(0.5), createLiteral(3), 4, 2),
      )

      expect(reports[0].loc?.start.line).toBe(4)
    })

    test('should preserve exact column number', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2), 1, 42),
      )

      expect(reports[0].loc?.start.column).toBe(42)
    })

    test('should preserve exact line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2), 999, 0),
      )

      expect(reports[0].loc?.start.line).toBe(999)
    })

    test('should report location with column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2), 1, 0),
      )

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at large line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2), 5000, 10),
      )

      expect(reports[0].loc?.start.line).toBe(5000)
    })

    test('should report different locations for different nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2), 1, 0),
      )
      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(0.3), createLiteral(0.4), 2, 5),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.column).toBe(5)
    })

    test('should report location for single float operand', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(0.1), createIdentifier('x'), 10, 20),
      )

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(20)
    })
  })

  // ============================================================
  // MESSAGE QUALITY (10 tests)
  // ============================================================
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

    test('should include both operands in message for two floats', () => {
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

    test('should use ellipsis for non-float right operand', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(0.1), createIdentifier('x')),
      )

      expect(reports[0].message).toContain('0.1 + ...')
    })

    test('should use ellipsis for non-float left operand', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createIdentifier('x'), createLiteral(0.1)),
      )

      expect(reports[0].message).toContain('... + 0.1')
    })

    test('should include both values when both are floats', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('*', createLiteral(0.1), createLiteral(0.2)))

      expect(reports[0].message).toContain('0.1 * 0.2')
    })

    test('should mention decimal library in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))

      expect(reports[0].message.toLowerCase()).toContain('decimal')
    })

    test('should mention Math.round in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))

      expect(reports[0].message).toContain('Math.round')
    })
  })

  // ============================================================
  // MULTIPLE REPORTS (10 tests)
  // ============================================================
  describe('multiple reports', () => {
    test('should report for each BinaryExpression call', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))
      visitor.BinaryExpression(createBinaryExpression('-', createLiteral(0.3), createLiteral(0.1)))

      expect(reports.length).toBe(2)
    })

    test('should accumulate reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))
      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))
      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))

      expect(reports.length).toBe(3)
    })

    test('should report for two different precision issues', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))
      visitor.BinaryExpression(createBinaryExpression('*', createLiteral(0.55), createLiteral(100)))

      expect(reports.length).toBe(2)
    })

    test('should report for three different operations', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))
      visitor.BinaryExpression(createBinaryExpression('-', createLiteral(0.3), createLiteral(0.1)))
      visitor.BinaryExpression(createBinaryExpression('*', createLiteral(0.07), createLiteral(100)))

      expect(reports.length).toBe(3)
    })

    test('should report only once per node (same node twice)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2))

      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(2)
    })

    test('should handle reportable then non-reportable sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))
      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(1), createLiteral(2)))

      expect(reports.length).toBe(1)
    })

    test('should handle non-reportable then reportable sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(1), createLiteral(2)))
      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))

      expect(reports.length).toBe(1)
    })

    test('should report for 5 different precision issues', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))
      visitor.BinaryExpression(createBinaryExpression('-', createLiteral(0.3), createLiteral(0.1)))
      visitor.BinaryExpression(createBinaryExpression('*', createLiteral(0.07), createLiteral(100)))
      visitor.BinaryExpression(createBinaryExpression('/', createLiteral(0.5), createLiteral(3)))
      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(0.99), createLiteral(0.01)),
      )

      expect(reports.length).toBe(5)
    })

    test('should maintain separate report messages for different nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))
      visitor.BinaryExpression(createBinaryExpression('*', createLiteral(0.55), createLiteral(100)))

      expect(reports[0].message).toContain('0.1')
      expect(reports[1].message).toContain('0.55')
    })

    test('should maintain correct report order', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2), 1, 0),
      )
      visitor.BinaryExpression(
        createBinaryExpression('-', createLiteral(0.3), createLiteral(0.1), 2, 0),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
    })
  })

  // ============================================================
  // CONTEXT HANDLING (10 tests)
  // ============================================================
  describe('context handling', () => {
    test('should work with default context', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))

      expect(reports.length).toBe(1)
    })

    test('should work with empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))

      expect(reports.length).toBe(1)
    })

    test('should work with custom file path', () => {
      const { context, reports } = createMockContext({}, '/custom/path/file.ts')
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'const x = 0.1 + 0.2;')
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))

      expect(reports.length).toBe(1)
    })

    test('should report regardless of file path', () => {
      const { context, reports } = createMockContext({}, '/another/directory/test.js')
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))

      expect(reports.length).toBe(1)
    })

    test('should report regardless of source content', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'console.log("hello")')
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))

      expect(reports.length).toBe(1)
    })

    test('should handle options with extra properties', () => {
      const { context, reports } = createMockContext({ customOption: true, level: 5 })
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))

      expect(reports.length).toBe(1)
    })

    test('should work when called multiple times with same context', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))
      visitor.BinaryExpression(createBinaryExpression('-', createLiteral(0.3), createLiteral(0.1)))

      expect(reports.length).toBe(2)
    })

    test('should work regardless of workspace root', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '0.1 + 0.2;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/different/workspace',
      } as unknown as RuleContext

      const visitor = noLossOfPrecisionRule.create(context)
      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))

      expect(reports.length).toBe(1)
    })

    test('should work with deeply nested options', () => {
      const { context, reports } = createMockContext({ nested: { deep: { value: 42 } } })
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(0.1), createLiteral(0.2)))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // DATA-DRIVEN DETECTION TESTS (25 tests)
  // ============================================================
  describe('data-driven detection tests', () => {
    const detectionCases = [
      { left: 0.1, op: '+', right: 0.2 },
      { left: 0.2, op: '+', right: 0.1 },
      { left: 0.3, op: '-', right: 0.1 },
      { left: 0.07, op: '*', right: 100 },
      { left: 0.55, op: '*', right: 100 },
      { left: 0.5, op: '/', right: 3 },
      { left: 19.08, op: '+', right: 2.01 },
      { left: 0.1, op: '-', right: 0.01 },
      { left: 0.5, op: '+', right: 0.5 },
      { left: 0.25, op: '+', right: 0.25 },
      { left: 0.125, op: '+', right: 0.125 },
      { left: 0.1, op: '*', right: 0.2 },
      { left: 0.1, op: '/', right: 0.3 },
      { left: 0.99, op: '+', right: 0.01 },
      { left: 1.5, op: '-', right: 0.5 },
      { left: 0.33, op: '*', right: 3 },
      { left: 1.5, op: '/', right: 3 },
      { left: 0.7, op: '+', right: 0.3 },
      { left: 0.8, op: '-', right: 0.1 },
      { left: 0.1, op: '*', right: 3 },
      { left: 0.2, op: '+', right: 0.4 },
      { left: 0.6, op: '-', right: 0.2 },
      { left: 0.7, op: '/', right: 3 },
      { left: 0.9, op: '*', right: 0.9 },
      { left: 0.0001, op: '+', right: 0.0002 },
    ]

    test.each(detectionCases)('should report for $left $op $right', ({ left, op, right }) => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(op, createLiteral(left), createLiteral(right)),
      )

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // DATA-DRIVEN NON-REPORTING TESTS (25 tests)
  // ============================================================
  describe('data-driven non-reporting tests', () => {
    const noReportCases = [
      { left: 1, op: '+', right: 2, desc: 'integer addition' },
      { left: 10, op: '-', right: 5, desc: 'integer subtraction' },
      { left: 100, op: '*', right: 50, desc: 'integer multiplication' },
      { left: 10, op: '/', right: 2, desc: 'integer division' },
      { left: 0, op: '+', right: 0, desc: 'zero addition' },
      { left: 5, op: '-', right: 3, desc: 'small integer subtraction' },
      { left: 7, op: '*', right: 8, desc: 'small integer multiply' },
      { left: 20, op: '/', right: 4, desc: 'integer division by power of 2' },
      { left: 100, op: '+', right: 200, desc: 'larger integer addition' },
      { left: 50, op: '-', right: 25, desc: 'integer subtraction' },
      { left: 0.1, op: '>', right: 0.2, desc: 'greater than comparison' },
      { left: 0.1, op: '<', right: 0.2, desc: 'less than comparison' },
      { left: 0.1, op: '>=', right: 0.2, desc: 'greater-or-equal comparison' },
      { left: 0.1, op: '<=', right: 0.2, desc: 'less-or-equal comparison' },
      { left: 0.1, op: '===', right: 0.2, desc: 'strict equality' },
      { left: 0.1, op: '!==', right: 0.2, desc: 'strict inequality' },
      { left: 0.1, op: '==', right: 0.2, desc: 'loose equality' },
      { left: 0.1, op: '!=', right: 0.2, desc: 'loose inequality' },
      { left: 0.1, op: '%', right: 0.2, desc: 'modulo operator' },
      { left: 0.1, op: '**', right: 0.2, desc: 'exponentiation operator' },
      { left: 1, op: '&', right: 2, desc: 'bitwise AND' },
      { left: 1, op: '|', right: 2, desc: 'bitwise OR' },
      { left: 1, op: '^', right: 2, desc: 'bitwise XOR' },
      { left: 1, op: '<<', right: 2, desc: 'left shift' },
      { left: 1, op: '>>', right: 2, desc: 'right shift' },
    ]

    test.each(noReportCases)('should not report for $desc', ({ left, op, right }) => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(op, createLiteral(left), createLiteral(right)),
      )

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // ADDITIONAL DETECTION TESTS (15 tests)
  // ============================================================
  describe('additional detection scenarios', () => {
    test('should report 0.1 + x (decimal with variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(0.1), createIdentifier('x')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report x * 0.1 (variable multiplied by float)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('*', createIdentifier('x'), createLiteral(0.1)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report 0.1 * x (float multiplied by variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('*', createLiteral(0.1), createIdentifier('x')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report 0.5 / x (float divided by variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('/', createLiteral(0.5), createIdentifier('x')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report x - 0.3 (variable minus float)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createIdentifier('x'), createLiteral(0.3)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report 0.3 - x (float minus variable)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('-', createLiteral(0.3), createIdentifier('x')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report 1.1 + 2.2 (classic precision loss)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(1.1), createLiteral(2.2)))

      expect(reports.length).toBe(1)
    })

    test('should report 0.7 - 0.4 (precision loss subtraction)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('-', createLiteral(0.7), createLiteral(0.4)))

      expect(reports.length).toBe(1)
    })

    test('should report 3.14 * 2 (pi approximation)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('*', createLiteral(3.14), createLiteral(2)))

      expect(reports.length).toBe(1)
    })

    test('should report very small floats 1e-10 + 2e-10', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(1e-10), createLiteral(2e-10)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report negative float -1.5 + 0.1', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('+', createLiteral(-1.5), createLiteral(0.1)))

      expect(reports.length).toBe(1)
    })

    test('should report 0.3 / 10 (float divided by non-power-of-2)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('/', createLiteral(0.3), createLiteral(10)))

      expect(reports.length).toBe(1)
    })

    test('should report 0.001 + 0.002 (small decimals)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral(0.001), createLiteral(0.002)),
      )

      expect(reports.length).toBe(1)
    })

    test('should report 2.5 / 3 (non-representable result)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('/', createLiteral(2.5), createLiteral(3)))

      expect(reports.length).toBe(1)
    })

    test('should report 0.15 * 100 (multiplication with scaling)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('*', createLiteral(0.15), createLiteral(100)))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // ADDITIONAL NOT-REPORTING TESTS (10 tests)
  // ============================================================
  describe('additional safe operations', () => {
    test('should not report x / 2 (division by power-of-2 integer)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('/', createIdentifier('x'), createLiteral(2)))

      expect(reports.length).toBe(0)
    })

    test('should not report x / 4 (division by power-of-2 integer)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('/', createIdentifier('x'), createLiteral(4)))

      expect(reports.length).toBe(0)
    })

    test('should not report x / 8 (division by power-of-2 integer)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('/', createIdentifier('x'), createLiteral(8)))

      expect(reports.length).toBe(0)
    })

    test('should not report x / 16 (division by power-of-2 integer)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('/', createIdentifier('x'), createLiteral(16)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x / 1 (division by 1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('/', createIdentifier('x'), createLiteral(1)))

      expect(reports.length).toBe(0)
    })

    test('should not report "hello" + "world" (string concatenation)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('+', createLiteral('hello'), createLiteral('world')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x ** 0.5 (exponentiation operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('**', createIdentifier('x'), createLiteral(0.5)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x & 0.1 (bitwise AND)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('&', createIdentifier('x'), createLiteral(0.1)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x | 0.1 (bitwise OR)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('|', createIdentifier('x'), createLiteral(0.1)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x ^ 0.1 (bitwise XOR)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('^', createIdentifier('x'), createLiteral(0.1)),
      )

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // MULTIPLICATION INTEGER OPTIMIZATION (10 tests)
  // ============================================================
  describe('multiplication with integer operand optimization', () => {
    test('should not report x * 5 (integer literal right, no float left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('*', createIdentifier('x'), createLiteral(5)))

      expect(reports.length).toBe(0)
    })

    test('should not report 5 * x (integer literal left, no float right)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('*', createLiteral(5), createIdentifier('x')))

      expect(reports.length).toBe(0)
    })

    test('should not report x * 10 (integer literal right, no float left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('*', createIdentifier('x'), createLiteral(10)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report 100 * x (integer literal left, no float right)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('*', createLiteral(100), createIdentifier('x')),
      )

      expect(reports.length).toBe(0)
    })

    test('should report 0.1 * 5 (float literal left with integer right)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('*', createLiteral(0.1), createLiteral(5)))

      expect(reports.length).toBe(1)
    })

    test('should report 5 * 0.1 (integer left with float literal right)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('*', createLiteral(5), createLiteral(0.1)))

      expect(reports.length).toBe(1)
    })

    test('should report 0.1 * 100 (float * integer literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('*', createLiteral(0.1), createLiteral(100)))

      expect(reports.length).toBe(1)
    })

    test('should report 100 * 0.1 (integer literal * float)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('*', createLiteral(100), createLiteral(0.1)))

      expect(reports.length).toBe(1)
    })

    test('should not report 2 * 3 (both integer literals)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('*', createLiteral(2), createLiteral(3)))

      expect(reports.length).toBe(0)
    })

    test('should report 3.14 * 2 (float * integer literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('*', createLiteral(3.14), createLiteral(2)))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // EDGE CASES: NODE TYPE VARIATIONS (7 tests)
  // ============================================================
  describe('node type variations', () => {
    test('should not report for non-BinaryExpression type (CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = {
        type: 'CallExpression',
        operator: '+',
        left: createLiteral(0.1),
        right: createLiteral(0.2),
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for non-BinaryExpression type (MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = {
        type: 'MemberExpression',
        operator: '+',
        left: createLiteral(0.1),
        right: createLiteral(0.2),
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with loc.start as non-number', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createLiteral(0.1),
        right: createLiteral(0.2),
        loc: {
          start: { line: 'bad' as unknown as number, column: 'bad' as unknown as number },
          end: { line: 1, column: 10 },
        },
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with empty loc.start and loc.end', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createLiteral(0.1),
        right: createLiteral(0.2),
        loc: { start: {}, end: {} },
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with boolean true as type', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = {
        type: true,
        operator: '+',
        left: createLiteral(0.1),
        right: createLiteral(0.2),
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric type value', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = {
        type: 42,
        operator: '+',
        left: createLiteral(0.1),
        right: createLiteral(0.2),
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createLiteral(0.1),
        right: createLiteral(0.2),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        range: [0, 10],
        extra: { parenthesized: true },
        leadingComments: [],
        trailingComments: [],
      }

      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with array as left operand', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('+', [1, 2, 3], createLiteral(0.1))
      visitor.BinaryExpression(node)

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
    })

    test('should handle node with array as right operand', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      const node = createBinaryExpression('+', createLiteral(0.1), [1, 2, 3])
      visitor.BinaryExpression(node)

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
    })
  })

  describe('division edge cases', () => {
    test('should not report 5 / 2 (integer division)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('/', createLiteral(5), createLiteral(2)))

      expect(reports.length).toBe(0)
    })

    test('should report 0.5 / -3 (negative non-power-of-2 divisor)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('/', createLiteral(0.5), createLiteral(-3)))

      expect(reports.length).toBe(1)
    })

    test('should report 0.5 / 5 (non-power-of-2 divisor)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(createBinaryExpression('/', createLiteral(0.5), createLiteral(5)))

      expect(reports.length).toBe(1)
    })

    test('should not report x / 128 (large power-of-2 divisor)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('/', createIdentifier('x'), createLiteral(128)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report x / 256 (power-of-2 divisor)', () => {
      const { context, reports } = createMockContext()
      const visitor = noLossOfPrecisionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('/', createIdentifier('x'), createLiteral(256)),
      )

      expect(reports.length).toBe(0)
    })
  })
})

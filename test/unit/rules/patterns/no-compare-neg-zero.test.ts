import { describe, test, expect, vi } from 'vitest'
import { noCompareNegZeroRule } from '../../../../src/rules/patterns/no-compare-neg-zero.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'x === -0;',
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

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createUnaryExpression(operator: string, argument: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix: true,
  }
}

describe('no-compare-neg-zero rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noCompareNegZeroRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noCompareNegZeroRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noCompareNegZeroRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noCompareNegZeroRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noCompareNegZeroRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noCompareNegZeroRule.meta.fixable).toBe('code')
    })

    test('should mention -0 in description', () => {
      expect(noCompareNegZeroRule.meta.docs?.description).toContain('-0')
    })

    test('should mention Object.is in description', () => {
      expect(noCompareNegZeroRule.meta.docs?.description).toContain('Object.is')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  describe('detecting comparisons with -0', () => {
    test('should report x === -0', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createUnaryExpression('-', createLiteral(0)),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Object.is')
    })

    test('should report -0 === x', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression(
        '===',
        createUnaryExpression('-', createLiteral(0)),
        createIdentifier('x'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x == -0', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression(
        '==',
        createIdentifier('x'),
        createUnaryExpression('-', createLiteral(0)),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x !== -0', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression(
        '!==',
        createIdentifier('x'),
        createUnaryExpression('-', createLiteral(0)),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('!Object.is')
    })

    test('should report x != -0', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression(
        '!=',
        createIdentifier('x'),
        createUnaryExpression('-', createLiteral(0)),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting comparisons with literal 0 (treated as -0)', () => {
    test('should report x === 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createLiteral(0))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report 0 === x', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression('===', createLiteral(0), createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report x == 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression('==', createIdentifier('x'), createLiteral(0))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid comparisons', () => {
    test('should not report x === 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createLiteral(1))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === -1', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression(
        '===',
        createIdentifier('x'),
        createUnaryExpression('-', createLiteral(1)),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x === y', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x < 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression('<', createIdentifier('x'), createLiteral(0))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x > 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression('>', createIdentifier('x'), createLiteral(0))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x <= 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression('<=', createIdentifier('x'), createLiteral(0))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x >= 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression('>=', createIdentifier('x'), createLiteral(0))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x + 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression('+', createIdentifier('x'), createLiteral(0))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createLiteral(0),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = createBinaryExpression('===', createIdentifier('x'), createLiteral(0), 25, 10)

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createLiteral(0),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without left/right', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
    })
  })

  describe('message quality', () => {
    test('should mention Object.is for === comparison', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports[0].message).toContain('Object.is')
    })

    test('should mention !Object.is for !== comparison', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports[0].message).toContain('!Object.is')
    })

    test('should mention operator in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports[0].message).toContain('===')
    })

    test('should mention -0 in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(0)),
      )

      expect(reports[0].message).toContain('-0')
    })
  })

  describe('loc edge cases', () => {
    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createLiteral(0),
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createLiteral(0),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 'not-a-number' as unknown as number },
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createLiteral(0),
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createLiteral(0),
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noCompareNegZeroRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createIdentifier('x'),
        right: createLiteral(0),
        loc: {},
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })
})

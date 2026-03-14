import { describe, test, expect, vi } from 'vitest'
import { noConstantBinaryExpressionRule } from '../../../../src/rules/correctness/no-constant-binary-expression.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = 1;',
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
  left: unknown,
  right: unknown,
  operator: string,
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
      end: { line, column: column + 20 },
    },
  }
}

function createLiteral(value: unknown, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-constant-binary-expression rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noConstantBinaryExpressionRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noConstantBinaryExpressionRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noConstantBinaryExpressionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(noConstantBinaryExpressionRule.meta.docs?.category).toBe('correctness')
    })

    test('should have schema defined', () => {
      expect(noConstantBinaryExpressionRule.meta.schema).toBeDefined()
    })

    test('should have correct description', () => {
      expect(noConstantBinaryExpressionRule.meta.docs?.description).toContain('constant')
    })
  })

  describe('create', () => {
    test('should return visitor object with BinaryExpression method', () => {
      const { context } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should report comparison with boolean literal on left', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('foo'), '==='),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean')
      expect(reports[0].message).toContain('left')
    })

    test('should report comparison with boolean literal on right', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('foo'), createLiteral(false), '==='),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('boolean')
      expect(reports[0].message).toContain('right')
    })

    test('should report comparison with numeric literal 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIdentifier('count'), '==='),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('numeric')
    })

    test('should report comparison with numeric literal 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('status'), createLiteral(1), '!=='),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('numeric')
    })

    test('should not report comparison with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral('foo'), createIdentifier('str'), '==='),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report comparison with two variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIdentifier('a'), createIdentifier('b'), '==='),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report comparison with two literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createLiteral(false), '==='),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report comparison with non-strict operators', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('foo'), '=='),
      )

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('foo'), '===', 5, 10),
      )

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: createLiteral(true),
        right: createIdentifier('foo'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral(true),
        right: createIdentifier('foo'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without left/right', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should include helpful guidance', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstantBinaryExpressionRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(true), createIdentifier('foo'), '==='),
      )

      expect(reports[0].message).toContain('mistake')
    })
  })
})

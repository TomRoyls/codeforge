import { describe, test, expect, vi } from 'vitest'
import { validTypeofRule } from '../../../../src/rules/patterns/valid-typeof.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => 'typeof x === "string"',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [] },
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

function createUnaryExpression(operator: string, argument: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
    prefix: true,
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

describe('valid-typeof rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(validTypeofRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(validTypeofRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(validTypeofRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(validTypeofRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention typeof in description', () => {
      expect(validTypeofRule.meta.docs?.description.toLowerCase()).toContain('typeof')
    })
  })

  describe('create', () => {
    test('should return visitor with BinaryExpression method', () => {
      const { context } = createMockContext()
      const visitor = validTypeofRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  describe('detecting invalid typeof comparisons', () => {
    test('should report typeof x === "invalid"', () => {
      const { context, reports } = createMockContext()
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('invalid'),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('invalid')
    })

    test('should report "invalid" === typeof x', () => {
      const { context, reports } = createMockContext()
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createLiteral('invalid'),
          createUnaryExpression('typeof', createIdentifier('x')),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should report typeof x !== "invalid"', () => {
      const { context, reports } = createMockContext()
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '!==',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('invalid'),
        ),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report typeof x === "string"', () => {
      const { context, reports } = createMockContext()
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('string'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === "number"', () => {
      const { context, reports } = createMockContext()
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('number'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === "boolean"', () => {
      const { context, reports } = createMockContext()
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('boolean'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === "undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('undefined'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === "object"', () => {
      const { context, reports } = createMockContext()
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('object'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === "function"', () => {
      const { context, reports } = createMockContext()
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('function'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === "symbol"', () => {
      const { context, reports } = createMockContext()
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('symbol'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report typeof x === "bigint"', () => {
      const { context, reports } = createMockContext()
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral('bigint'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report non-typeof comparisons', () => {
      const { context, reports } = createMockContext()
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral('string')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report non-string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = validTypeofRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          '===',
          createUnaryExpression('typeof', createIdentifier('x')),
          createLiteral(123),
        ),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = validTypeofRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = validTypeofRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = validTypeofRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createUnaryExpression('typeof', createIdentifier('x')),
        right: createLiteral('invalid'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})

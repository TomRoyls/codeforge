import { describe, test, expect, vi } from 'vitest'
import { useIsnanRule } from '../../../../src/rules/patterns/use-isnan.js'
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
    getSource: () => 'x === NaN',
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

describe('use-isnan rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(useIsnanRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(useIsnanRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(useIsnanRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(useIsnanRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention NaN in description', () => {
      expect(useIsnanRule.meta.docs?.description).toContain('NaN')
    })
  })

  describe('create', () => {
    test('should return visitor with BinaryExpression method', () => {
      const { context } = createMockContext()
      const visitor = useIsnanRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  describe('detecting NaN comparisons', () => {
    test('should report x === NaN', () => {
      const { context, reports } = createMockContext()
      const visitor = useIsnanRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('isnan')
    })

    test('should report NaN === x', () => {
      const { context, reports } = createMockContext()
      const visitor = useIsnanRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('NaN'), createIdentifier('x')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report x !== NaN', () => {
      const { context, reports } = createMockContext()
      const visitor = useIsnanRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!==', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report x == NaN', () => {
      const { context, reports } = createMockContext()
      const visitor = useIsnanRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('==', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report x != NaN', () => {
      const { context, reports } = createMockContext()
      const visitor = useIsnanRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('!=', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report other operators', () => {
      const { context, reports } = createMockContext()
      const visitor = useIsnanRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('<', createIdentifier('x'), createIdentifier('NaN')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report non-NaN comparisons', () => {
      const { context, reports } = createMockContext()
      const visitor = useIsnanRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression('===', createIdentifier('x'), createLiteral(5)),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = useIsnanRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = useIsnanRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = useIsnanRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIdentifier('x'),
        right: createIdentifier('NaN'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without left/right', () => {
      const { context, reports } = createMockContext()
      const visitor = useIsnanRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '===',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})

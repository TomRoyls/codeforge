import { describe, test, expect, vi } from 'vitest'
import { preferMathTruncRule } from '../../../../src/rules/performance/prefer-math-trunc.js'
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

function createBitwiseOrZero(line = 1, column = 0): unknown {
  return {
    type: 'BinaryExpression',
    operator: '|',
    left: { type: 'Identifier', name: 'num' },
    right: { type: 'Literal', value: 0 },
    loc: {
      start: { line, column },
      end: { line, column: column + 7 },
    },
  }
}

function createBitwiseShiftRightZero(line = 1, column = 0): unknown {
  return {
    type: 'BinaryExpression',
    operator: '>>',
    left: { type: 'Identifier', name: 'num' },
    right: { type: 'Literal', value: 0 },
    loc: {
      start: { line, column },
      end: { line, column: column + 7 },
    },
  }
}

function createBitwiseOrNonZero(line = 1, column = 0): unknown {
  return {
    type: 'BinaryExpression',
    operator: '|',
    left: { type: 'Identifier', name: 'num' },
    right: { type: 'Literal', value: 1 },
    loc: {
      start: { line, column },
      end: { line, column: column + 7 },
    },
  }
}

function createBitwiseShiftRightNonZero(line = 1, column = 0): unknown {
  return {
    type: 'BinaryExpression',
    operator: '>>',
    left: { type: 'Identifier', name: 'num' },
    right: { type: 'Literal', value: 2 },
    loc: {
      start: { line, column },
      end: { line, column: column + 8 },
    },
  }
}

function createOtherBinaryExpression(line = 1, column = 0): unknown {
  return {
    type: 'BinaryExpression',
    operator: '+',
    left: { type: 'Identifier', name: 'a' },
    right: { type: 'Identifier', name: 'b' },
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

function createMathTruncCall(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Math' },
      property: { type: 'Identifier', name: 'trunc' },
    },
    arguments: [{ type: 'Identifier', name: 'num' }],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

describe('prefer-math-trunc rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(preferMathTruncRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferMathTruncRule.meta.severity).toBe('warn')
    })

    test('should not be recommended by default', () => {
      expect(preferMathTruncRule.meta.docs?.recommended).toBe(false)
    })

    test('should have correct category', () => {
      expect(preferMathTruncRule.meta.docs?.category).toBe('performance')
    })

    test('should have schema defined', () => {
      expect(preferMathTruncRule.meta.schema).toBeDefined()
    })

    test('should have correct description', () => {
      expect(preferMathTruncRule.meta.docs?.description).toContain('Math.trunc')
    })
  })

  describe('create', () => {
    test('should return visitor object with BinaryExpression method', () => {
      const { context } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should report | 0 pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      visitor.BinaryExpression(createBitwiseOrZero())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Math.trunc')
    })

    test('should report >> 0 pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      visitor.BinaryExpression(createBitwiseShiftRightZero())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Math.trunc')
    })

    test('should not report | 1 pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      visitor.BinaryExpression(createBitwiseOrNonZero())

      expect(reports.length).toBe(0)
    })

    test('should not report >> 2 pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      visitor.BinaryExpression(createBitwiseShiftRightNonZero())

      expect(reports.length).toBe(0)
    })

    test('should not report other binary expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      visitor.BinaryExpression(createOtherBinaryExpression())

      expect(reports.length).toBe(0)
    })

    test('should not report Math.trunc() call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      // This is a CallExpression, not a BinaryExpression, so it won't be visited
      // But we test that the visitor only handles BinaryExpression
      expect(visitor).not.toHaveProperty('CallExpression')
    })

    test('should report correct location for | 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      visitor.BinaryExpression(createBitwiseOrZero(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for >> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      visitor.BinaryExpression(createBitwiseShiftRightZero(3, 20))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should include operator in message for | 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      visitor.BinaryExpression(createBitwiseOrZero())

      expect(reports[0].message).toContain('| 0')
    })

    test('should include operator in message for >> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      visitor.BinaryExpression(createBitwiseShiftRightZero())

      expect(reports[0].message).toContain('>> 0')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      const node = { type: 'BinaryExpression', left: {}, right: {} }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without left', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      const node = { type: 'BinaryExpression', operator: '|', right: {} }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without right', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      const node = { type: 'BinaryExpression', operator: '|', left: {} }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'num' },
        right: { type: 'Literal', value: 0 },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with non-Literal right', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'num' },
        right: { type: 'Identifier', name: 'zero' },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-number right value', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'num' },
        right: { type: 'Literal', value: '0' },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle incomplete loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'num' },
        right: { type: 'Literal', value: 0 },
        loc: { start: {} },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should include actionable guidance', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      visitor.BinaryExpression(createBitwiseOrZero())

      expect(reports[0].message).toContain('Prefer Math.trunc')
    })

    test('should mention readability', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      visitor.BinaryExpression(createBitwiseOrZero())

      expect(reports[0].message).toContain('readable')
    })

    test('should mention large number handling for | 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      visitor.BinaryExpression(createBitwiseOrZero())

      expect(reports[0].message).toContain('large numbers')
    })

    test('should mention large number handling for >> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      visitor.BinaryExpression(createBitwiseShiftRightZero())

      expect(reports[0].message).toContain('large numbers')
    })
  })

  describe('multiple patterns', () => {
    test('should report multiple | 0 patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      visitor.BinaryExpression(createBitwiseOrZero(1, 0))
      visitor.BinaryExpression(createBitwiseOrZero(2, 10))

      expect(reports.length).toBe(2)
    })

    test('should report mixed patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)

      visitor.BinaryExpression(createBitwiseOrZero(1, 0))
      visitor.BinaryExpression(createBitwiseShiftRightZero(2, 10))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('| 0')
      expect(reports[1].message).toContain('>> 0')
    })
  })
})

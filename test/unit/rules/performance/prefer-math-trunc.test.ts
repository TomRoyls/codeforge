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

  describe('rule metadata expanded', () => {
    test('meta.type should be a string', () => {
      expect(typeof preferMathTruncRule.meta.type).toBe('string')
    })

    test('meta.severity should be a string', () => {
      expect(typeof preferMathTruncRule.meta.severity).toBe('string')
    })

    test('meta.docs should be defined', () => {
      expect(preferMathTruncRule.meta.docs).toBeDefined()
    })

    test('meta.docs.description should be a non-empty string', () => {
      expect(typeof preferMathTruncRule.meta.docs?.description).toBe('string')
      expect(preferMathTruncRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('meta.docs.category should be performance', () => {
      expect(preferMathTruncRule.meta.docs?.category).toBe('performance')
    })

    test('meta.docs.recommended should be exactly false', () => {
      expect(preferMathTruncRule.meta.docs?.recommended).toBe(false)
    })

    test('meta.docs.url should be defined', () => {
      expect(preferMathTruncRule.meta.docs?.url).toBeDefined()
    })

    test('meta.docs.url should contain prefer-math-trunc', () => {
      expect(preferMathTruncRule.meta.docs?.url).toContain('prefer-math-trunc')
    })

    test('meta.schema should be an empty array', () => {
      expect(preferMathTruncRule.meta.schema).toEqual([])
    })

    test('meta.schema should have length 0', () => {
      expect(preferMathTruncRule.meta.schema.length).toBe(0)
    })
  })

  describe('create function', () => {
    test('should return a visitor with exactly one key: BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      expect(Object.keys(visitor)).toEqual(['BinaryExpression'])
    })

    test('BinaryExpression visitor should be a function', () => {
      const { context } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('should use context.report to report violations', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      expect(reports.length).toBe(1)
    })

    test('should not call report for non-matching patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createOtherBinaryExpression())
      expect(reports.length).toBe(0)
    })

    test('should accept context without options', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      expect(reports.length).toBe(1)
    })
  })

  describe('bitwise OR with 0 detection - various left sides', () => {
    test('should report identifier | 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report CallExpression | 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'getValue' },
          arguments: [],
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 14 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report MemberExpression | 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'val' },
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report numeric Literal | 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Literal', value: 3.14 },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 7 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report nested BinaryExpression | 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report UnaryExpression | 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: {
          type: 'UnaryExpression',
          operator: '-',
          argument: { type: 'Identifier', name: 'x' },
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 6, column: 0 }, end: { line: 6, column: 6 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report ConditionalExpression | 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'flag' },
          consequent: { type: 'Identifier', name: 'a' },
          alternate: { type: 'Identifier', name: 'b' },
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 7, column: 0 }, end: { line: 7, column: 16 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report AssignmentExpression | 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 8, column: 0 }, end: { line: 8, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report ArrayExpression | 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 9, column: 0 }, end: { line: 9, column: 8 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report parenthesized expression | 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: {
          type: 'BinaryExpression',
          operator: '*',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 10, column: 0 }, end: { line: 10, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report SequenceExpression-like left | 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'SequenceExpression' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 11, column: 0 }, end: { line: 11, column: 6 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report UpdateExpression | 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 12, column: 0 }, end: { line: 12, column: 7 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report LogicalExpression as left | 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: {
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 13, column: 0 }, end: { line: 13, column: 12 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report NewExpression | 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Number' },
          arguments: [],
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 14, column: 0 }, end: { line: 14, column: 12 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report TypeCastExpression-like left | 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'TypeCastExpression' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 15, column: 0 }, end: { line: 15, column: 8 } },
      })
      expect(reports.length).toBe(1)
    })
  })

  describe('right shift with 0 detection - various left sides', () => {
    test('should report identifier >> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: { type: 'Identifier', name: 'value' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report CallExpression >> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'parseFloat' },
          arguments: [{ type: 'Identifier', name: 's' }],
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 16 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report MemberExpression >> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'data' },
          property: { type: 'Identifier', name: 'value' },
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 12 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report numeric Literal >> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: { type: 'Literal', value: 2.718 },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 4, column: 0 }, end: { line: 4, column: 8 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report nested BinaryExpression >> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: {
          type: 'BinaryExpression',
          operator: '-',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Identifier', name: 'y' },
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report UnaryExpression >> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: {
          type: 'UnaryExpression',
          operator: '+',
          argument: { type: 'Identifier', name: 'val' },
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 6, column: 0 }, end: { line: 6, column: 8 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report ConditionalExpression >> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'cond' },
          consequent: { type: 'Literal', value: 1 },
          alternate: { type: 'Literal', value: 2 },
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 7, column: 0 }, end: { line: 7, column: 18 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report AssignmentExpression >> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'y' },
          right: { type: 'Literal', value: 5 },
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 8, column: 0 }, end: { line: 8, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report TemplateLiteral-like left >> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: { type: 'TemplateLiteral' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 9, column: 0 }, end: { line: 9, column: 8 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report complex chain >> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Math' },
            property: { type: 'Identifier', name: 'random' },
          },
          arguments: [],
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 10, column: 0 }, end: { line: 10, column: 18 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report FunctionExpression-like left >> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: { type: 'FunctionExpression' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 11, column: 0 }, end: { line: 11, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report ArrowFunctionExpression-like left >> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: { type: 'ArrowFunctionExpression' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 12, column: 0 }, end: { line: 12, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report logical left >> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: {
          type: 'LogicalExpression',
          operator: '&&',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 13, column: 0 }, end: { line: 13, column: 12 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report object-like left >> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: { type: 'ObjectExpression', properties: [] },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 14, column: 0 }, end: { line: 14, column: 8 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report TaggedTemplateExpression-like left >> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: { type: 'TaggedTemplateExpression' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 15, column: 0 }, end: { line: 15, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })
  })

  describe('NOT flagged - other operators', () => {
    test('should not report << 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '<<',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report & 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '&',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report ^ 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '^',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report + expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report - expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '-',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report * expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '*',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report / expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '/',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report % expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '%',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report >>> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>>',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report < expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '<',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report > expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report <= expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '<=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report >= expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report == expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '==',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report === expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report != expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '!=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report !== expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '!==',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report ** expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '**',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report in expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: 'in',
        left: { type: 'Identifier', name: 'key' },
        right: { type: 'Identifier', name: 'obj' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report instanceof expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'Array' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagged - non-zero right operand', () => {
    test('should not report | 1', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report | 2', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report | -1', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: -1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report | 255', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 255 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report | 0.5', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0.5 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report >> 1', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report >> 2', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report >> -1', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: -1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report >> 16', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 16 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report >> 31', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 31 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report | NaN', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: NaN },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report | null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: null },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('NOT flagged - right side not Literal', () => {
    test('should not report when right is an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'zero' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when right is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'CallExpression', callee: { type: 'Identifier', name: 'f' }, arguments: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when right is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'zero' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when right is a BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: {
          type: 'BinaryExpression',
          operator: '-',
          left: { type: 'Literal', value: 1 },
          right: { type: 'Literal', value: 1 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when right is a UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'UnaryExpression', operator: '-', argument: { type: 'Literal', value: 0 } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when right is a ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 't' },
          consequent: { type: 'Literal', value: 0 },
          alternate: { type: 'Literal', value: 1 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 16 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when right is an ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'ArrayExpression', elements: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when right is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'FunctionExpression' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when right is an UpdateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'i' },
          prefix: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when right is a LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: {
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Literal', value: 0 },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })
      expect(reports.length).toBe(0)
    })

    test('should not report when right is empty object (no type)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('violation properties', () => {
    test('report message contains Math.trunc for | 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      expect(reports[0].message).toContain('Math.trunc')
    })

    test('report message contains Math.trunc for >> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseShiftRightZero())
      expect(reports[0].message).toContain('Math.trunc')
    })

    test('report message contains | 0 for bitwise OR', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      expect(reports[0].message).toContain('| 0')
    })

    test('report message contains >> 0 for right shift', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseShiftRightZero())
      expect(reports[0].message).toContain('>> 0')
    })

    test('report message does NOT contain >> 0 for | 0 pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      expect(reports[0].message).not.toContain('>> 0')
    })

    test('report message does NOT contain | 0 for >> 0 pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseShiftRightZero())
      expect(reports[0].message).not.toContain('| 0')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      expect(reports[0].loc).toBeDefined()
    })

    test('report loc has start with line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.start.line).toBeTypeOf('number')
      expect(reports[0].loc?.start.column).toBeTypeOf('number')
    })

    test('report loc has end with line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBeTypeOf('number')
      expect(reports[0].loc?.end.column).toBeTypeOf('number')
    })

    test('report loc start line matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero(42, 15))
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(15)
    })
  })

  describe('extractLocation edge cases', () => {
    test('should return default loc for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(null)
      expect(reports.length).toBe(0)
    })

    test('should use default loc when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 5, column: 3 } },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with missing start', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { end: { line: 10, column: 5 } },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(5)
    })

    test('should handle loc with non-number line (uses default)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 'bad', column: 0 }, end: { line: 'bad', column: 1 } },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with non-number column (uses default)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 3, column: 'bad' }, end: { line: 3, column: 'bad' } },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with undefined line', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: undefined, column: 5 }, end: { line: undefined, column: 10 } },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle loc with null line', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: null, column: 0 }, end: { line: null, column: 5 } },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc where start is null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: null, end: { line: 5, column: 10 } },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc where end is null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 5, column: 10 }, end: null },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle zero values in loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('isTruncationPattern edge cases', () => {
    test('should not match node with wrong type AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'AssignmentExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
      })
      expect(reports.length).toBe(0)
    })

    test('should not match node with wrong type LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'LogicalExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
      })
      expect(reports.length).toBe(0)
    })

    test('should not match boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      expect(() => visitor.BinaryExpression(true)).not.toThrow()
      expect(() => visitor.BinaryExpression(false)).not.toThrow()
    })

    test('should not match number node', () => {
      const { context } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
    })

    test('should not match empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not match array', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      expect(() => visitor.BinaryExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not match when left is null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: null,
        right: { type: 'Literal', value: 0 },
      })
      expect(reports.length).toBe(0)
    })

    test('should not match when right is null', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: null,
      })
      expect(reports.length).toBe(0)
    })

    test('should not match when left is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: 'x',
        right: { type: 'Literal', value: 0 },
      })
      expect(reports.length).toBe(0)
    })

    test('should not match when right is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: '0',
      })
      expect(reports.length).toBe(0)
    })

    test('should not match when left is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: 42,
        right: { type: 'Literal', value: 0 },
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('multiple violations', () => {
    test('should accumulate reports across three | 0 calls', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero(1, 0))
      visitor.BinaryExpression(createBitwiseOrZero(2, 0))
      visitor.BinaryExpression(createBitwiseOrZero(3, 0))
      expect(reports.length).toBe(3)
    })

    test('should accumulate mixed patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      visitor.BinaryExpression(createBitwiseShiftRightZero())
      visitor.BinaryExpression(createBitwiseOrZero())
      expect(reports.length).toBe(3)
    })

    test('should not count non-matching patterns in accumulation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      visitor.BinaryExpression(createOtherBinaryExpression())
      visitor.BinaryExpression(createBitwiseShiftRightZero())
      expect(reports.length).toBe(2)
    })

    test('should handle five sequential | 0 patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.BinaryExpression(createBitwiseOrZero(i + 1, 0))
      }
      expect(reports.length).toBe(5)
    })

    test('should handle ten sequential >> 0 patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.BinaryExpression(createBitwiseShiftRightZero(i + 1, 0))
      }
      expect(reports.length).toBe(10)
    })

    test('should preserve distinct locations for each violation', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero(1, 5))
      visitor.BinaryExpression(createBitwiseOrZero(10, 20))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[1].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.column).toBe(20)
    })

    test('should preserve distinct messages for | 0 vs >> 0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      visitor.BinaryExpression(createBitwiseShiftRightZero())
      expect(reports[0].message).toContain('| 0')
      expect(reports[1].message).toContain('>> 0')
    })

    test('should handle interleaved matching and non-matching patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      visitor.BinaryExpression(createBitwiseOrNonZero())
      visitor.BinaryExpression(createBitwiseShiftRightZero())
      visitor.BinaryExpression(createBitwiseShiftRightNonZero())
      visitor.BinaryExpression(createBitwiseOrZero())
      expect(reports.length).toBe(3)
    })
  })

  describe('edge cases expanded', () => {
    test('should handle node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        extra: true,
        another: { nested: 'object' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with undefined type', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      const node = {
        type: undefined,
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
      }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: null,
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
      }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: 42,
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
      }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with boolean operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: true,
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
      }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle right Literal with value 0 from float 0.0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0.0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle right Literal with value -0', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: -0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle Symbol as node', () => {
      const { context } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      expect(() => visitor.BinaryExpression(Symbol('test'))).not.toThrow()
    })

    test('should handle Date object as node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      expect(() => visitor.BinaryExpression(new Date())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle RegExp as node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      expect(() => visitor.BinaryExpression(/test/)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Map as node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      expect(() => visitor.BinaryExpression(new Map())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle frozen object as node', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      const node = Object.freeze({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('left side expression types - detection confirmed', () => {
    test('should detect | 0 when left is typeof expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: { type: 'Identifier', name: 'x' },
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should detect >> 0 when left is a property access chain', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'a' },
            property: { type: 'Identifier', name: 'b' },
          },
          property: { type: 'Identifier', name: 'c' },
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should detect | 0 when left is a computed member', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 0 },
          computed: true,
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should detect | 0 when left is a string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Literal', value: '3.14' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should detect | 0 when left is a boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Literal', value: true },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should detect | 0 when left is a null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'Literal', value: null },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should detect >> 0 when left is AwaitExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should detect | 0 when left is YieldExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'YieldExpression', argument: { type: 'Identifier', name: 'value' } },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should detect | 0 when left is a ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'ThisExpression' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should detect >> 0 when left is void expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: {
          type: 'UnaryExpression',
          operator: 'void',
          argument: { type: 'Literal', value: 0 },
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should detect | 0 when left is delete expression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: {
          type: 'UnaryExpression',
          operator: 'delete',
          argument: { type: 'Identifier', name: 'obj' },
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 12 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should detect >> 0 when left is SpreadElement-like', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '>>',
        left: { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should detect | 0 when left is a chained call', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'fn' },
              arguments: [],
            },
            property: { type: 'Identifier', name: 'map' },
          },
          arguments: [{ type: 'Identifier', name: 'f' }],
        },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should detect | 0 when left is a SequenceExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '|',
        left: { type: 'SequenceExpression' },
        right: { type: 'Literal', value: 0 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      })
      expect(reports.length).toBe(1)
    })
  })

  describe('visitor isolation', () => {
    test('should report independently for separate context instances', () => {
      const ctx1 = createMockContext()
      const ctx2 = createMockContext()
      const visitor1 = preferMathTruncRule.create(ctx1.context)
      const visitor2 = preferMathTruncRule.create(ctx2.context)

      visitor1.BinaryExpression(createBitwiseOrZero())
      visitor2.BinaryExpression(createBitwiseOrZero())

      expect(ctx1.reports.length).toBe(1)
      expect(ctx2.reports.length).toBe(1)
    })

    test('should not share reports between contexts', () => {
      const ctx1 = createMockContext()
      const ctx2 = createMockContext()
      const visitor1 = preferMathTruncRule.create(ctx1.context)

      visitor1.BinaryExpression(createBitwiseOrZero())
      visitor1.BinaryExpression(createBitwiseOrZero())

      expect(ctx1.reports.length).toBe(2)
      expect(ctx2.reports.length).toBe(0)
    })

    test('should handle visitor called with same node twice', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      const node = createBitwiseOrZero()

      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(2)
    })
  })

  describe('message format details', () => {
    test('message should start with Prefer', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      expect(reports[0].message.startsWith('Prefer')).toBe(true)
    })

    test('message should end with period', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('message should mention truncating', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseShiftRightZero())
      expect(reports[0].message).toContain('truncating')
    })

    test('message for | 0 should have correct structure', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      const msg = reports[0].message
      expect(msg).toContain('Math.trunc()')
      expect(msg).toContain('| 0')
    })

    test('message for >> 0 should have correct structure', () => {
      const { context, reports } = createMockContext()
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseShiftRightZero())
      const msg = reports[0].message
      expect(msg).toContain('Math.trunc()')
      expect(msg).toContain('>> 0')
    })
  })

  describe('context interaction', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/custom/path.ts')
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', 'const x = num | 0;')
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      expect(reports.length).toBe(1)
    })

    test('should work with options passed', () => {
      const { context, reports } = createMockContext({ someOption: true })
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      expect(reports.length).toBe(1)
    })

    test('should work with deeply nested options', () => {
      const { context, reports } = createMockContext({ nested: { deep: { value: 42 } } })
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      expect(reports.length).toBe(1)
    })

    test('should work with null options', () => {
      const { context, reports } = createMockContext(null)
      const visitor = preferMathTruncRule.create(context)
      visitor.BinaryExpression(createBitwiseOrZero())
      expect(reports.length).toBe(1)
    })
  })
})

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { preferNullishCoalescingRule } from '../../../../src/rules/patterns/prefer-nullish-coalescing.js'
import type { RuleContext, RuleVisitor } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = a || b;',
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

function createLogicalOrExpression(
  rightType: string = 'Identifier',
  line = 1,
  column = 0,
): unknown {
  const right =
    rightType === 'true'
      ? { type: 'Literal', value: true }
      : rightType === 'false'
        ? { type: 'Literal', value: false }
        : { type: 'Identifier', name: 'b' }

  return {
    type: 'LogicalExpression',
    operator: '||',
    left: { type: 'Identifier', name: 'a' },
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createLogicalAndExpression(line = 1, column = 0): unknown {
  return {
    type: 'LogicalExpression',
    operator: '&&',
    left: { type: 'Identifier', name: 'a' },
    right: { type: 'Identifier', name: 'b' },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('prefer-nullish-coalescing rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferNullishCoalescingRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferNullishCoalescingRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferNullishCoalescingRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferNullishCoalescingRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferNullishCoalescingRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(preferNullishCoalescingRule.meta.fixable).toBe('code')
    })

    test('should mention nullish coalescing in description', () => {
      expect(preferNullishCoalescingRule.meta.docs?.description.toLowerCase()).toContain('??')
    })

    test('should mention || in description', () => {
      expect(preferNullishCoalescingRule.meta.docs?.description).toContain('||')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = preferNullishCoalescingRule.create(context)

      expect(visitor).toHaveProperty('LogicalExpression')
    })
  })

  describe('detecting || expressions', () => {
    test('should report || with identifier right side', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression('Identifier'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('??')
    })

    test('should not report && expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalAndExpression())

      expect(reports.length).toBe(0)
    })

    test('should not report || true pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression('true'))

      expect(reports.length).toBe(0)
    })

    test('should not report || false pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression('false'))

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention falsy values in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0].message).toMatch(/falsy|0|""|false/)
    })

    test('should mention nullish coalescing operator in message', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports[0].message).toContain('??')
    })
  })

  describe('options - ignoreConditionalTests', () => {
    test('should skip || in if statement when option is true', () => {
      const source = 'if (x || y) { }'
      const { context, reports } = createMockContext(
        { ignoreConditionalTests: true },
        '/src/file.ts',
        source,
      )
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
        loc: {
          start: { line: 1, column: 4 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.LogicalExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report || in if statement when option is false', () => {
      const source = 'if (x || y) { }'
      const { context, reports } = createMockContext(
        { ignoreConditionalTests: false },
        '/src/file.ts',
        source,
      )
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports.length).toBe(1)
    })

    test('should report || not in if statement even with option true', () => {
      const source = 'const x = a || b;'
      const { context, reports } = createMockContext(
        { ignoreConditionalTests: true },
        '/src/file.ts',
        source,
      )
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferNullishCoalescingRule.create(context)

      expect(() => visitor.LogicalExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferNullishCoalescingRule.create(context)

      expect(() => visitor.LogicalExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = preferNullishCoalescingRule.create(context)

      expect(() => visitor.LogicalExpression('string')).not.toThrow()
      expect(() => visitor.LogicalExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without right property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression('Identifier', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = preferNullishCoalescingRule.create(context)

      visitor.LogicalExpression(createLogicalOrExpression())

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
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
        getSource: () => 'const x = a || b;',
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

      const visitor = preferNullishCoalescingRule.create(context)

      expect(() => visitor.LogicalExpression(createLogicalOrExpression())).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (missing start)', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle right node without value property', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Literal' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle nested logical expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = preferNullishCoalescingRule.create(context)

      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: {
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        right: { type: 'Identifier', name: 'c' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      expect(() => visitor.LogicalExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })
})

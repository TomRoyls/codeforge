import { describe, test, expect, vi } from 'vitest'
import { noDebuggerRule } from '../../../../src/rules/patterns/no-debugger.js'
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
    getSource: () => 'debugger;',
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

function createDebuggerStatement(line = 1, column = 0): unknown {
  return {
    type: 'DebuggerStatement',
    loc: {
      start: { line, column },
      end: { line, column: column + 9 },
    },
  }
}

function createNonDebuggerStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'Literal',
      value: 42,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 2 },
    },
  }
}

describe('no-debugger rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noDebuggerRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noDebuggerRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noDebuggerRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noDebuggerRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention debugger in description', () => {
      expect(noDebuggerRule.meta.docs?.description.toLowerCase()).toContain('debugger')
    })
  })

  describe('create', () => {
    test('should return visitor with DebuggerStatement method', () => {
      const { context } = createMockContext()
      const visitor = noDebuggerRule.create(context)

      expect(visitor).toHaveProperty('DebuggerStatement')
    })
  })

  describe('detecting debugger statements', () => {
    test('should report debugger statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('debugger')
    })

    test('should not report non-debugger statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createNonDebuggerStatement())

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDebuggerRule.create(context)

      expect(() => visitor.DebuggerStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDebuggerRule.create(context)

      expect(() => visitor.DebuggerStatement(undefined)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noDebuggerRule.create(context)

      const node = { type: 'DebuggerStatement' }

      expect(() => visitor.DebuggerStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })
})

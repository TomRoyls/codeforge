import { describe, test, expect, vi } from 'vitest'
import { noUnsafeFinallyRule } from '../../../../src/rules/patterns/no-unsafe-finally.js'
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
    getSource: () => 'try {} finally { return; }',
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

function createTryWithReturnInFinally(line = 1, column = 0): unknown {
  return {
    type: 'TryStatement',
    block: {
      type: 'BlockStatement',
      body: [],
    },
    handler: null,
    finalizer: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ReturnStatement',
          argument: null,
          loc: { start: { line, column }, end: { line, column: column + 7 } },
        },
      ],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createTryWithThrowInFinally(line = 1, column = 0): unknown {
  return {
    type: 'TryStatement',
    block: {
      type: 'BlockStatement',
      body: [],
    },
    handler: null,
    finalizer: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ThrowStatement',
          argument: { type: 'Identifier', name: 'e' },
          loc: { start: { line, column }, end: { line, column: column + 7 } },
        },
      ],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createTryWithBreakInFinally(line = 1, column = 0): unknown {
  return {
    type: 'TryStatement',
    block: {
      type: 'BlockStatement',
      body: [],
    },
    handler: null,
    finalizer: {
      type: 'BlockStatement',
      body: [
        {
          type: 'BreakStatement',
          label: null,
          loc: { start: { line, column }, end: { line, column: column + 5 } },
        },
      ],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createTryWithContinueInFinally(line = 1, column = 0): unknown {
  return {
    type: 'TryStatement',
    block: {
      type: 'BlockStatement',
      body: [],
    },
    handler: null,
    finalizer: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ContinueStatement',
          label: null,
          loc: { start: { line, column }, end: { line, column: column + 8 } },
        },
      ],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createTryWithSafeFinally(line = 1, column = 0): unknown {
  return {
    type: 'TryStatement',
    block: {
      type: 'BlockStatement',
      body: [],
    },
    handler: null,
    finalizer: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ExpressionStatement',
          expression: { type: 'Literal', value: 1 },
        },
      ],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createTryWithoutFinally(): unknown {
  return {
    type: 'TryStatement',
    block: {
      type: 'BlockStatement',
      body: [],
    },
    handler: {
      type: 'CatchClause',
      body: { type: 'BlockStatement', body: [] },
    },
    finalizer: null,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 30 },
    },
  }
}

function createNonTryStatement(): unknown {
  return {
    type: 'IfStatement',
    test: { type: 'Literal', value: true },
    consequent: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

describe('no-unsafe-finally rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnsafeFinallyRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUnsafeFinallyRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUnsafeFinallyRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnsafeFinallyRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention finally in description', () => {
      expect(noUnsafeFinallyRule.meta.docs?.description.toLowerCase()).toContain('finally')
    })
  })

  describe('create', () => {
    test('should return visitor with TryStatement method', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeFinallyRule.create(context)

      expect(visitor).toHaveProperty('TryStatement')
    })
  })

  describe('detecting unsafe control flow in finally', () => {
    test('should report return statement in finally', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithReturnInFinally())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('control flow')
      expect(reports[0].message).toContain('finally')
    })

    test('should report throw statement in finally', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithThrowInFinally())

      expect(reports.length).toBe(1)
    })

    test('should report break statement in finally', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithBreakInFinally())

      expect(reports.length).toBe(1)
    })

    test('should report continue statement in finally', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithContinueInFinally())

      expect(reports.length).toBe(1)
    })

    test('should not report safe finally block', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithSafeFinally())

      expect(reports.length).toBe(0)
    })

    test('should not report try without finally', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithoutFinally())

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeFinallyRule.create(context)

      visitor.TryStatement(createTryWithReturnInFinally(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeFinallyRule.create(context)

      expect(() => visitor.TryStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeFinallyRule.create(context)

      expect(() => visitor.TryStatement(undefined)).not.toThrow()
    })

    test('should handle non-TryStatement gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeFinallyRule.create(context)

      expect(() => visitor.TryStatement(createNonTryStatement())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without finalizer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeFinallyRule.create(context)

      const node = { type: 'TryStatement', block: { type: 'BlockStatement', body: [] } }

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeFinallyRule.create(context)

      const node = createTryWithReturnInFinally() as Record<string, unknown>
      delete node.loc
      const finalizer = node.finalizer as Record<string, unknown>
      const body = finalizer.body as unknown[]
      delete (body[0] as Record<string, unknown>).loc

      expect(() => visitor.TryStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })
})

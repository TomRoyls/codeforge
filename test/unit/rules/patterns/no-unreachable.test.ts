import { describe, test, expect, vi } from 'vitest'
import { noUnreachableRule } from '../../../../src/rules/patterns/no-unreachable.js'
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
    getSource: () => 'return; foo();',
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

function createBlockStatement(body: unknown[]): unknown {
  return {
    type: 'BlockStatement',
    body,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
  }
}

function createReturnStatement(line = 1, column = 0): unknown {
  return {
    type: 'ReturnStatement',
    argument: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 6 },
    },
  }
}

function createThrowStatement(line = 1, column = 0): unknown {
  return {
    type: 'ThrowStatement',
    argument: {
      type: 'NewExpression',
      callee: { type: 'Identifier', name: 'Error' },
      arguments: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

function createExpressionStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'foo' },
      arguments: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 6 },
    },
  }
}

function createNonBlockStatement(): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'Literal',
      value: 42,
    },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 2 },
    },
  }
}

describe('no-unreachable rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnreachableRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUnreachableRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUnreachableRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnreachableRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention unreachable in description', () => {
      expect(noUnreachableRule.meta.docs?.description.toLowerCase()).toContain('unreachable')
    })
  })

  describe('create', () => {
    test('should return visitor with BlockStatement method', () => {
      const { context } = createMockContext()
      const visitor = noUnreachableRule.create(context)

      expect(visitor).toHaveProperty('BlockStatement')
    })
  })

  describe('detecting unreachable code', () => {
    test('should report code after return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createReturnStatement(), createExpressionStatement()]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('unreachable')
    })

    test('should report code after throw statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createThrowStatement(), createExpressionStatement()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report when no unreachable code', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([createExpressionStatement(), createReturnStatement()]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report non-block statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createNonBlockStatement())

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnreachableRule.create(context)

      expect(() => visitor.BlockStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnreachableRule.create(context)

      expect(() => visitor.BlockStatement(undefined)).not.toThrow()
    })

    test('should handle empty body array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(createBlockStatement([]))

      expect(reports.length).toBe(0)
    })

    test('should handle node without body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnreachableRule.create(context)

      const node = { type: 'BlockStatement' }

      expect(() => visitor.BlockStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should stop after first unreachable code', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnreachableRule.create(context)

      visitor.BlockStatement(
        createBlockStatement([
          createReturnStatement(),
          createExpressionStatement(),
          createExpressionStatement(),
        ]),
      )

      expect(reports.length).toBe(1)
    })
  })
})

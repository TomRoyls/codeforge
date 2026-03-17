import { describe, test, expect, vi } from 'vitest'
import { noFallthroughRule } from '../../../../src/rules/patterns/no-fallthrough.js'
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
    getSource: () => 'switch(x) { case 1: foo(); case 2: bar(); }',
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

function createSwitchCase(consequent: unknown[], line = 1): unknown {
  return {
    type: 'SwitchCase',
    test: { type: 'Literal', value: 1 },
    consequent,
    loc: {
      start: { line, column: 0 },
      end: { line, column: 30 },
    },
  }
}

function createBreakStatement(line = 1, column = 0): unknown {
  return {
    type: 'BreakStatement',
    label: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
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

function createContinueStatement(line = 1, column = 0): unknown {
  return {
    type: 'ContinueStatement',
    label: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 8 },
    },
  }
}

function createExpressionStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'doSomething' },
      arguments: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createNonSwitchCase(): unknown {
  return {
    type: 'IfStatement',
    test: { type: 'Literal', value: true },
    consequent: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
  }
}

describe('no-fallthrough rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noFallthroughRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noFallthroughRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noFallthroughRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noFallthroughRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention fallthrough in description', () => {
      expect(noFallthroughRule.meta.docs?.description.toLowerCase()).toContain('fallthrough')
    })
  })

  describe('create', () => {
    test('should return visitor with SwitchCase method', () => {
      const { context } = createMockContext()
      const visitor = noFallthroughRule.create(context)

      expect(visitor).toHaveProperty('SwitchCase')
    })
  })

  describe('detecting fallthrough', () => {
    test('should report missing break statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchCase(createSwitchCase([createExpressionStatement()]))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('break')
    })

    test('should not report with break statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createBreakStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should not report with return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createReturnStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should not report with throw statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createThrowStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should not report with continue statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchCase(createSwitchCase([createExpressionStatement(), createContinueStatement()]))

      expect(reports.length).toBe(0)
    })

    test('should not report non-SwitchCase nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchCase(createNonSwitchCase())

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noFallthroughRule.create(context)

      expect(() => visitor.SwitchCase(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noFallthroughRule.create(context)

      expect(() => visitor.SwitchCase(undefined)).not.toThrow()
    })

    test('should handle empty consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchCase(createSwitchCase([]))

      expect(reports.length).toBe(0)
    })

    test('should handle node without consequent', () => {
      const { context, reports } = createMockContext()
      const visitor = noFallthroughRule.create(context)

      const node = {
        type: 'SwitchCase',
        test: { type: 'Literal', value: 1 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.SwitchCase(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle multiple statements without break', () => {
      const { context, reports } = createMockContext()
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchCase(
        createSwitchCase([createExpressionStatement(), createExpressionStatement()]),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle break not being last statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noFallthroughRule.create(context)

      visitor.SwitchCase(createSwitchCase([createBreakStatement(), createExpressionStatement()]))

      expect(reports.length).toBe(1)
    })
  })
})

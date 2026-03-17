import { describe, test, expect, vi } from 'vitest'
import { noCondAssignRule } from '../../../../src/rules/patterns/no-cond-assign.js'
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
    getSource: () => 'if (x = 1) {}',
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

function createIfWithAssignmentInTest(line = 1, column = 0): unknown {
  return {
    type: 'IfStatement',
    test: {
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'Identifier', name: 'x' },
      right: { type: 'Literal', value: 1 },
      loc: { start: { line, column }, end: { line, column: column + 5 } },
    },
    consequent: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createIfWithComparisonInTest(line = 1, column = 0): unknown {
  return {
    type: 'IfStatement',
    test: {
      type: 'BinaryExpression',
      operator: '===',
      left: { type: 'Identifier', name: 'x' },
      right: { type: 'Literal', value: 1 },
    },
    consequent: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createWhileWithAssignmentInTest(line = 1, column = 0): unknown {
  return {
    type: 'WhileStatement',
    test: {
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'Identifier', name: 'x' },
      right: { type: 'Literal', value: 1 },
      loc: { start: { line, column }, end: { line, column: column + 5 } },
    },
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createWhileWithComparisonInTest(line = 1, column = 0): unknown {
  return {
    type: 'WhileStatement',
    test: {
      type: 'BinaryExpression',
      operator: '<',
      left: { type: 'Identifier', name: 'x' },
      right: { type: 'Literal', value: 10 },
    },
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createNonIfOrWhile(): unknown {
  return {
    type: 'ForStatement',
    init: null,
    test: null,
    update: null,
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

describe('no-cond-assign rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noCondAssignRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noCondAssignRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noCondAssignRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noCondAssignRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention assignment in description', () => {
      expect(noCondAssignRule.meta.docs?.description.toLowerCase()).toContain('assignment')
    })
  })

  describe('create', () => {
    test('should return visitor with IfStatement method', () => {
      const { context } = createMockContext()
      const visitor = noCondAssignRule.create(context)

      expect(visitor).toHaveProperty('IfStatement')
    })

    test('should return visitor with WhileStatement method', () => {
      const { context } = createMockContext()
      const visitor = noCondAssignRule.create(context)

      expect(visitor).toHaveProperty('WhileStatement')
    })
  })

  describe('detecting assignment in conditionals', () => {
    test('should report assignment in if test', () => {
      const { context, reports } = createMockContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('assignment')
    })

    test('should not report comparison in if test', () => {
      const { context, reports } = createMockContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithComparisonInTest())

      expect(reports.length).toBe(0)
    })

    test('should report assignment in while test', () => {
      const { context, reports } = createMockContext()
      const visitor = noCondAssignRule.create(context)

      visitor.WhileStatement(createWhileWithAssignmentInTest())

      expect(reports.length).toBe(1)
    })

    test('should not report comparison in while test', () => {
      const { context, reports } = createMockContext()
      const visitor = noCondAssignRule.create(context)

      visitor.WhileStatement(createWhileWithComparisonInTest())

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully for IfStatement', () => {
      const { context } = createMockContext()
      const visitor = noCondAssignRule.create(context)

      expect(() => visitor.IfStatement(null)).not.toThrow()
    })

    test('should handle null node gracefully for WhileStatement', () => {
      const { context } = createMockContext()
      const visitor = noCondAssignRule.create(context)

      expect(() => visitor.WhileStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully for IfStatement', () => {
      const { context } = createMockContext()
      const visitor = noCondAssignRule.create(context)

      expect(() => visitor.IfStatement(undefined)).not.toThrow()
    })

    test('should handle undefined node gracefully for WhileStatement', () => {
      const { context } = createMockContext()
      const visitor = noCondAssignRule.create(context)

      expect(() => visitor.WhileStatement(undefined)).not.toThrow()
    })

    test('should handle non-IfStatement gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noCondAssignRule.create(context)

      expect(() => visitor.IfStatement(createNonIfOrWhile())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-WhileStatement gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noCondAssignRule.create(context)

      expect(() => visitor.WhileStatement(createNonIfOrWhile())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle if without test', () => {
      const { context, reports } = createMockContext()
      const visitor = noCondAssignRule.create(context)

      const node = { type: 'IfStatement', consequent: { type: 'BlockStatement', body: [] } }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noCondAssignRule.create(context)

      const node = createIfWithAssignmentInTest() as Record<string, unknown>
      delete (node.test as Record<string, unknown>).loc

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })
})

import { describe, test, expect, vi } from 'vitest'
import { forDirectionRule } from '../../../../src/rules/patterns/for-direction.js'
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
    getSource: () => 'for (let i = 0; i < 10; i--) {}',
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

function createForStatement(
  testOp: string,
  updateOp: string,
  counterOnRight = false,
  line = 1,
  column = 0,
): unknown {
  const left = { type: 'Identifier', name: 'i' }
  const right = { type: 'Literal', value: 10 }

  return {
    type: 'ForStatement',
    init: {
      type: 'VariableDeclaration',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: 'i' },
          init: { type: 'Literal', value: 0 },
        },
      ],
    },
    test: {
      type: 'BinaryExpression',
      operator: testOp,
      left: counterOnRight ? right : left,
      right: counterOnRight ? left : right,
    },
    update: {
      type: 'UpdateExpression',
      operator: updateOp,
      argument: { type: 'Identifier', name: 'i' },
      prefix: false,
    },
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createValidForStatement(line = 1, column = 0): unknown {
  return createForStatement('<', '++', false, line, column)
}

function createInvalidForStatement(line = 1, column = 0): unknown {
  return createForStatement('<', '--', false, line, column)
}

function createForStatementWithoutTest(): unknown {
  return {
    type: 'ForStatement',
    init: null,
    test: null,
    update: {
      type: 'UpdateExpression',
      operator: '++',
      argument: { type: 'Identifier', name: 'i' },
    },
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
  }
}

function createForStatementWithoutUpdate(): unknown {
  return {
    type: 'ForStatement',
    init: null,
    test: {
      type: 'BinaryExpression',
      operator: '<',
      left: { type: 'Identifier', name: 'i' },
      right: { type: 'Literal', value: 10 },
    },
    update: null,
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
  }
}

function createNonForStatement(): unknown {
  return {
    type: 'WhileStatement',
    test: { type: 'Literal', value: true },
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

describe('for-direction rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(forDirectionRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(forDirectionRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(forDirectionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(forDirectionRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention for loop in description', () => {
      expect(forDirectionRule.meta.docs?.description.toLowerCase()).toContain('for')
    })
  })

  describe('create', () => {
    test('should return visitor with ForStatement method', () => {
      const { context } = createMockContext()
      const visitor = forDirectionRule.create(context)

      expect(visitor).toHaveProperty('ForStatement')
    })
  })

  describe('detecting wrong direction', () => {
    test('should report decrement with < operator', () => {
      const { context, reports } = createMockContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('<', '--', false))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('wrong direction')
    })

    test('should report decrement with <= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('<=', '--', false))

      expect(reports.length).toBe(1)
    })

    test('should report increment with > operator', () => {
      const { context, reports } = createMockContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('>', '++', false))

      expect(reports.length).toBe(1)
    })

    test('should report increment with >= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('>=', '++', false))

      expect(reports.length).toBe(1)
    })

    test('should report counter on right with increment and <', () => {
      const { context, reports } = createMockContext()
      const visitor = forDirectionRule.create(context)

      // i < 10 with i++ is valid
      // 10 < i with i++ is invalid
      visitor.ForStatement(createForStatement('<', '++', true))

      expect(reports.length).toBe(1)
    })

    test('should not report valid increment with <', () => {
      const { context, reports } = createMockContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createValidForStatement())

      expect(reports.length).toBe(0)
    })

    test('should not report valid decrement with >', () => {
      const { context, reports } = createMockContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('>', '--', false))

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createInvalidForStatement(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = forDirectionRule.create(context)

      expect(() => visitor.ForStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = forDirectionRule.create(context)

      expect(() => visitor.ForStatement(undefined)).not.toThrow()
    })

    test('should handle non-ForStatement gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = forDirectionRule.create(context)

      expect(() => visitor.ForStatement(createNonForStatement())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle for without test', () => {
      const { context, reports } = createMockContext()
      const visitor = forDirectionRule.create(context)

      expect(() => visitor.ForStatement(createForStatementWithoutTest())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle for without update', () => {
      const { context, reports } = createMockContext()
      const visitor = forDirectionRule.create(context)

      expect(() => visitor.ForStatement(createForStatementWithoutUpdate())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = forDirectionRule.create(context)

      const node = createInvalidForStatement()
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })
})

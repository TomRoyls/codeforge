import { describe, test, expect, vi } from 'vitest'
import { noUnnecessaryConditionRule } from '../../../../src/rules/patterns/no-unnecessary-condition.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'if (true) { }',
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

function createIfStatement(testValue: unknown, line = 1, column = 0): unknown {
  return {
    type: 'IfStatement',
    test: testValue,
    consequent: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createConditionalExpression(testValue: unknown, line = 1, column = 0): unknown {
  return {
    type: 'ConditionalExpression',
    test: testValue,
    consequent: { type: 'Identifier', name: 'a' },
    alternate: { type: 'Identifier', name: 'b' },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createBooleanLiteral(value: boolean): unknown {
  return {
    type: 'BooleanLiteral',
    value,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createUnaryExpression(operator: string, argument: unknown): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument,
  }
}

function createLogicalExpression(operator: string, left: unknown, right: unknown): unknown {
  return {
    type: 'LogicalExpression',
    operator,
    left,
    right,
  }
}

describe('no-unnecessary-condition rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryConditionRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryConditionRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnnecessaryConditionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryConditionRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryConditionRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnnecessaryConditionRule.meta.fixable).toBeUndefined()
    })

    test('should mention unnecessary in description', () => {
      expect(noUnnecessaryConditionRule.meta.docs?.description.toLowerCase()).toContain(
        'unnecessary',
      )
    })
  })

  describe('detecting unnecessary conditions in if statements', () => {
    test('should report if with true literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(true)))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('truthy')
    })

    test('should report if with false literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createBooleanLiteral(false)))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('falsy')
    })

    test('should report if with null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createLiteral(null)))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('null')
    })

    test('should not report if with variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement({ type: 'Identifier', name: 'x' }))

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting unnecessary conditions in ternary expressions', () => {
    test('should report ternary with true literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(createConditionalExpression(createBooleanLiteral(true)))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('truthy')
    })

    test('should report ternary with false literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(createConditionalExpression(createBooleanLiteral(false)))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('falsy')
    })

    test('should not report ternary with variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.ConditionalExpression(createConditionalExpression({ type: 'Identifier', name: 'x' }))

      expect(reports.length).toBe(0)
    })
  })

  describe('detecting unnecessary negations', () => {
    test('should report !true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createUnaryExpression('!', createBooleanLiteral(true))))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('false')
    })

    test('should report !false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(createUnaryExpression('!', createBooleanLiteral(false))),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('true')
    })

    test('should report !null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(createIfStatement(createUnaryExpression('!', createLiteral(null))))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('true')
    })
  })

  describe('detecting unnecessary logical expressions', () => {
    test('should report true || x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('||', createBooleanLiteral(true), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('true')
    })

    test('should report false && x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      visitor.IfStatement(
        createIfStatement(
          createLogicalExpression('&&', createBooleanLiteral(false), {
            type: 'Identifier',
            name: 'x',
          }),
        ),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('false')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully in IfStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)
      expect(() => visitor.IfStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in IfStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)
      expect(() => visitor.IfStatement(undefined)).not.toThrow()
    })

    test('should handle null node gracefully in ConditionalExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)
      expect(() => visitor.ConditionalExpression(null)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      expect(() => visitor.IfStatement('string')).not.toThrow()
      expect(() => visitor.IfStatement(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      const node = createIfStatement(createBooleanLiteral(true))
      delete (node as Record<string, unknown>).loc
      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryConditionRule.create(context)

      const node = createIfStatement(createBooleanLiteral(true), 10, 5)
      visitor.IfStatement(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })
})

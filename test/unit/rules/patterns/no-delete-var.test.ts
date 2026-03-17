import { describe, test, expect, vi } from 'vitest'
import { noDeleteVarRule } from '../../../../src/rules/patterns/no-delete-var.js'
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
    getSource: () => 'delete variable',
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

function createDeleteExpressionWithIdentifier(line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: 'delete',
    argument: {
      type: 'Identifier',
      name: 'variable',
      loc: { start: { line, column: column + 7 }, end: { line, column: column + 15 } },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createDeleteExpressionWithMemberExpression(line = 1, column = 0): unknown {
  return {
    type: 'UnaryExpression',
    operator: 'delete',
    argument: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'obj' },
      property: { type: 'Identifier', name: 'prop' },
      loc: { start: { line, column: column + 7 }, end: { line, column: column + 15 } },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createUnaryExpressionWithDifferentOperator(
  operator: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'UnaryExpression',
    operator,
    argument: {
      type: 'Identifier',
      name: 'variable',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createNonUnaryExpression(): unknown {
  return {
    type: 'Identifier',
    name: 'variable',
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 8 },
    },
  }
}

describe('no-delete-var rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noDeleteVarRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noDeleteVarRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noDeleteVarRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noDeleteVarRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention deleting in description', () => {
      expect(noDeleteVarRule.meta.docs?.description.toLowerCase()).toContain('deleting')
    })

    test('should mention variables in description', () => {
      expect(noDeleteVarRule.meta.docs?.description.toLowerCase()).toContain('variables')
    })
  })

  describe('create', () => {
    test('should return visitor with UnaryExpression method', () => {
      const { context } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      expect(visitor).toHaveProperty('UnaryExpression')
    })

    test('should return visitor with function', () => {
      const { context } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      expect(typeof visitor.UnaryExpression).toBe('function')
    })
  })

  describe('valid delete operations', () => {
    test('should not report delete on member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithMemberExpression())

      expect(reports.length).toBe(0)
    })

    test('should not report delete on computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: 'prop' },
          computed: true,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report delete on nested member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'nested' },
          },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 25 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report delete on member with this', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid delete operations', () => {
    test('should report delete on identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('should not be deleted')
    })

    test('should report delete on variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'Identifier',
          name: 'myVariable',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on short identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report delete on underscore identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        argument: { type: 'Identifier', name: '_' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }

      visitor.UnaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createDeleteExpressionWithIdentifier(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      expect(() => visitor.UnaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-UnaryExpression node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      expect(() => visitor.UnaryExpression(createNonUnaryExpression())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle unary expression with different operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createUnaryExpressionWithDifferentOperator('typeof'))

      expect(reports.length).toBe(0)
    })

    test('should handle unary expression with void operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createUnaryExpressionWithDifferentOperator('void'))

      expect(reports.length).toBe(0)
    })

    test('should handle unary expression with not operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createUnaryExpressionWithDifferentOperator('!'))

      expect(reports.length).toBe(0)
    })

    test('should handle unary expression with plus operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createUnaryExpressionWithDifferentOperator('+'))

      expect(reports.length).toBe(0)
    })

    test('should handle unary expression with minus operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      visitor.UnaryExpression(createUnaryExpressionWithDifferentOperator('-'))

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      const node = createDeleteExpressionWithIdentifier()
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }
      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noDeleteVarRule.create(context)

      const node = {
        type: 'UnaryExpression',
        argument: { type: 'Identifier', name: 'var' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }
      expect(() => visitor.UnaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})

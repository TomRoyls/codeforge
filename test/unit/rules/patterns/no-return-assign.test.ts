import { describe, test, expect, vi } from 'vitest'
import { noReturnAssignRule } from '../../../../src/rules/patterns/no-return-assign.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'return x;',
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
    config: { rules: { 'no-return-assign': ['error', options] } },
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

function createReturnStatement(argument: unknown, lineNumber = 1, column = 0): unknown {
  return {
    type: 'ReturnStatement',
    argument: argument,
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: 10 },
    },
  }
}

function createAssignmentExpression(operator: string = '=', lineNumber = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: operator,
    left: { type: 'Identifier', name: 'a' },
    right: { type: 'Identifier', name: 'b' },
    loc: {
      start: { line: lineNumber, column },
      end: { line: lineNumber, column: 5 },
    },
  }
}

function createIdentifier(name: string = 'x'): unknown {
  return {
    type: 'Identifier',
    name: name,
  }
}

describe('no-return-assign rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noReturnAssignRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noReturnAssignRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noReturnAssignRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noReturnAssignRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noReturnAssignRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noReturnAssignRule.meta.fixable).toBeUndefined()
    })

    test('should mention return in description', () => {
      const desc = noReturnAssignRule.meta.docs?.description.toLowerCase()
      expect(desc).toContain('return')
    })

    test('should mention assignment in description', () => {
      const desc = noReturnAssignRule.meta.docs?.description.toLowerCase()
      expect(desc).toMatch(/assign/)
    })

    test('should have empty schema array', () => {
      expect(noReturnAssignRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with ReturnStatement method', () => {
      const { context } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      expect(visitor).toHaveProperty('ReturnStatement')
    })
  })

  describe('detecting return with assignment', () => {
    test('should report return with assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports.length).toBe(1)
    })

    test('should report correct message for return with assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports[0].message).toBe('Return statement should not contain assignment.')
    })

    test('should report return with += assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('+=')))

      expect(reports.length).toBe(1)
    })

    test('should report return with -= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('-=')))

      expect(reports.length).toBe(1)
    })

    test('should report return with *= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('*=')))

      expect(reports.length).toBe(1)
    })

    test('should report return with /= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('/=')))

      expect(reports.length).toBe(1)
    })

    test('should report return with %= assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('%=')))

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting regular return statements', () => {
    test('should not report return with identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('x')))

      expect(reports.length).toBe(0)
    })

    test('should not report return with literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const literal = {
        type: 'Literal',
        value: 42,
      }
      visitor.ReturnStatement(createReturnStatement(literal))

      expect(reports.length).toBe(0)
    })

    test('should not report return with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const returnNode = {
        type: 'ReturnStatement',
        argument: null,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.ReturnStatement(returnNode)

      expect(reports.length).toBe(0)
    })

    test('should not report return with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const returnNode = {
        type: 'ReturnStatement',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.ReturnStatement(returnNode)

      expect(reports.length).toBe(0)
    })

    test('should not report return with binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const binaryExpr = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }
      visitor.ReturnStatement(createReturnStatement(binaryExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report return with call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const callExpr = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
      }
      visitor.ReturnStatement(createReturnStatement(callExpr))

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple return statements', () => {
    test('should report multiple returns with assignments', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=', 1, 0)))
      visitor.ReturnStatement(createReturnStatement(createIdentifier('x')))
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('+=', 2, 0)))

      expect(reports.length).toBe(2)
    })

    test('should not report any returns without assignments', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createIdentifier('x')))
      visitor.ReturnStatement(createReturnStatement(createIdentifier('y')))
      visitor.ReturnStatement(createReturnStatement(createIdentifier('z')))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      expect(() => visitor.ReturnStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      expect(() => visitor.ReturnStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      expect(() => visitor.ReturnStatement('string')).not.toThrow()
      expect(() => visitor.ReturnStatement(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const node = {
        argument: createAssignmentExpression('='),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle ReturnStatement without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: createAssignmentExpression('='),
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty rule config', () => {
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
        getSource: () => 'return a = b;',
        getTokens: () => [],
        getComments: () => [],
        config: { rules: {} },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noReturnAssignRule.create(context)
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports.length).toBe(1)
    })

    test('should handle argument that is not an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      const node = {
        type: 'ReturnStatement',
        argument: 'string',
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }
      visitor.ReturnStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for return with assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('='), 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('='), 5, 10))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })
  })

  describe('message quality', () => {
    test('should mention return in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports[0].message).toContain('Return')
    })

    test('should mention assignment in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))

      expect(reports[0].message).toContain('assignment')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noReturnAssignRule.create(context)

      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('=')))
      visitor.ReturnStatement(createReturnStatement(createAssignmentExpression('+='), 2, 0))

      expect(reports[0].message).toBe('Return statement should not contain assignment.')
      expect(reports[1].message).toBe('Return statement should not contain assignment.')
    })
  })
})

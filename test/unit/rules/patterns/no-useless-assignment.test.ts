import { describe, test, expect, vi } from 'vitest'
import { noUselessAssignmentRule } from '../../../../src/rules/patterns/no-useless-assignment.js'
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
    getSource: () => 'x = 1; x = 1;',
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

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: column + name.length },
    },
  }
}

function createLiteral(value: unknown, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: column + String(value).length },
    },
  }
}

function createAssignmentExpression(
  left: unknown,
  right: unknown,
  operator = '=',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'AssignmentExpression',
    operator,
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

function createMemberExpression(object: unknown, property: unknown, line = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed: false,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-useless-assignment rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUselessAssignmentRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUselessAssignmentRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUselessAssignmentRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUselessAssignmentRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention assignment in description', () => {
      expect(noUselessAssignmentRule.meta.docs?.description.toLowerCase()).toContain('assignment')
    })
  })

  describe('create', () => {
    test('should return visitor with AssignmentExpression method', () => {
      const { context } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      expect(visitor).toHaveProperty('AssignmentExpression')
    })

    test('AssignmentExpression should be a function', () => {
      const { context } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      expect(typeof visitor.AssignmentExpression).toBe('function')
    })
  })

  describe('valid cases', () => {
    test('should not report assignment with different string values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('a')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('b')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with different number values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(2)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to different identifiers with same value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), createLiteral(1)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with non-literal right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createIdentifier('y')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createIdentifier('y')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with member expression right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))
      visitor.AssignmentExpression(createAssignmentExpression(createIdentifier('x'), memberExpr))

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with boolean values that differ', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(true)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(false)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with null and undefined values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(null)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(undefined)),
      )

      expect(reports.length).toBe(0)
    })

    test('should report assignment with same compound operator and value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '+='),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '+='),
      )

      expect(reports.length).toBe(1)
    })

    test('should report assignment with different compound operators and same value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '+='),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '-='),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report assignment to non-identifier left side', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      const memberExpr = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))
      visitor.AssignmentExpression(createAssignmentExpression(memberExpr, createLiteral(1)))
      visitor.AssignmentExpression(createAssignmentExpression(memberExpr, createLiteral(1)))

      expect(reports.length).toBe(0)
    })

    test('should not report first assignment to a variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with different literal types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('1')),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid cases', () => {
    test('should report redundant assignment with same string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('test')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('test')),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/redundant/i)
      expect(reports[0].message).toContain('x')
    })

    test('should report redundant assignment with same number value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(42)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(42)),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/redundant/i)
    })

    test('should report redundant assignment with same boolean value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(true)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(true)),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toMatch(/redundant/i)
    })

    test('should not report redundant assignment with same null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(null)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(null)),
      )

      expect(reports.length).toBe(0)
    })

    test('should report redundant assignment with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1), '=', 10, 5),
      )

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report each redundant assignment separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )

      expect(reports.length).toBe(2)
    })

    test('should report message containing variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('myVar'), createLiteral(1)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('myVar'), createLiteral(1)),
      )

      expect(reports[0].message).toContain('myVar')
    })
  })

  describe('edge cases', () => {
    test('should handle null AssignmentExpression node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined AssignmentExpression node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without left property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        right: createLiteral(1),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without right property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle left side that is not an identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Literal', value: 'x' },
        right: createLiteral(1),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle right side that is not a literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('x'),
        right: { type: 'Identifier', name: 'y' },
      }
      visitor.AssignmentExpression(node)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(1)),
      )
      const node = createAssignmentExpression(createIdentifier('x'), createLiteral(1))
      delete (node as Record<string, unknown>).loc
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle empty string as literal value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral('')),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle zero as literal value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(0)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(0)),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report redundant assignment with NaN values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(NaN)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(NaN)),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle negative zero as literal value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessAssignmentRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(-0)),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createLiteral(-0)),
      )

      expect(reports.length).toBe(1)
    })
  })
})

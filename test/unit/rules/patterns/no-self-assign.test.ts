import { describe, test, expect, vi } from 'vitest'
import { noSelfAssignRule } from '../../../../src/rules/patterns/no-self-assign.js'
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
    getSource: () => 'a = a',
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
      end: { line, column: name.length },
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
      end: { line, column: 10 },
    },
  }
}

function createAssignmentExpression(left: unknown, right: unknown, line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: 5 },
    },
  }
}

describe('no-self-assign rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noSelfAssignRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noSelfAssignRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noSelfAssignRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noSelfAssignRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention assignments in description', () => {
      expect(noSelfAssignRule.meta.docs?.description.toLowerCase()).toContain('assignment')
    })
  })

  describe('create', () => {
    test('should return visitor with AssignmentExpression method', () => {
      const { context } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      expect(visitor).toHaveProperty('AssignmentExpression')
    })

    test('AssignmentExpression should be a function', () => {
      const { context } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      expect(typeof visitor.AssignmentExpression).toBe('function')
    })
  })

  describe('valid cases', () => {
    test('should not report assignment to different identifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('a'), createIdentifier('b'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment of different member expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('x')),
        createMemberExpression(createIdentifier('obj'), createIdentifier('y')),
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to different objects', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createMemberExpression(createIdentifier('obj1'), createIdentifier('x')),
        createMemberExpression(createIdentifier('obj2'), createIdentifier('x')),
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment of identifier to member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createIdentifier('a'),
        createMemberExpression(createIdentifier('obj'), createIdentifier('x')),
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment of member expression to identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('x')),
        createIdentifier('a'),
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report assignment with compound operators when same operand', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '+=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report assignment with computed properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('x')),
        createMemberExpression(createIdentifier('obj'), { type: 'Literal', value: 'y' }),
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment of nested member expressions with different paths', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createMemberExpression(
          createMemberExpression(createIdentifier('obj'), createIdentifier('a')),
          createIdentifier('x'),
        ),
        createMemberExpression(
          createMemberExpression(createIdentifier('obj'), createIdentifier('b')),
          createIdentifier('x'),
        ),
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with different property values', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('x')),
        createMemberExpression(createIdentifier('obj'), createIdentifier('y')),
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid cases', () => {
    test('should report self assignment of identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('a'), createIdentifier('a'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Self assignment')
    })

    test('should report self assignment of member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('x')),
        createMemberExpression(createIdentifier('obj'), createIdentifier('x')),
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Self assignment')
    })

    test('should report self assignment of nested member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      const nested = createMemberExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('a')),
        createIdentifier('x'),
      )
      const node = createAssignmentExpression(nested, nested)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Self assignment')
    })

    test('should report self assignment with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createIdentifier('a', 5, 10),
        createIdentifier('a', 5, 10),
        5,
        10,
      )
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should not report self assignment of member with computed property (not supported)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      const computedMember = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: { type: 'Literal', value: 'x' },
        computed: true,
      }
      const node = createAssignmentExpression(computedMember, computedMember)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report self assignment for each occurrence', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createIdentifier('a')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createIdentifier('b')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('c'), createIdentifier('c')),
      )

      expect(reports.length).toBe(3)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without left property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        right: createIdentifier('a'),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without right property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('a'),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property (provides default location)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('a'), createIdentifier('a'))
      delete (node as Record<string, unknown>).loc

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle non-AssignmentExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'Identifier',
        name: 'a',
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })
})

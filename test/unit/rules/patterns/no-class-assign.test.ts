import { describe, test, expect, vi } from 'vitest'
import { noClassAssignRule } from '../../../../src/rules/patterns/no-class-assign.js'
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
    getSource: () => 'const MyClass = class {};',
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

function createAssignmentExpression(right: unknown, line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'Identifier',
      name: 'MyClass',
    },
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createClassExpression(line = 1, column = 0): unknown {
  return {
    type: 'ClassExpression',
    id: null,
    superClass: null,
    body: {
      type: 'ClassBody',
      body: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createIdentifierExpression(name = 'MyVar'): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteralExpression(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createCallExpression(callee: string): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: callee,
    },
    arguments: [],
  }
}

describe('no-class-assign rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noClassAssignRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noClassAssignRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noClassAssignRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noClassAssignRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention class in description', () => {
      expect(noClassAssignRule.meta.docs?.description.toLowerCase()).toContain('class')
    })

    test('should have empty schema array', () => {
      expect(noClassAssignRule.meta.schema).toEqual([])
    })

    test('should have undefined fixable', () => {
      expect(noClassAssignRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor with AssignmentExpression method', () => {
      const { context } = createMockContext()
      const visitor = noClassAssignRule.create(context)

      expect(visitor).toHaveProperty('AssignmentExpression')
      expect(typeof visitor.AssignmentExpression).toBe('function')
    })
  })

  describe('detecting class assignment violations', () => {
    test('should report assignment with ClassExpression on right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createClassExpression())
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('class')
    })

    test('should report correct location for class assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createClassExpression(), 10, 5)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report appropriate error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createClassExpression())
      visitor.AssignmentExpression(node)

      expect(reports[0].message).toBe('Reassigning class declaration is not allowed.')
    })
  })

  describe('not reporting non-class assignments', () => {
    test('should not report assignment with Identifier on right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifierExpression('MyVar'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with Literal on right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createLiteralExpression(42))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with CallExpression on right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(createCallExpression('createClass'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with object literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noClassAssignRule.create(context)

      const objectLiteral = {
        type: 'ObjectExpression',
        properties: [],
      }
      const node = createAssignmentExpression(objectLiteral)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noClassAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noClassAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
    })

    test('should handle assignment without right property', () => {
      const { context, reports } = createMockContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'Identifier',
          name: 'x',
        },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle assignment with null right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression(null)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'Identifier',
          name: 'x',
        },
        right: createClassExpression(),
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noClassAssignRule.create(context)

      expect(() => visitor.AssignmentExpression('invalid')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-string type', () => {
      const { context, reports } = createMockContext()
      const visitor = noClassAssignRule.create(context)

      const node = {
        type: null,
        operator: '=',
        left: {
          type: 'Identifier',
          name: 'x',
        },
        right: createClassExpression(),
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('type safety', () => {
    test('should not crash with malformed right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({ type: 'InvalidType' })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle right side with undefined type', () => {
      const { context, reports } = createMockContext()
      const visitor = noClassAssignRule.create(context)

      const node = createAssignmentExpression({})
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should detect ClassDeclaration vs ClassExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noClassAssignRule.create(context)

      const classDeclaration = {
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'MyClass' },
      }
      const node = createAssignmentExpression(classDeclaration)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })
})

import { describe, test, expect, vi } from 'vitest'
import { noConstAssignRule } from '../../../../src/rules/patterns/no-const-assign.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = 1; x = 2;',
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

function createVariableDeclaration(
  kind: string,
  declarations: unknown[],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'VariableDeclaration',
    kind,
    declarations,
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createVariableDeclarator(id: unknown, init: unknown | undefined = undefined): unknown {
  return {
    type: 'VariableDeclarator',
    id,
    init,
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
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

function createAssignmentExpression(left: unknown, right: unknown, line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('no-const-assign rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noConstAssignRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noConstAssignRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noConstAssignRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noConstAssignRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noConstAssignRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noConstAssignRule.meta.fixable).toBe('code')
    })

    test('should mention const in description', () => {
      expect(noConstAssignRule.meta.docs?.description.toLowerCase()).toContain('const')
    })

    test('should mention reassignment in description', () => {
      expect(noConstAssignRule.meta.docs?.description.toLowerCase()).toContain('reassign')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      expect(visitor).toHaveProperty('VariableDeclaration')
      expect(visitor).toHaveProperty('AssignmentExpression')
    })
  })

  describe('const variable tracking', () => {
    test('should track const variables', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      const constDecl = createVariableDeclaration('const', [
        createVariableDeclarator(createIdentifier('x')),
      ])

      visitor.VariableDeclaration(constDecl)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should not track let variables', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      const letDecl = createVariableDeclaration('let', [
        createVariableDeclarator(createIdentifier('x')),
      ])

      visitor.VariableDeclaration(letDecl)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should not track var variables', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      const varDecl = createVariableDeclaration('var', [
        createVariableDeclarator(createIdentifier('x')),
      ])

      visitor.VariableDeclaration(varDecl)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should track multiple const variables', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      const constDecl = createVariableDeclaration('const', [
        createVariableDeclarator(createIdentifier('x')),
        createVariableDeclarator(createIdentifier('y')),
        createVariableDeclarator(createIdentifier('z')),
      ])

      visitor.VariableDeclaration(constDecl)
      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })
  })

  describe('reporting const reassignment', () => {
    test('should report assignment to const variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
      expect(reports[0].message).toContain('const')
    })

    test('should report with correct message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('myVar'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('myVar'), { type: 'Literal', value: 42 }),
      )

      expect(reports[0].message).toBe("Unexpected assignment to const variable 'myVar'.")
    })

    test('should not report assignment to let variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('let', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to var variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('var', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to undeclared variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('undeclared'), { type: 'Literal', value: 2 }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report property assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('obj'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
          },
          { type: 'Literal', value: 2 },
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should report multiple const reassignments', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('const', [
          createVariableDeclarator(createIdentifier('x')),
          createVariableDeclarator(createIdentifier('y')),
        ]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), { type: 'Literal', value: 3 }),
      )

      expect(reports.length).toBe(2)
    })

    test('should report assignment to const with underscores', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('const', [
          createVariableDeclarator(createIdentifier('my_const_var')),
        ]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('my_const_var'), { type: 'Literal', value: 2 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('my_const_var')
    })

    test('should report assignment to const with dollar signs', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('$var'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('$var'), { type: 'Literal', value: 2 }),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$var')
    })
  })

  describe('edge cases', () => {
    test('should handle null node in VariableDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      expect(() => visitor.VariableDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node in VariableDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      expect(() => visitor.VariableDeclaration(undefined)).not.toThrow()
    })

    test('should handle null node in AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle undefined node in AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node in VariableDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      expect(() => visitor.VariableDeclaration('string')).not.toThrow()
      expect(() => visitor.VariableDeclaration(123)).not.toThrow()
    })

    test('should handle non-object node in AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      expect(() => visitor.AssignmentExpression('string')).not.toThrow()
      expect(() => visitor.AssignmentExpression(123)).not.toThrow()
    })

    test('should handle node without loc in VariableDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' } }],
      }

      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
    })

    test('should handle node without loc in AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty declarations array', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [],
      }

      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
    })

    test('should handle declarations without id', () => {
      const { context } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      const node = {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [{ type: 'VariableDeclarator' }],
      }

      expect(() => visitor.VariableDeclaration(node)).not.toThrow()
    })

    test('should handle assignment without identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Literal', value: 2 },
      }

      expect(() => visitor.AssignmentExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(
          createIdentifier('x', 10, 5),
          { type: 'Literal', value: 2 },
          10,
          5,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
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
        getSource: () => 'const x = 1; x = 2;',
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

      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      expect(() =>
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle assignment before declaration order', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )
      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should include const in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )

      expect(reports[0].message.toLowerCase()).toContain('const')
    })

    test('should include variable name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('testVar'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('testVar'), { type: 'Literal', value: 2 }),
      )

      expect(reports[0].message).toContain('testVar')
    })

    test('should use word unexpected in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )

      expect(reports[0].message.toLowerCase()).toContain('unexpected')
    })

    test('should use word assignment in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), { type: 'Literal', value: 2 }),
      )

      expect(reports[0].message.toLowerCase()).toContain('assignment')
    })
  })

  describe('loc edge cases', () => {
    test('should handle loc with non-number line in assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column in assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 'not-a-number' as unknown as number },
        },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with undefined start in assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end in assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object in assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noConstAssignRule.create(context)

      visitor.VariableDeclaration(
        createVariableDeclaration('const', [createVariableDeclarator(createIdentifier('x'))]),
      )

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
        loc: {},
      }

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })
})

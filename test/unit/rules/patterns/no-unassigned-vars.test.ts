import { describe, test, expect, vi } from 'vitest'
import { noUnassignedVarsRule } from '../../../../src/rules/patterns/no-unassigned-vars.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'let x;',
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

function createVariableDeclarator(id: unknown, init: unknown, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclarator',
    id,
    init,
    loc: {
      start: { line, column },
      end: { line, column: 10 },
    },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

describe('no-unassigned-vars rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnassignedVarsRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUnassignedVarsRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUnassignedVarsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnassignedVarsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnassignedVarsRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnassignedVarsRule.meta.fixable).toBeUndefined()
    })

    test('should mention variable in description', () => {
      expect(noUnassignedVarsRule.meta.docs?.description.toLowerCase()).toContain('variable')
    })

    test('should mention assigned in description', () => {
      expect(noUnassignedVarsRule.meta.docs?.description.toLowerCase()).toContain('assigned')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      expect(visitor).toHaveProperty('VariableDeclarator')
    })
  })

  describe('valid variables (with init)', () => {
    test('should not report variable with literal init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), createLiteral(5)))

      expect(reports.length).toBe(0)
    })

    test('should not report variable with number init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), createLiteral(42)))

      expect(reports.length).toBe(0)
    })

    test('should not report variable with string init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createLiteral('hello')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with boolean init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createLiteral(true)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with null init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createLiteral(null)),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with object init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), {
          type: 'ObjectExpression',
          properties: [],
        }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with array init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), { type: 'ArrayExpression', elements: [] }),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with identifier init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createIdentifier('y')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report variable with 0 init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), createLiteral(0)))

      expect(reports.length).toBe(0)
    })

    test('should not report variable with empty string init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), createLiteral('')))

      expect(reports.length).toBe(0)
    })

    test('should not report variable with false init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(
        createVariableDeclarator(createIdentifier('x'), createLiteral(false)),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid variables (without init)', () => {
    test('should report variable with null init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
      expect(reports[0].message.toLowerCase()).toContain('never assigned')
    })

    test('should report variable with undefined init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), undefined))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('should report variable without init property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('should include variable name in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('myVariable'), null))

      expect(reports[0].message).toContain('myVariable')
    })

    test('should report for multiple unassigned variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('y'), null))
      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('z'), null))

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('x')
      expect(reports[1].message).toContain('y')
      expect(reports[2].message).toContain('z')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      expect(() => visitor.VariableDeclarator('string')).not.toThrow()
      expect(() => visitor.VariableDeclarator(123)).not.toThrow()
    })

    test('should handle node without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        id: createIdentifier('x'),
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: createIdentifier('x'),
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without id', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null id', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: null,
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle id with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Literal', value: 'x' },
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle id without name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier' },
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle id with undefined name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: undefined },
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle id with null name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: null },
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle id with empty string name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier(''), null))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('never assigned')
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

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
        getSource: () => 'let x;',
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

      const visitor = noUnassignedVarsRule.create(context)

      expect(() =>
        visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null)),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention variable in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports[0].message.toLowerCase()).toContain('variable')
    })

    test('should mention never assigned in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports[0].message.toLowerCase()).toContain('never assigned')
    })

    test('should mention value in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('x'), null))

      expect(reports[0].message.toLowerCase()).toContain('value')
    })

    test('should format error message with variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator(createIdentifier('myVar'), null))

      expect(reports[0].message).toMatch(/myVar.*never assigned/)
    })
  })

  describe('loc edge cases', () => {
    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: null,
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: null,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 'not-a-number' as unknown as number },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: null,
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: null,
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnassignedVarsRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: null,
        loc: {},
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })
  })
})

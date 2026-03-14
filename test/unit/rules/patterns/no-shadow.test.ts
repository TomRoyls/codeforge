import { describe, test, expect, vi } from 'vitest'
import { noShadowRule } from '../../../../src/rules/patterns/no-shadow.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'let x = 1;',
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

function createVariableDeclarator(name: string, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclarator',
    id: {
      type: 'Identifier',
      name,
    },
    init: null,
    loc: {
      start: { line, column },
      end: { line, column: name.length + 5 },
    },
  }
}

function createRegularIdentifier(line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name: 'value',
    loc: {
      start: { line, column },
      end: { line, column: 10 },
    },
  }
}

function createMemberExpression(line = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object: {
      type: 'Identifier',
      name: 'obj',
    },
    property: {
      type: 'Identifier',
      name: 'prop',
    },
    loc: {
      start: { line, column },
      end: { line, column: 15 },
    },
  }
}

describe('no-shadow rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noShadowRule.meta.type).toBe('problem')
    })

    test('should have warning severity', () => {
      expect(noShadowRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noShadowRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noShadowRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noShadowRule.meta.schema).toBeDefined()
    })

    test('should not be auto-fixable (renaming shadowed vars is unsafe)', () => {
      expect(noShadowRule.meta.fixable).toBeUndefined()
    })

    test('should mention shadow in description', () => {
      expect(noShadowRule.meta.docs?.description.toLowerCase()).toContain('shadow')
    })

    test('should have empty schema array', () => {
      expect(noShadowRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noShadowRule.create(context)

      expect(visitor).toHaveProperty('VariableDeclarator')
    })
  })

  describe('detecting variable shadowing', () => {
    test('should report shadowed variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
      expect(reports[0].message).toContain('already declared')
    })

    test('should report with correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('myVar', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('myVar', 2, 0))

      expect(reports[0].message).toBe("Variable 'myVar' is already declared in an outer scope.")
    })
  })

  describe('allowing new variables', () => {
    test('should not report unique variable names', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('y', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('z', 3, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report non-VariableDeclarator nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createRegularIdentifier())
      visitor.VariableDeclarator(createMemberExpression())

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention variable name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('testVar', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('testVar', 2, 0))

      expect(reports[0].message).toContain('testVar')
    })

    test('should mention outer scope in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))

      expect(reports[0].message).toContain('outer scope')
    })

    test('should use single quotes around variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('myVar', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('myVar', 2, 0))

      expect(reports[0].message).toContain("'myVar'")
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noShadowRule.create(context)

      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noShadowRule.create(context)

      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noShadowRule.create(context)

      expect(() => visitor.VariableDeclarator('string')).not.toThrow()
      expect(() => visitor.VariableDeclarator(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
        },
      }

      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without id', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with non-Identifier id', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'obj',
          },
          property: {
            type: 'Identifier',
            name: 'prop',
          },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with non-VariableDeclarator type', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'Identifier',
        name: 'value',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))

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
        getSource: () => 'let x = 1;',
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

      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
        },
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle variable with non-string name', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 123,
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle missing name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple shadowed variables', () => {
    test('should report multiple shadowed variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('y', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('z', 4, 0))
      visitor.VariableDeclarator(createVariableDeclarator('y', 5, 0))

      expect(reports.length).toBe(2)
    })

    test('should report shadowing but not unique variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('x', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('y', 3, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('additional scenarios', () => {
    test('should handle multiple declarations of same name', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      const node = createVariableDeclarator('x')

      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(2)
    })

    test('should handle variables with special characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('_private', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('$global', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('_private', 3, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_private')
    })

    test('should handle case sensitivity', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('myVar', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('myvar', 2, 0))
      visitor.VariableDeclarator(createVariableDeclarator('MYVAR', 3, 0))
      visitor.VariableDeclarator(createVariableDeclarator('MyVar', 4, 0))

      expect(reports.length).toBe(0)
    })
  })

  describe('loc edge cases', () => {
    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
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
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
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
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: {
          end: { line: 1, column: 10 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        loc: {},
      }

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
    })
  })
})

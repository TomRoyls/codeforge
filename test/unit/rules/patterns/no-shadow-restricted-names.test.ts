import { describe, test, expect, vi } from 'vitest'
import { noShadowRestrictedNamesRule } from '../../../../src/rules/patterns/no-shadow-restricted-names.js'
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
    getSource: () => 'let undefined = 5',
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

function createVariableDeclarator(idName: string, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclarator',
    id: {
      type: 'Identifier',
      name: idName,
    },
    init: null,
    loc: {
      start: { line, column },
      end: { line, column: idName.length + 2 },
    },
  }
}

function createFunctionDeclaration(idName: string | null, line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: idName
      ? {
          type: 'Identifier',
          name: idName,
        }
      : null,
    params: [],
    body: {
      type: 'BlockStatement',
      body: [],
    },
    loc: {
      start: { line, column },
      end: { line, column: idName ? idName.length + 10 : 10 },
    },
  }
}

describe('no-shadow-restricted-names rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noShadowRestrictedNamesRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noShadowRestrictedNamesRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noShadowRestrictedNamesRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noShadowRestrictedNamesRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention shadowing in description', () => {
      expect(noShadowRestrictedNamesRule.meta.docs?.description.toLowerCase()).toContain(
        'shadowing',
      )
    })
  })

  describe('create', () => {
    test('should return visitor with VariableDeclarator method', () => {
      const { context } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      expect(visitor).toHaveProperty('VariableDeclarator')
    })

    test('should return visitor with FunctionDeclaration method', () => {
      const { context } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
    })

    test('VariableDeclarator should be a function', () => {
      const { context } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      expect(typeof visitor.VariableDeclarator).toBe('function')
    })

    test('FunctionDeclaration should be a function', () => {
      const { context } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })
  })

  describe('valid cases', () => {
    test('should not report variable declaration with regular name', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createVariableDeclarator('myVar')
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with regular name', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createFunctionDeclaration('myFunc')
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration with camelCase name', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createVariableDeclarator('myVariableName')
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function declaration with PascalCase name', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createFunctionDeclaration('MyFunction')
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration with similar but non-restricted name', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createVariableDeclarator('undefinedVar')
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration with lowercase "undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createVariableDeclarator('undefinedvar')
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration with "Undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createVariableDeclarator('Undefined')
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration with similar "NaN" variant', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createVariableDeclarator('nan')
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should not report function declaration without id', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createFunctionDeclaration(null)
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should not report variable declaration with regular underscore name', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createVariableDeclarator('_undefined')
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid cases', () => {
    test('should report variable declaration with "undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createVariableDeclarator('undefined')
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('undefined')
      expect(reports[0].message).toContain('Shadowing')
    })

    test('should report variable declaration with "NaN"', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createVariableDeclarator('NaN')
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('NaN')
      expect(reports[0].message).toContain('Shadowing')
    })

    test('should report variable declaration with "Infinity"', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createVariableDeclarator('Infinity')
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Infinity')
      expect(reports[0].message).toContain('Shadowing')
    })

    test('should report variable declaration with "eval"', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createVariableDeclarator('eval')
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('eval')
      expect(reports[0].message).toContain('Shadowing')
    })

    test('should report variable declaration with "arguments"', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createVariableDeclarator('arguments')
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('arguments')
      expect(reports[0].message).toContain('Shadowing')
    })

    test('should report function declaration with "undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createFunctionDeclaration('undefined')
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('undefined')
      expect(reports[0].message).toContain('Shadowing')
    })

    test('should report function declaration with "NaN"', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createFunctionDeclaration('NaN')
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('NaN')
      expect(reports[0].message).toContain('Shadowing')
    })

    test('should report function declaration with "Infinity"', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createFunctionDeclaration('Infinity')
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Infinity')
      expect(reports[0].message).toContain('Shadowing')
    })

    test('should report function declaration with "eval"', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createFunctionDeclaration('eval')
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('eval')
      expect(reports[0].message).toContain('Shadowing')
    })

    test('should report function declaration with "arguments"', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createFunctionDeclaration('arguments')
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('arguments')
      expect(reports[0].message).toContain('Shadowing')
    })

    test('should report each occurrence of restricted name', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('undefined'))
      visitor.VariableDeclarator(createVariableDeclarator('NaN'))
      visitor.VariableDeclarator(createVariableDeclarator('Infinity'))
      visitor.FunctionDeclaration(createFunctionDeclaration('eval'))
      visitor.FunctionDeclaration(createFunctionDeclaration('arguments'))

      expect(reports.length).toBe(5)
    })

    test('should report variable declaration with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createVariableDeclarator('undefined', 5, 10)
      visitor.VariableDeclarator(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report function declaration with correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createFunctionDeclaration('NaN', 3, 8)
      visitor.FunctionDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle null node in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle variable declarator without id', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        init: null,
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle variable declarator without identifier id', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Literal',
          value: 'x',
        },
        init: null,
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle function declaration without id', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [],
        body: {
          type: 'BlockStatement',
          body: [],
        },
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle function declaration with non-identifier id', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: {
          type: 'Literal',
          value: 'myFunc',
        },
        params: [],
        body: {
          type: 'BlockStatement',
          body: [],
        },
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc for VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createVariableDeclarator('undefined')
      delete (node as Record<string, unknown>).loc

      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeUndefined()
    })

    test('should handle node without loc for FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = createFunctionDeclaration('NaN')
      delete (node as Record<string, unknown>).loc

      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeUndefined()
    })

    test('should handle non-VariableDeclarator node', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = {
        type: 'Identifier',
        name: 'x',
      }
      visitor.VariableDeclarator(node)

      expect(reports.length).toBe(0)
    })

    test('should handle non-FunctionDeclaration node', () => {
      const { context, reports } = createMockContext()
      const visitor = noShadowRestrictedNamesRule.create(context)

      const node = {
        type: 'Identifier',
        name: 'x',
      }
      visitor.FunctionDeclaration(node)

      expect(reports.length).toBe(0)
    })
  })
})

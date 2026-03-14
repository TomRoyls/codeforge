import { describe, test, expect, vi } from 'vitest'
import { noUnusedVarsRule } from '../../../../src/rules/patterns/no-unused-vars.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = 1;',
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

function createProgram(): unknown {
  return {
    type: 'Program',
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 1 },
    },
  }
}

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name: name,
    loc: {
      start: { line, column },
      end: { line, column: column + name.length },
    },
  }
}

function createVariableDeclarator(name: string, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclarator',
    id: createIdentifier(name, line, column),
    init: { type: 'Literal', value: 1 },
    parent: {
      kind: 'const',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + name.length + 5 },
    },
  }
}

function createFunctionDeclaration(name: string, params: string[], line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: createIdentifier(name, line, column),
    params: params.map((p, i) => createIdentifier(p, line + 1, column + i * 5)),
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line: line + 2, column: column + 20 },
    },
  }
}

function createFunctionExpression(params: string[], line = 1, column = 0): unknown {
  return {
    type: 'FunctionExpression',
    id: null,
    params: params.map((p, i) => createIdentifier(p, line, column + i * 5)),
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line: line + 1, column: column + 20 },
    },
  }
}

function createArrowFunctionExpression(params: string[], line = 1, column = 0): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: params.map((p, i) => createIdentifier(p, line, column + i * 5)),
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line: line + 1, column: column + 20 },
    },
  }
}

describe('no-unused-vars rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUnusedVarsRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noUnusedVarsRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnusedVarsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have variables category', () => {
      expect(noUnusedVarsRule.meta.docs?.category).toBe('variables')
    })

    test('should have schema defined', () => {
      expect(noUnusedVarsRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUnusedVarsRule.meta.fixable).toBeUndefined()
    })

    test('should mention unused variables in description', () => {
      expect(noUnusedVarsRule.meta.docs?.description.toLowerCase()).toContain('unused')
    })

    test('should mention variables in description', () => {
      expect(noUnusedVarsRule.meta.docs?.description.toLowerCase()).toContain('variables')
    })

    test('should have empty schema array', () => {
      expect(noUnusedVarsRule.meta.schema).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with Program method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      expect(visitor).toHaveProperty('Program')
    })

    test('should return visitor object with Program:exit method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      expect(visitor).toHaveProperty('Program:exit')
    })

    test('should return visitor object with FunctionDeclaration method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration')
    })

    test('should return visitor object with FunctionDeclaration:exit method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      expect(visitor).toHaveProperty('FunctionDeclaration:exit')
    })

    test('should return visitor object with FunctionExpression method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      expect(visitor).toHaveProperty('FunctionExpression')
    })

    test('should return visitor object with FunctionExpression:exit method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      expect(visitor).toHaveProperty('FunctionExpression:exit')
    })

    test('should return visitor object with ArrowFunctionExpression method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      expect(visitor).toHaveProperty('ArrowFunctionExpression')
    })

    test('should return visitor object with ArrowFunctionExpression:exit method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      expect(visitor).toHaveProperty('ArrowFunctionExpression:exit')
    })

    test('should return visitor object with VariableDeclarator method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      expect(visitor).toHaveProperty('VariableDeclarator')
    })

    test('should return visitor object with Identifier method', () => {
      const { context } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      expect(visitor).toHaveProperty('Identifier')
    })
  })

  describe('detecting unused variables', () => {
    test('should report when variable is declared but never used', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should not report when variable is declared and used', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.Identifier(createIdentifier('x'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should report with correct message for unused variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('myVar'))
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toBe("'myVar' is declared but never used.")
    })

    test('should not report when multiple variables are all used', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('y'))
      visitor.VariableDeclarator(createVariableDeclarator('z'))
      visitor.Identifier(createIdentifier('x'))
      visitor.Identifier(createIdentifier('y'))
      visitor.Identifier(createIdentifier('z'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should report only unused variables when some are used', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('y'))
      visitor.VariableDeclarator(createVariableDeclarator('z'))
      visitor.Identifier(createIdentifier('x'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('y')
      expect(reports[1].message).toContain('z')
    })

    test('should report multiple unused variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('y'))
      visitor.VariableDeclarator(createVariableDeclarator('z'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(3)
    })

    test('should handle underscore-prefixed variables by not reporting', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('_unused'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle multiple underscore-prefixed variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('_x'))
      visitor.VariableDeclarator(createVariableDeclarator('_y'))
      visitor.VariableDeclarator(createVariableDeclarator('_z'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should report variables without underscore prefix even with underscore-prefixed ones', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('_unused'))
      visitor.VariableDeclarator(createVariableDeclarator('unused'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unused')
    })

    test('should handle function declaration name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('unusedFunc', []))
      visitor.Identifier(createIdentifier('unusedFunc'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report used function declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('myFunc', []))
      visitor.Identifier(createIdentifier('myFunc'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should report unused function parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('myFunc', ['a', 'b']))
      visitor.Identifier(createIdentifier('myFunc'))
      visitor.Identifier(createIdentifier('a'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('b')
    })

    test('should not report used function parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('myFunc', ['a', 'b']))
      visitor.Identifier(createIdentifier('myFunc'))
      visitor.Identifier(createIdentifier('a'))
      visitor.Identifier(createIdentifier('b'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle underscore-prefixed function parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('myFunc', ['_a', '_b']))
      visitor.Identifier(createIdentifier('myFunc'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should report unused arrow function parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(['a', 'b']))
      visitor.Identifier(createIdentifier('a'))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('b')
    })

    test('should not report used arrow function parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(['a', 'b']))
      visitor.Identifier(createIdentifier('a'))
      visitor.Identifier(createIdentifier('b'))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle underscore-prefixed arrow function parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(['_a', '_b']))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should report unused function expression parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionExpression(createFunctionExpression(['a', 'b']))
      visitor.Identifier(createIdentifier('a'))
      visitor['FunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('b')
    })

    test('should not report used function expression parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionExpression(createFunctionExpression(['a', 'b']))
      visitor.Identifier(createIdentifier('a'))
      visitor.Identifier(createIdentifier('b'))
      visitor['FunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle multiple scopes with variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('outer'))
      visitor.FunctionDeclaration(createFunctionDeclaration('myFunc', ['param']))
      visitor.Identifier(createIdentifier('outer'))
      visitor.Identifier(createIdentifier('myFunc'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('param')
    })

    test('should allow variable use in parent scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.FunctionDeclaration(createFunctionDeclaration('myFunc', []))
      visitor.Identifier(createIdentifier('x'))
      visitor.Identifier(createIdentifier('myFunc'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should track variable usage across different scopes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression([]))
      visitor.Identifier(createIdentifier('x'))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should report correct variable when multiple are declared', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('alpha'))
      visitor.VariableDeclarator(createVariableDeclarator('beta'))
      visitor.VariableDeclarator(createVariableDeclarator('gamma'))
      visitor.Identifier(createIdentifier('beta'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('alpha')
      expect(reports[1].message).toContain('gamma')
    })
  })

  describe('edge cases', () => {
    test('should handle null node in VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      expect(() => visitor.VariableDeclarator('string')).not.toThrow()
      expect(() => visitor.VariableDeclarator(123)).not.toThrow()
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
        },
        parent: { kind: 'const' },
      }
      visitor.VariableDeclarator(node)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle null node in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      expect(() => visitor.FunctionDeclaration('string')).not.toThrow()
      expect(() => visitor.FunctionDeclaration(123)).not.toThrow()
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle null node in FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      expect(() => visitor.FunctionExpression(null)).not.toThrow()
      visitor['FunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      expect(() => visitor.FunctionExpression(undefined)).not.toThrow()
      visitor['FunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      expect(() => visitor.FunctionExpression('string')).not.toThrow()
      expect(() => visitor.FunctionExpression(123)).not.toThrow()
      visitor['FunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle null node in ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      expect(() => visitor.ArrowFunctionExpression(null)).not.toThrow()
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node in ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      expect(() => visitor.ArrowFunctionExpression(undefined)).not.toThrow()
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node in ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      expect(() => visitor.ArrowFunctionExpression('string')).not.toThrow()
      expect(() => visitor.ArrowFunctionExpression(123)).not.toThrow()
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor['Program:exit']?.(undefined)

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
        getSource: () => 'const x = 1;',
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

      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should handle variable without parent kind', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('x'),
        init: { type: 'Literal', value: 1 },
      }
      visitor.VariableDeclarator(node)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should handle function declaration without id', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      const node = {
        type: 'FunctionDeclaration',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.FunctionDeclaration(node)
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle function declaration without params array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      const node = {
        type: 'FunctionDeclaration',
        id: createIdentifier('myFunc'),
        params: null,
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.FunctionDeclaration(node)
      visitor.Identifier(createIdentifier('myFunc'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle non-array params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      const node = {
        type: 'FunctionDeclaration',
        id: createIdentifier('myFunc'),
        params: 'not an array',
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.FunctionDeclaration(node)
      visitor.Identifier(createIdentifier('myFunc'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle null identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      expect(() => visitor.Identifier(null)).not.toThrow()
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle undefined identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      expect(() => visitor.Identifier(undefined)).not.toThrow()
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle non-object identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      expect(() => visitor.Identifier('string')).not.toThrow()
      expect(() => visitor.Identifier(123)).not.toThrow()
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle identifier without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      const node = {
        name: 'x',
      }
      expect(() => visitor.Identifier(node)).not.toThrow()
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle identifier with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      const node = {
        type: 'Literal',
        value: 'x',
      }
      expect(() => visitor.Identifier(node)).not.toThrow()
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should report correct location for variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x', 10, 5))
      visitor['Program:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('message quality', () => {
    test('should mention variable name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('testVar'))
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toContain('testVar')
    })

    test('should mention declared in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toContain('declared')
    })

    test('should mention never used in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toContain('never used')
    })

    test('should use single quotes around variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toContain("'x'")
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('var1'))
      visitor.FunctionDeclaration(createFunctionDeclaration('func1', ['param1']))
      visitor.Identifier(createIdentifier('func1'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toMatch(/^'.*' is declared but never used\.$/)
      expect(reports[1].message).toMatch(/^'.*' is declared but never used\.$/)
    })
  })
})

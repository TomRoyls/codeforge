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
  // ============================================================
  // META (20 tests)
  // ============================================================
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

    test('should have a docs url property', () => {
      expect(noUnusedVarsRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs url as a string', () => {
      expect(typeof noUnusedVarsRule.meta.docs?.url).toBe('string')
    })

    test('should have docs url containing codeforge', () => {
      expect(noUnusedVarsRule.meta.docs?.url).toContain('codeforge')
    })

    test('should have meta as a plain object', () => {
      expect(typeof noUnusedVarsRule.meta).toBe('object')
      expect(noUnusedVarsRule.meta).not.toBeNull()
    })

    test('should have type as a string', () => {
      expect(typeof noUnusedVarsRule.meta.type).toBe('string')
    })

    test('should have severity as a string', () => {
      expect(typeof noUnusedVarsRule.meta.severity).toBe('string')
    })

    test('should have docs as an object', () => {
      expect(typeof noUnusedVarsRule.meta.docs).toBe('object')
      expect(noUnusedVarsRule.meta.docs).not.toBeNull()
    })

    test('should have docs.recommended as a boolean', () => {
      expect(typeof noUnusedVarsRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have docs.category as a string', () => {
      expect(typeof noUnusedVarsRule.meta.docs?.category).toBe('string')
    })

    test('should have docs.description as a non-empty string', () => {
      expect(typeof noUnusedVarsRule.meta.docs?.description).toBe('string')
      expect(noUnusedVarsRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noUnusedVarsRule.meta.schema)).toBe(true)
    })
  })

  // ============================================================
  // CREATE / VISITOR (12 tests)
  // ============================================================
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

    test('should return an object from create', () => {
      const { context } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should have all visitor methods as functions', () => {
      const { context } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      const methods = [
        'Program',
        'Program:exit',
        'FunctionDeclaration',
        'FunctionDeclaration:exit',
        'FunctionExpression',
        'FunctionExpression:exit',
        'ArrowFunctionExpression',
        'ArrowFunctionExpression:exit',
        'VariableDeclarator',
        'Identifier',
      ]
      for (const method of methods) {
        expect(typeof (visitor as Record<string, unknown>)[method]).toBe('function')
      }
    })
  })

  // ============================================================
  // DETECTION (30 tests)
  // ============================================================
  describe('detecting unused variables', () => {
    test('should report when variable is declared but never used', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should report with correct message for unused variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('myVar'))
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toBe("'myVar' is declared but never used.")
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

    test('should report unused function declaration name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('unusedFunc', []))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unusedFunc')
    })

    test('should report variable used only in inner function as used', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', []))
      visitor.Identifier(createIdentifier('x'))
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
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

    test('should report unused parameter in nested function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('outer', ['a']))
      visitor.Identifier(createIdentifier('outer'))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(['b']))
      visitor.Identifier(createIdentifier('a'))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('b')
    })

    test('should report all unused params in function with multiple params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', ['a', 'b', 'c', 'd']))
      visitor.Identifier(createIdentifier('fn'))
      visitor.Identifier(createIdentifier('a'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('b')
      expect(reports[1].message).toContain('c')
      expect(reports[2].message).toContain('d')
    })

    test('should report unused variable in arrow function scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.ArrowFunctionExpression(createArrowFunctionExpression([]))
      visitor.VariableDeclarator(createVariableDeclarator('inner'))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('inner')
    })

    test('should report variable declared in inner scope even if outer references it', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', []))
      visitor.VariableDeclarator(createVariableDeclarator('inner'))
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor.Identifier(createIdentifier('inner'))
      visitor['Program:exit']?.(undefined)

      // inner is declared in function scope, which already exited and reported it
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('inner')
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

    test('should report variable used before function scope exits', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', ['p']))
      visitor.Identifier(createIdentifier('x'))
      visitor.Identifier(createIdentifier('p'))
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should report variable shadowing outer scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', []))
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      // inner x shadows outer x, both unused
      expect(reports.length).toBe(2)
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

    test('should report unused parameter in function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionExpression(createFunctionExpression(['unused']))
      visitor['FunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unused')
    })

    test('should report unused parameter in arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(['unused']))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unused')
    })

    test('should report unused variable declared with let keyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('myLet'),
        init: { type: 'Literal', value: 1 },
        parent: { kind: 'let' },
      }
      visitor.VariableDeclarator(node)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('myLet')
    })

    test('should report unused variable declared with var keyword', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('myVar'),
        init: { type: 'Literal', value: 1 },
        parent: { kind: 'var' },
      }
      visitor.VariableDeclarator(node)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('myVar')
    })

    test('should report unused variable without explicit kind defaulting to let', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      const node = {
        type: 'VariableDeclarator',
        id: createIdentifier('noKind'),
        init: { type: 'Literal', value: 1 },
      }
      visitor.VariableDeclarator(node)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('noKind')
    })

    test('should report unused function with params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', ['a']))
      visitor.Identifier(createIdentifier('a'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('fn')
    })

    test('should report nested unused variables across two function levels', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('outer', []))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(['deep']))
      visitor.Identifier(createIdentifier('outer'))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('deep')
    })

    test('should detect unused variable in deeply nested arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.ArrowFunctionExpression(createArrowFunctionExpression([]))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression([]))
      visitor.VariableDeclarator(createVariableDeclarator('deep'))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('deep')
    })

    test('should report each unused param separately in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionExpression(createFunctionExpression(['a', 'b', 'c']))
      visitor['FunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(3)
      expect(reports.map((r) => r.message)).toEqual([
        "'a' is declared but never used.",
        "'b' is declared but never used.",
        "'c' is declared but never used.",
      ])
    })

    test('should report variable declared in function expression scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionExpression(createFunctionExpression([]))
      visitor.VariableDeclarator(createVariableDeclarator('local'))
      visitor['FunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('local')
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
  })

  // ============================================================
  // NOT REPORTING (30 tests)
  // ============================================================
  describe('not reporting used or ignored variables', () => {
    test('should not report when variable is declared and used', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.Identifier(createIdentifier('x'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
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

    test('should not report underscore-prefixed variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('_unused'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report multiple underscore-prefixed variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('_x'))
      visitor.VariableDeclarator(createVariableDeclarator('_y'))
      visitor.VariableDeclarator(createVariableDeclarator('_z'))
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

    test('should not report underscore-prefixed function parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('myFunc', ['_a', '_b']))
      visitor.Identifier(createIdentifier('myFunc'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
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

    test('should not report underscore-prefixed arrow function parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(['_a', '_b']))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
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

    test('should not report variable used multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.Identifier(createIdentifier('x'))
      visitor.Identifier(createIdentifier('x'))
      visitor.Identifier(createIdentifier('x'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report underscore-prefixed params in function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionExpression(createFunctionExpression(['_callback']))
      visitor['FunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report underscore-prefixed params in arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(['_event']))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report when variable used in deeper nested scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn1', []))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression([]))
      visitor.Identifier(createIdentifier('x'))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor.Identifier(createIdentifier('fn1'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report empty program', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report when no declarations exist', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.Identifier(createIdentifier('x'))
      visitor.Identifier(createIdentifier('y'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report variable with double underscore prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('__unused'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report underscore param mixed with used param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', ['_ctx', 'used']))
      visitor.Identifier(createIdentifier('fn'))
      visitor.Identifier(createIdentifier('used'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report variable used after function scope exit', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', []))
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor.Identifier(createIdentifier('x'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report same variable name in sibling scopes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('fn1', []))
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.Identifier(createIdentifier('x'))
      visitor.Identifier(createIdentifier('fn1'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor.FunctionDeclaration(createFunctionDeclaration('fn2', []))
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.Identifier(createIdentifier('x'))
      visitor.Identifier(createIdentifier('fn2'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report used param in function expression with name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      const node = {
        type: 'FunctionExpression',
        id: createIdentifier('namedFn'),
        params: [createIdentifier('a')],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 2, column: 0 } },
      }
      visitor.FunctionExpression(node)
      visitor.Identifier(createIdentifier('a'))
      visitor['FunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report used variable in function expression scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionExpression(createFunctionExpression([]))
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.Identifier(createIdentifier('x'))
      visitor['FunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report underscore-prefixed function declaration name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('_helper', []))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report used arrow function param in expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(['x']))
      visitor.Identifier(createIdentifier('x'))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report when identifier matches variable from outer scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('outer'))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', []))
      visitor.Identifier(createIdentifier('outer'))
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report variable with underscore followed by number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('_1'))
      visitor.VariableDeclarator(createVariableDeclarator('_2'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report when all params are underscore-prefixed in function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', ['_a', '_b', '_c']))
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report variable used in same scope as declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('count'))
      visitor.Identifier(createIdentifier('count'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should not report function used before declaration in visitor order', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.Identifier(createIdentifier('fn'))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', []))
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EDGE CASES (25 tests)
  // ============================================================
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

    test('should handle function declaration with undefined id', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      const node = {
        type: 'FunctionDeclaration',
        id: undefined,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle param with non-Identifier type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      const node = {
        type: 'FunctionDeclaration',
        id: createIdentifier('fn'),
        params: [{ type: 'RestElement', argument: createIdentifier('args') }],
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.FunctionDeclaration(node)
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      // RestElement has no direct .name, so no param is declared
      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // LOCATION (15 tests)
  // ============================================================
  describe('location reporting', () => {
    test('should report correct location for variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x', 10, 5))
      visitor['Program:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report end column for variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x', 3, 8))
      visitor['Program:exit']?.(undefined)

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(9)
    })

    test('should report location for multi-character variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('longName', 5, 10))
      visitor['Program:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor['Program:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for second variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('a', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 2, 4))
      visitor.Identifier(createIdentifier('a'))
      visitor['Program:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report location for function parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', ['p'], 5, 0))
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(6)
    })

    test('should report location for function declaration name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('unused', [], 7, 3))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should provide default location for node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'noLoc' },
        parent: { kind: 'const' },
      }
      visitor.VariableDeclarator(node)
      visitor['Program:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for arrow function param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(['p'], 4, 2))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report location for function expression param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionExpression(createFunctionExpression(['p'], 6, 0))
      visitor['FunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(6)
    })

    test('should report location for variable at high line number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x', 500, 20))
      visitor['Program:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report location for variable at column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x', 1, 0))
      visitor['Program:exit']?.(undefined)

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report different locations for different unused vars', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('a', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 2, 0))
      visitor['Program:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
    })

    test('should have both start and end in location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x', 3, 5))
      visitor['Program:exit']?.(undefined)

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.start.line).toBeDefined()
      expect(reports[0].loc?.start.column).toBeDefined()
      expect(reports[0].loc?.end.line).toBeDefined()
      expect(reports[0].loc?.end.column).toBeDefined()
    })

    test('should report loc as object with start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor['Program:exit']?.(undefined)

      const loc = reports[0].loc
      expect(loc).toBeDefined()
      expect(typeof loc?.start.line).toBe('number')
      expect(typeof loc?.start.column).toBe('number')
      expect(typeof loc?.end.line).toBe('number')
      expect(typeof loc?.end.column).toBe('number')
    })
  })

  // ============================================================
  // MESSAGE QUALITY (10 tests)
  // ============================================================
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

    test('should include param name in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', ['myParam']))
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toBe("'myParam' is declared but never used.")
    })

    test('should include function name in message when unused', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('myFunc', []))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toBe("'myFunc' is declared but never used.")
    })

    test('should end message with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should use consistent format across variable kinds', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: createIdentifier('b'),
        init: null,
        parent: { kind: 'let' },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toMatch(/^'a' is declared but never used\.$/)
      expect(reports[1].message).toMatch(/^'b' is declared but never used\.$/)
    })

    test('should have same message format for params and variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('v'))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', ['p']))
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      // Both share same message format
      const format = /^'.*' is declared but never used\.$/
      expect(reports[0].message).toMatch(format)
      expect(reports[1].message).toMatch(format)
    })
  })

  // ============================================================
  // MULTIPLE REPORTS (10 tests)
  // ============================================================
  describe('multiple reports', () => {
    test('should report all unused variables at program exit', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.VariableDeclarator(createVariableDeclarator('b'))
      visitor.VariableDeclarator(createVariableDeclarator('c'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(3)
    })

    test('should report unused params at function exit', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', ['a', 'b']))
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(2)
    })

    test('should report from multiple function scopes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('fn1', ['a']))
      visitor.Identifier(createIdentifier('fn1'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor.FunctionDeclaration(createFunctionDeclaration('fn2', ['b']))
      visitor.Identifier(createIdentifier('fn2'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('a')
      expect(reports[1].message).toContain('b')
    })

    test('should report from nested scopes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', ['outer']))
      visitor.Identifier(createIdentifier('fn'))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(['inner']))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(2)
    })

    test('should report mix of variables and params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('v'))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', ['p']))
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('p')
      expect(reports[1].message).toContain('v')
    })

    test('should report large number of unused variables', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      for (let i = 0; i < 20; i++) {
        visitor.VariableDeclarator(createVariableDeclarator(`var${i}`))
      }
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(20)
    })

    test('should report unused vars from arrow function and outer scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('outer'))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(['param']))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(2)
    })

    test('should not double report across scope exits', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', []))
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      // 'x' reported exactly once
      expect(reports.filter((r) => r.message.includes("'x'"))).toHaveLength(1)
    })

    test('should handle report order matching declaration order', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('first'))
      visitor.VariableDeclarator(createVariableDeclarator('second'))
      visitor.VariableDeclarator(createVariableDeclarator('third'))
      visitor['Program:exit']?.(undefined)

      expect(reports[0].message).toContain('first')
      expect(reports[1].message).toContain('second')
      expect(reports[2].message).toContain('third')
    })

    test('should report all params when none are used', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(['a', 'b', 'c', 'd', 'e']))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(5)
    })
  })

  // ============================================================
  // CONTEXT (10 tests)
  // ============================================================
  describe('context handling', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockContext({}, '/custom/path.ts')
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should work with empty source', () => {
      const { context, reports } = createMockContext({}, '/src/file.ts', '')
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should work with multi-line source', () => {
      const { context, reports } = createMockContext(
        {},
        '/src/file.ts',
        'const x = 1;\nconst y = 2;\n',
      )
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
    })

    test('should create independent visitors for each context', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = noUnusedVarsRule.create(ctx1)
      const visitor2 = noUnusedVarsRule.create(ctx2)

      visitor1.Program(createProgram())
      visitor1.VariableDeclarator(createVariableDeclarator('x'))
      visitor1['Program:exit']?.(undefined)

      visitor2.Program(createProgram())
      visitor2.VariableDeclarator(createVariableDeclarator('y'))
      visitor2.Identifier(createIdentifier('y'))
      visitor2['Program:exit']?.(undefined)

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should call context report with correct structure', () => {
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
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
    })

    test('should handle context with undefined options', () => {
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

    test('should handle multiple Program/Program:exit cycles', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor['Program:exit']?.(undefined)

      // second Program cycle
      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('y'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(2)
    })

    test('should handle deeply nested function scopes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('f1', []))
      visitor.Identifier(createIdentifier('f1'))
      visitor.FunctionExpression(createFunctionExpression([]))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(['deep']))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['FunctionExpression:exit']?.(undefined)
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('deep')
    })

    test('should handle scope stack correctly with early exits', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', ['p']))
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      // After function exit, we're back at program scope
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.Identifier(createIdentifier('x'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('p')
    })

    test('should not share state between different create calls', () => {
      const { context: ctx1, reports: r1 } = createMockContext()
      const { context: ctx2, reports: r2 } = createMockContext()

      const v1 = noUnusedVarsRule.create(ctx1)
      const v2 = noUnusedVarsRule.create(ctx2)

      v1.Program(createProgram())
      v1.VariableDeclarator(createVariableDeclarator('shared'))
      v1.Identifier(createIdentifier('shared'))
      v1['Program:exit']?.(undefined)

      v2.Program(createProgram())
      v2.VariableDeclarator(createVariableDeclarator('shared'))
      v2['Program:exit']?.(undefined)

      expect(r1.length).toBe(0)
      expect(r2.length).toBe(1)
    })
  })

  // ============================================================
  // ADDITIONAL EDGE CASES (32 tests)
  // ============================================================
  describe('additional edge cases', () => {
    test('should handle VariableDeclarator with id as non-Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'ObjectPattern', properties: [] },
        init: null,
        parent: { kind: 'const' },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator with null id', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: null,
        init: null,
        parent: { kind: 'const' },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator with string id', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: 'not-an-object',
        init: null,
        parent: { kind: 'const' },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node in VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      expect(() => visitor.VariableDeclarator(true)).not.toThrow()
      expect(() => visitor.VariableDeclarator(false)).not.toThrow()
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node in FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      expect(() => visitor.FunctionDeclaration(true)).not.toThrow()
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node in FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      expect(() => visitor.FunctionExpression(false)).not.toThrow()
      visitor['FunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node in ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      expect(() => visitor.ArrowFunctionExpression(true)).not.toThrow()
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node in Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      expect(() => visitor.Identifier(true)).not.toThrow()
      expect(() => visitor.Identifier(false)).not.toThrow()
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle function declaration with empty params array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration(createFunctionDeclaration('fn', []))
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle arrow function with empty params array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.ArrowFunctionExpression(createArrowFunctionExpression([]))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle function expression with empty params array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionExpression(createFunctionExpression([]))
      visitor['FunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle identifier with empty name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator(''))
      visitor.Identifier(createIdentifier(''))
      visitor['Program:exit']?.(undefined)

      // '' is both declared and used
      expect(reports.length).toBe(0)
    })

    test('should handle single character variable names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.VariableDeclarator(createVariableDeclarator('b'))
      visitor.VariableDeclarator(createVariableDeclarator('c'))
      visitor.Identifier(createIdentifier('a'))
      visitor.Identifier(createIdentifier('c'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('b')
    })

    test('should handle variable name with numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('var1'))
      visitor.VariableDeclarator(createVariableDeclarator('var2'))
      visitor.Identifier(createIdentifier('var1'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('var2')
    })

    test('should handle node with loc containing zero values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x', 0, 0))
      visitor['Program:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle identifier that matches no declared variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.Identifier(createIdentifier('y'))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('x')
    })

    test('should handle many identifiers referencing same variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      for (let i = 0; i < 10; i++) {
        visitor.Identifier(createIdentifier('x'))
      }
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle function declaration inside function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionExpression(createFunctionExpression([]))
      visitor.FunctionDeclaration(createFunctionDeclaration('inner', []))
      visitor.Identifier(createIdentifier('inner'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['FunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle arrow inside arrow', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.ArrowFunctionExpression(createArrowFunctionExpression([]))
      visitor.ArrowFunctionExpression(createArrowFunctionExpression(['x']))
      visitor.Identifier(createIdentifier('x'))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle node with partial loc (start only)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          loc: {
            start: { line: 5, column: 3 },
          },
        },
        parent: { kind: 'const' },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should handle node with numeric loc values as strings', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'x',
          loc: {
            start: { line: '2' as unknown as number, column: '0' as unknown as number },
            end: { line: '2' as unknown as number, column: '1' as unknown as number },
          },
        },
        parent: { kind: 'const' },
      })
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle param that is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: createIdentifier('fn'),
        params: [null],
        body: { type: 'BlockStatement', body: [] },
      })
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle param that is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: createIdentifier('fn'),
        params: [undefined],
        body: { type: 'BlockStatement', body: [] },
      })
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle param that is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: createIdentifier('fn'),
        params: ['not-a-param'],
        body: { type: 'BlockStatement', body: [] },
      })
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle param that is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: createIdentifier('fn'),
        params: [42],
        body: { type: 'BlockStatement', body: [] },
      })
      visitor.Identifier(createIdentifier('fn'))
      visitor['FunctionDeclaration:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle function expression with null params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: null,
        body: { type: 'BlockStatement', body: [] },
      })
      visitor['FunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle arrow function with null params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.ArrowFunctionExpression({
        type: 'ArrowFunctionExpression',
        params: null,
        body: { type: 'BlockStatement', body: [] },
      })
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle function expression with string params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: 'not-array',
        body: { type: 'BlockStatement', body: [] },
      })
      visitor['FunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle arrow function with string params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.ArrowFunctionExpression({
        type: 'ArrowFunctionExpression',
        params: 'not-array',
        body: { type: 'BlockStatement', body: [] },
      })
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle function expression with undefined params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.FunctionExpression({
        type: 'FunctionExpression',
        id: null,
        params: undefined,
        body: { type: 'BlockStatement', body: [] },
      })
      visitor['FunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle arrow function with undefined params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.ArrowFunctionExpression({
        type: 'ArrowFunctionExpression',
        params: undefined,
        body: { type: 'BlockStatement', body: [] },
      })
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // TEST.EACH — parametrized tests (40+ tests)
  // ============================================================
  describe.each([
    { name: 'x' },
    { name: 'myVariable' },
    { name: 'camelCase' },
    { name: 'snake_case' },
    { name: 'UPPER' },
    { name: 'a' },
    { name: 'z9' },
    { name: '_private' },
    { name: '__double' },
    { name: '$dollar' },
  ])('variable name "$name"', ({ name }) => {
    test(`should report "${name}" as unused when not referenced`, () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator(name))
      visitor['Program:exit']?.(undefined)

      if (name.startsWith('_')) {
        expect(reports.length).toBe(0)
      } else {
        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain(name)
      }
    })

    test(`should not report "${name}" when referenced`, () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator(name))
      visitor.Identifier(createIdentifier(name))
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test(`should report correct message for "${name}"`, () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator(name))
      visitor['Program:exit']?.(undefined)

      if (!name.startsWith('_')) {
        expect(reports[0].message).toBe(`'${name}' is declared but never used.`)
      }
    })

    test(`should report "${name}" as unused param`, () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.ArrowFunctionExpression(createArrowFunctionExpression([name]))
      visitor['ArrowFunctionExpression:exit']?.(undefined)
      visitor['Program:exit']?.(undefined)

      if (name.startsWith('_')) {
        expect(reports.length).toBe(0)
      } else {
        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain(name)
      }
    })
  })

  describe.each([{ kind: 'const' }, { kind: 'let' }, { kind: 'var' }])(
    'variable kind "$kind"',
    ({ kind }) => {
      test(`should report unused ${kind} variable`, () => {
        const { context, reports } = createMockContext()
        const visitor = noUnusedVarsRule.create(context)

        visitor.Program(createProgram())
        visitor.VariableDeclarator({
          type: 'VariableDeclarator',
          id: createIdentifier('x'),
          init: { type: 'Literal', value: 1 },
          parent: { kind },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        })
        visitor['Program:exit']?.(undefined)

        expect(reports.length).toBe(1)
      })

      test(`should not report used ${kind} variable`, () => {
        const { context, reports } = createMockContext()
        const visitor = noUnusedVarsRule.create(context)

        visitor.Program(createProgram())
        visitor.VariableDeclarator({
          type: 'VariableDeclarator',
          id: createIdentifier('x'),
          init: { type: 'Literal', value: 1 },
          parent: { kind },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        })
        visitor.Identifier(createIdentifier('x'))
        visitor['Program:exit']?.(undefined)

        expect(reports.length).toBe(0)
      })
    },
  )

  describe.each([
    { funcType: 'FunctionDeclaration', create: createFunctionDeclaration },
    {
      funcType: 'FunctionExpression',
      create: (name: string, params: string[]) => createFunctionExpression(params),
    },
    {
      funcType: 'ArrowFunctionExpression',
      create: (name: string, params: string[]) => createArrowFunctionExpression(params),
    },
  ])('function type "$funcType"', ({ funcType, create }) => {
    test(`should report unused params in ${funcType}`, () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      const node = create('fn', ['unusedParam'])
      const visitorKey = funcType
      const exitKey = `${funcType}:exit`
      ;(visitor as Record<string, (node: unknown) => void>)[visitorKey](node)
      if (funcType === 'FunctionDeclaration') {
        visitor.Identifier(createIdentifier('fn'))
      }
      ;(visitor as Record<string, (node: unknown) => void>)[exitKey]?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('unusedParam')
    })

    test(`should not report used params in ${funcType}`, () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      const node = create('fn', ['usedParam'])
      const visitorKey = funcType
      const exitKey = `${funcType}:exit`
      ;(visitor as Record<string, (node: unknown) => void>)[visitorKey](node)
      if (funcType === 'FunctionDeclaration') {
        visitor.Identifier(createIdentifier('fn'))
      }
      visitor.Identifier(createIdentifier('usedParam'))
      ;(visitor as Record<string, (node: unknown) => void>)[exitKey]?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })

    test(`should not report underscore params in ${funcType}`, () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      const node = create('fn', ['_ignored'])
      const visitorKey = funcType
      const exitKey = `${funcType}:exit`
      ;(visitor as Record<string, (node: unknown) => void>)[visitorKey](node)
      if (funcType === 'FunctionDeclaration') {
        visitor.Identifier(createIdentifier('fn'))
      }
      ;(visitor as Record<string, (node: unknown) => void>)[exitKey]?.(undefined)
      visitor['Program:exit']?.(undefined)

      expect(reports.length).toBe(0)
    })
  })

  describe.each([
    { line: 1, column: 0 },
    { line: 5, column: 10 },
    { line: 100, column: 0 },
    { line: 1, column: 50 },
    { line: 42, column: 7 },
  ])('location at line=$line column=$column', ({ line, column }) => {
    test(`should report correct start line ${line} column ${column}`, () => {
      const { context, reports } = createMockContext()
      const visitor = noUnusedVarsRule.create(context)

      visitor.Program(createProgram())
      visitor.VariableDeclarator(createVariableDeclarator('x', line, column))
      visitor['Program:exit']?.(undefined)

      expect(reports[0].loc?.start.line).toBe(line)
      expect(reports[0].loc?.start.column).toBe(column)
    })
  })
})

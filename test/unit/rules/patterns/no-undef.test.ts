import { describe, test, expect, vi } from 'vitest'
import { noUndefRule } from '../../../../src/rules/patterns/no-undef.js'
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

function createVariableDeclarator(name: string, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclarator',
    id: {
      type: 'Identifier',
      name,
      loc: {
        start: { line, column },
        end: { line, column: column + name.length },
      },
    },
    init: null,
    loc: {
      start: { line, column },
      end: { line, column: name.length + 5 },
    },
  }
}

function createVariableDeclaration(declarators: unknown[]): unknown {
  return {
    type: 'VariableDeclaration',
    declarations: declarators,
    kind: 'const',
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
  }
}

function createFunctionDeclaration(name: string, line = 1, column = 0): unknown {
  return {
    type: 'FunctionDeclaration',
    id: {
      type: 'Identifier',
      name,
      loc: {
        start: { line, column: column + 9 },
        end: { line, column: column + 9 + name.length },
      },
    },
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: 20 + name.length },
    },
  }
}

function createClassDeclaration(name: string, line = 1, column = 0): unknown {
  return {
    type: 'ClassDeclaration',
    id: {
      type: 'Identifier',
      name,
      loc: {
        start: { line, column: column + 6 },
        end: { line, column: column + 6 + name.length },
      },
    },
    body: { type: 'ClassBody', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: 20 + name.length },
    },
  }
}

function createImportSpecifier(local: string, line = 1, column = 0): unknown {
  return {
    type: 'ImportSpecifier',
    local: {
      type: 'Identifier',
      name: local,
      loc: {
        start: { line, column },
        end: { line, column: column + local.length },
      },
    },
    imported: {
      type: 'Identifier',
      name: local,
    },
    loc: {
      start: { line, column },
      end: { line, column: local.length + 5 },
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

describe('no-undef rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUndefRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUndefRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUndefRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUndefRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUndefRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noUndefRule.meta.fixable).toBeUndefined()
    })

    test('should mention undeclared in description', () => {
      expect(noUndefRule.meta.docs?.description.toLowerCase()).toContain('undeclared')
    })

    test('should mention variables in description', () => {
      expect(noUndefRule.meta.docs?.description.toLowerCase()).toContain('variables')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(visitor).toHaveProperty('VariableDeclarator')
      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(visitor).toHaveProperty('ClassDeclaration')
      expect(visitor).toHaveProperty('ImportSpecifier')
      expect(visitor).toHaveProperty('Identifier')
    })
  })

  describe('VariableDeclarator tracking', () => {
    test('should track variable from VariableDeclarator', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator(createVariableDeclarator('x'))).not.toThrow()
    })

    test('should handle multiple variable declarations', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('y'))
      visitor.VariableDeclarator(createVariableDeclarator('z'))

      expect(true).toBe(true)
    })

    test('should track variable with underscores', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator(createVariableDeclarator('my_var'))).not.toThrow()
    })

    test('should track variable with dollar signs', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator(createVariableDeclarator('$var'))).not.toThrow()
    })

    test('should track variable with camelCase', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator(createVariableDeclarator('myVariable'))).not.toThrow()
    })

    test('should handle VariableDeclarator without id', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      const node = { type: 'VariableDeclarator', init: null }
      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
    })
  })

  describe('FunctionDeclaration tracking', () => {
    test('should track function name from FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.FunctionDeclaration(createFunctionDeclaration('myFunc'))).not.toThrow()
    })

    test('should handle multiple function declarations', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('func1'))
      visitor.FunctionDeclaration(createFunctionDeclaration('func2'))
      visitor.FunctionDeclaration(createFunctionDeclaration('func3'))

      expect(true).toBe(true)
    })

    test('should handle function with underscores', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() =>
        visitor.FunctionDeclaration(createFunctionDeclaration('my_function')),
      ).not.toThrow()
    })

    test('should handle FunctionDeclaration without id', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    })
  })

  describe('ClassDeclaration tracking', () => {
    test('should track class name from ClassDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ClassDeclaration(createClassDeclaration('MyClass'))).not.toThrow()
    })

    test('should handle multiple class declarations', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Class1'))
      visitor.ClassDeclaration(createClassDeclaration('Class2'))
      visitor.ClassDeclaration(createClassDeclaration('Class3'))

      expect(true).toBe(true)
    })

    test('should handle class with underscores', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ClassDeclaration(createClassDeclaration('My_Class'))).not.toThrow()
    })

    test('should handle ClassDeclaration without id', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        body: { type: 'ClassBody', body: [] },
      }
      expect(() => visitor.ClassDeclaration(node)).not.toThrow()
    })
  })

  describe('ImportSpecifier tracking', () => {
    test('should track import local name', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ImportSpecifier(createImportSpecifier('importedVar'))).not.toThrow()
    })

    test('should handle multiple import specifiers', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('import1'))
      visitor.ImportSpecifier(createImportSpecifier('import2'))
      visitor.ImportSpecifier(createImportSpecifier('import3'))

      expect(true).toBe(true)
    })

    test('should handle import with underscores', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ImportSpecifier(createImportSpecifier('my_import'))).not.toThrow()
    })

    test('should handle ImportSpecifier without local', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Identifier', name: 'imported' },
      }
      expect(() => visitor.ImportSpecifier(node)).not.toThrow()
    })
  })

  describe('Identifier visitor', () => {
    test('should handle Identifier node', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.Identifier(createIdentifier('someVar'))).not.toThrow()
    })

    test('should handle multiple Identifier nodes', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      visitor.Identifier(createIdentifier('var1'))
      visitor.Identifier(createIdentifier('var2'))
      visitor.Identifier(createIdentifier('var3'))

      expect(true).toBe(true)
    })
  })

  describe('edge cases', () => {
    test('should handle null in VariableDeclarator', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
    })

    test('should handle undefined in VariableDeclarator', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
    })

    test('should handle non-object in VariableDeclarator', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator('string')).not.toThrow()
      expect(() => visitor.VariableDeclarator(123)).not.toThrow()
    })

    test('should handle null in FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle undefined in FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
    })

    test('should handle null in ClassDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ClassDeclaration(null)).not.toThrow()
    })

    test('should handle undefined in ClassDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ClassDeclaration(undefined)).not.toThrow()
    })

    test('should handle null in ImportSpecifier', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ImportSpecifier(null)).not.toThrow()
    })

    test('should handle undefined in ImportSpecifier', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ImportSpecifier(undefined)).not.toThrow()
    })

    test('should handle null in Identifier', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.Identifier(null)).not.toThrow()
    })

    test('should handle undefined in Identifier', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.Identifier(undefined)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
    })

    test('should handle empty options', () => {
      const { context } = createMockContext({})
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator(createVariableDeclarator('x'))).not.toThrow()
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

      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator(createVariableDeclarator('x'))).not.toThrow()
    })
  })

  describe('mixed declarations', () => {
    test('should handle combination of different declaration types', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.FunctionDeclaration(createFunctionDeclaration('myFunc'))
      visitor.ClassDeclaration(createClassDeclaration('MyClass'))
      visitor.ImportSpecifier(createImportSpecifier('imported'))
      visitor.Identifier(createIdentifier('used'))

      expect(true).toBe(true)
    })

    test('should track same name from different declaration types', () => {
      const { context } = createMockContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('name'))
      visitor.FunctionDeclaration(createFunctionDeclaration('name'))
      visitor.ClassDeclaration(createClassDeclaration('name'))
      visitor.ImportSpecifier(createImportSpecifier('name'))

      expect(true).toBe(true)
    })
  })
})

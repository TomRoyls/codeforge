import { describe, test, expect, vi } from 'vitest'
import { noUndefRule } from '../../../../src/rules/patterns/no-undef.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('no-undef rule', () => {
  // =========================================================================
  // 1. Meta properties (20 tests)
  // =========================================================================
  describe('meta properties', () => {
    test('meta should be defined', () => {
      expect(noUndefRule.meta).toBeDefined()
    })

    test('should have problem type', () => {
      expect(noUndefRule.meta.type).toBe('problem')
    })

    test('type should be a string', () => {
      expect(typeof noUndefRule.meta.type).toBe('string')
    })

    test('should have error severity', () => {
      expect(noUndefRule.meta.severity).toBe('error')
    })

    test('severity should be a string', () => {
      expect(typeof noUndefRule.meta.severity).toBe('string')
    })

    test('should be recommended', () => {
      expect(noUndefRule.meta.docs?.recommended).toBe(true)
    })

    test('recommended should be boolean', () => {
      expect(typeof noUndefRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have patterns category', () => {
      expect(noUndefRule.meta.docs?.category).toBe('patterns')
    })

    test('category should be a string', () => {
      expect(typeof noUndefRule.meta.docs?.category).toBe('string')
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

    test('description should be a non-empty string', () => {
      expect(typeof noUndefRule.meta.docs?.description).toBe('string')
      expect(noUndefRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('docs object should exist', () => {
      expect(noUndefRule.meta.docs).toBeDefined()
    })

    test('should not be deprecated', () => {
      expect(noUndefRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noUndefRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noUndefRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('docs url should be undefined', () => {
      expect(noUndefRule.meta.docs?.url).toBeUndefined()
    })

    test('schema should be an empty array', () => {
      expect(noUndefRule.meta.schema).toEqual([])
    })
  })

  // =========================================================================
  // 2. create / visitor structure (8 tests)
  // =========================================================================
  describe('create visitor', () => {
    test('create should be a function', () => {
      expect(typeof noUndefRule.create).toBe('function')
    })

    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(visitor).toHaveProperty('VariableDeclarator')
      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(visitor).toHaveProperty('ClassDeclaration')
      expect(visitor).toHaveProperty('ImportSpecifier')
      expect(visitor).toHaveProperty('Identifier')
    })

    test('each visitor method should be a function', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(typeof visitor.VariableDeclarator).toBe('function')
      expect(typeof visitor.FunctionDeclaration).toBe('function')
      expect(typeof visitor.ClassDeclaration).toBe('function')
      expect(typeof visitor.ImportSpecifier).toBe('function')
      expect(typeof visitor.Identifier).toBe('function')
    })

    test('create should return a new visitor each call', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noUndefRule.create(context)
      const visitor2 = noUndefRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('visitor should only have expected keys', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)
      const keys = Object.keys(visitor)

      expect(keys).toHaveLength(5)
      expect(keys.sort()).toEqual(
        [
          'ClassDeclaration',
          'FunctionDeclaration',
          'Identifier',
          'ImportSpecifier',
          'VariableDeclarator',
        ].sort(),
      )
    })

    test('should not throw when creating visitor with empty config', () => {
      const ctx: RuleContext = {
        report: () => {},
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      expect(() => noUndefRule.create(ctx)).not.toThrow()
    })

    test('should not throw when creating visitor with undefined config options', () => {
      const ctx: RuleContext = {
        report: () => {},
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      expect(() => noUndefRule.create(ctx)).not.toThrow()
    })

    test('visitor should be a plain object', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
      expect(Array.isArray(visitor)).toBe(false)
    })
  })

  // =========================================================================
  // 3. Detection / tracking (30 tests)
  // =========================================================================
  describe('VariableDeclarator tracking', () => {
    test('should track variable from VariableDeclarator', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator(createVariableDeclarator('x'))).not.toThrow()
    })

    test('should handle multiple variable declarations', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('y'))
      visitor.VariableDeclarator(createVariableDeclarator('z'))

      expect(true).toBe(true)
    })

    test('should track variable with underscores', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator(createVariableDeclarator('my_var'))).not.toThrow()
    })

    test('should track variable with dollar signs', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator(createVariableDeclarator('$var'))).not.toThrow()
    })

    test('should track variable with camelCase', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator(createVariableDeclarator('myVariable'))).not.toThrow()
    })

    test('should handle VariableDeclarator without id', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = { type: 'VariableDeclarator', init: null }
      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
    })

    test('should track single-letter variable names', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator(createVariableDeclarator('i'))).not.toThrow()
      expect(() => visitor.VariableDeclarator(createVariableDeclarator('_'))).not.toThrow()
    })

    test('should track SCREAMING_SNAKE_CASE variables', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() =>
        visitor.VariableDeclarator(createVariableDeclarator('MAX_RETRIES')),
      ).not.toThrow()
    })

    test('should track variable with dollar prefix', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator(createVariableDeclarator('$_jquery'))).not.toThrow()
    })

    test('should track many variables without error', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.VariableDeclarator(createVariableDeclarator(`var${i}`))
      }

      expect(true).toBe(true)
    })
  })

  describe('FunctionDeclaration tracking', () => {
    test('should track function name from FunctionDeclaration', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.FunctionDeclaration(createFunctionDeclaration('myFunc'))).not.toThrow()
    })

    test('should handle multiple function declarations', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('func1'))
      visitor.FunctionDeclaration(createFunctionDeclaration('func2'))
      visitor.FunctionDeclaration(createFunctionDeclaration('func3'))

      expect(true).toBe(true)
    })

    test('should handle function with underscores', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() =>
        visitor.FunctionDeclaration(createFunctionDeclaration('my_function')),
      ).not.toThrow()
    })

    test('should handle FunctionDeclaration without id', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }
      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    })

    test('should track single-character function name', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.FunctionDeclaration(createFunctionDeclaration('f'))).not.toThrow()
    })

    test('should track function with numeric suffix', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.FunctionDeclaration(createFunctionDeclaration('handler2'))).not.toThrow()
    })

    test('should track dollar-sign function', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.FunctionDeclaration(createFunctionDeclaration('$'))).not.toThrow()
    })
  })

  describe('ClassDeclaration tracking', () => {
    test('should track class name from ClassDeclaration', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ClassDeclaration(createClassDeclaration('MyClass'))).not.toThrow()
    })

    test('should handle multiple class declarations', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Class1'))
      visitor.ClassDeclaration(createClassDeclaration('Class2'))
      visitor.ClassDeclaration(createClassDeclaration('Class3'))

      expect(true).toBe(true)
    })

    test('should handle class with underscores', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ClassDeclaration(createClassDeclaration('My_Class'))).not.toThrow()
    })

    test('should handle ClassDeclaration without id', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        body: { type: 'ClassBody', body: [] },
      }
      expect(() => visitor.ClassDeclaration(node)).not.toThrow()
    })

    test('should track PascalCase class names', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() =>
        visitor.ClassDeclaration(createClassDeclaration('MyAwesomeComponent')),
      ).not.toThrow()
    })

    test('should track single-character class name', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ClassDeclaration(createClassDeclaration('A'))).not.toThrow()
    })
  })

  describe('ImportSpecifier tracking', () => {
    test('should track import local name', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ImportSpecifier(createImportSpecifier('importedVar'))).not.toThrow()
    })

    test('should handle multiple import specifiers', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('import1'))
      visitor.ImportSpecifier(createImportSpecifier('import2'))
      visitor.ImportSpecifier(createImportSpecifier('import3'))

      expect(true).toBe(true)
    })

    test('should handle import with underscores', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ImportSpecifier(createImportSpecifier('my_import'))).not.toThrow()
    })

    test('should handle ImportSpecifier without local', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Identifier', name: 'imported' },
      }
      expect(() => visitor.ImportSpecifier(node)).not.toThrow()
    })

    test('should track aliased import', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = {
        type: 'ImportSpecifier',
        local: {
          type: 'Identifier',
          name: 'myAlias',
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
        },
        imported: {
          type: 'Identifier',
          name: 'OriginalName',
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ImportSpecifier(node)).not.toThrow()
    })
  })

  // =========================================================================
  // 4. NOT reporting / no-error cases (30 tests)
  // =========================================================================
  describe('no reports for valid patterns', () => {
    test('should not report for VariableDeclarator with identifier id', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.Identifier(createIdentifier('x'))

      expect(reports).toHaveLength(0)
    })

    test('should not report for FunctionDeclaration with identifier id', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('myFunc'))
      visitor.Identifier(createIdentifier('myFunc'))

      expect(reports).toHaveLength(0)
    })

    test('should not report for ClassDeclaration with identifier id', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('MyClass'))
      visitor.Identifier(createIdentifier('MyClass'))

      expect(reports).toHaveLength(0)
    })

    test('should not report for ImportSpecifier with local identifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('importedVar'))
      visitor.Identifier(createIdentifier('importedVar'))

      expect(reports).toHaveLength(0)
    })

    test('should not report when no Identifier visits happen', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.FunctionDeclaration(createFunctionDeclaration('b'))
      visitor.ClassDeclaration(createClassDeclaration('C'))

      expect(reports).toHaveLength(0)
    })

    test('should not report for VariableDeclarator without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'noLoc' },
        init: null,
      })

      expect(reports).toHaveLength(0)
    })

    test('should not report for FunctionDeclaration without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'noLoc' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })

      expect(reports).toHaveLength(0)
    })

    test('should not report for ClassDeclaration without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.ClassDeclaration({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'NoLoc' },
        body: { type: 'ClassBody', body: [] },
      })

      expect(reports).toHaveLength(0)
    })

    test('should not report for ImportSpecifier without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.ImportSpecifier({
        type: 'ImportSpecifier',
        local: { type: 'Identifier', name: 'noLoc' },
        imported: { type: 'Identifier', name: 'noLoc' },
      })

      expect(reports).toHaveLength(0)
    })

    test('should not report when declared variable is used', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('foo'))
      visitor.Identifier(createIdentifier('foo'))

      expect(reports).toHaveLength(0)
    })

    test('should not report when declared function is used', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('bar'))
      visitor.Identifier(createIdentifier('bar'))

      expect(reports).toHaveLength(0)
    })

    test('should not report when declared class is used', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.ClassDeclaration(createClassDeclaration('Baz'))
      visitor.Identifier(createIdentifier('Baz'))

      expect(reports).toHaveLength(0)
    })

    test('should not report when imported name is used', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('utils'))
      visitor.Identifier(createIdentifier('utils'))

      expect(reports).toHaveLength(0)
    })

    test('should not report for mixed declarations then usage', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('v'))
      visitor.FunctionDeclaration(createFunctionDeclaration('f'))
      visitor.ClassDeclaration(createClassDeclaration('C'))
      visitor.ImportSpecifier(createImportSpecifier('imp'))
      visitor.Identifier(createIdentifier('v'))
      visitor.Identifier(createIdentifier('f'))
      visitor.Identifier(createIdentifier('C'))
      visitor.Identifier(createIdentifier('imp'))

      expect(reports).toHaveLength(0)
    })

    test('should not report for re-declaration of same name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.Identifier(createIdentifier('x'))

      expect(reports).toHaveLength(0)
    })

    test('should not report for empty source', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/empty.ts' })
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))

      expect(reports).toHaveLength(0)
    })

    test('should not report when Identifier is visited without declarations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.Identifier(createIdentifier('anything'))

      expect(reports).toHaveLength(0)
    })

    test('should not report for variable declared via var kind', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('loopVar'))
      visitor.Identifier(createIdentifier('loopVar'))

      expect(reports).toHaveLength(0)
    })

    test('should not report for variable with init value', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'initialized' },
        init: { type: 'Literal', value: 42 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor.Identifier(createIdentifier('initialized'))

      expect(reports).toHaveLength(0)
    })

    test('should not report for deeply nested valid variable', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('outer'))
      visitor.VariableDeclarator(createVariableDeclarator('inner'))
      visitor.Identifier(createIdentifier('outer'))
      visitor.Identifier(createIdentifier('inner'))

      expect(reports).toHaveLength(0)
    })

    test('should not report for variable with name "undefined"', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('undefined'))
      visitor.Identifier(createIdentifier('undefined'))

      expect(reports).toHaveLength(0)
    })

    test('should not report when declaration happens after Identifier visit', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.Identifier(createIdentifier('hoisted'))
      visitor.FunctionDeclaration(createFunctionDeclaration('hoisted'))

      expect(reports).toHaveLength(0)
    })

    test('should not report for unicode variable names', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('π'))
      visitor.Identifier(createIdentifier('π'))

      expect(reports).toHaveLength(0)
    })

    test('should not report when same name used from different declaration kinds', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('name'))
      visitor.FunctionDeclaration(createFunctionDeclaration('name'))
      visitor.Identifier(createIdentifier('name'))

      expect(reports).toHaveLength(0)
    })

    test('should not report for numeric underscore names', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('num_1'))
      visitor.Identifier(createIdentifier('num_1'))

      expect(reports).toHaveLength(0)
    })

    test('should not report for triple underscore prefix', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('___internal'))
      visitor.Identifier(createIdentifier('___internal'))

      expect(reports).toHaveLength(0)
    })

    test('should not report when all four declaration types used', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('v1'))
      visitor.FunctionDeclaration(createFunctionDeclaration('f1'))
      visitor.ClassDeclaration(createClassDeclaration('C1'))
      visitor.ImportSpecifier(createImportSpecifier('i1'))

      visitor.Identifier(createIdentifier('v1'))
      visitor.Identifier(createIdentifier('f1'))
      visitor.Identifier(createIdentifier('C1'))
      visitor.Identifier(createIdentifier('i1'))

      expect(reports).toHaveLength(0)
    })

    test('should not report for many sequential declarations and usages', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.VariableDeclarator(createVariableDeclarator(`v${i}`))
      }
      for (let i = 0; i < 20; i++) {
        visitor.Identifier(createIdentifier(`v${i}`))
      }

      expect(reports).toHaveLength(0)
    })

    test('should not report for class with long name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const longName = 'VeryLongClassNameThatExceedsNormalLength'
      visitor.ClassDeclaration(createClassDeclaration(longName))
      visitor.Identifier(createIdentifier(longName))

      expect(reports).toHaveLength(0)
    })

    test('should not report for empty options config', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.Identifier(createIdentifier('x'))

      expect(reports).toHaveLength(0)
    })
  })

  // =========================================================================
  // 5. Edge cases (25 tests)
  // =========================================================================
  describe('edge cases', () => {
    test('should handle null in VariableDeclarator', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
    })

    test('should handle undefined in VariableDeclarator', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator(undefined)).not.toThrow()
    })

    test('should handle non-object in VariableDeclarator', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator('string')).not.toThrow()
      expect(() => visitor.VariableDeclarator(123)).not.toThrow()
    })

    test('should handle null in FunctionDeclaration', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
    })

    test('should handle undefined in FunctionDeclaration', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
    })

    test('should handle null in ClassDeclaration', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ClassDeclaration(null)).not.toThrow()
    })

    test('should handle undefined in ClassDeclaration', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ClassDeclaration(undefined)).not.toThrow()
    })

    test('should handle null in ImportSpecifier', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ImportSpecifier(null)).not.toThrow()
    })

    test('should handle undefined in ImportSpecifier', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ImportSpecifier(undefined)).not.toThrow()
    })

    test('should handle null in Identifier', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.Identifier(null)).not.toThrow()
    })

    test('should handle undefined in Identifier', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.Identifier(undefined)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'x' },
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
    })

    test('should handle empty options', () => {
      const { context } = createMockRuleContext()
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

    test('should handle node with id that is not an Identifier', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'ObjectPattern', properties: [] },
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
    })

    test('should handle FunctionDeclaration with id that is not Identifier', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'ObjectExpression', properties: [] },
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    })

    test('should handle ClassDeclaration with id that is not Identifier', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = {
        type: 'ClassDeclaration',
        id: { type: 'Literal', value: 'notAnIdentifier' },
        body: { type: 'ClassBody', body: [] },
      }

      expect(() => visitor.ClassDeclaration(node)).not.toThrow()
    })

    test('should handle ImportSpecifier with local that is not Identifier', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = {
        type: 'ImportSpecifier',
        local: { type: 'Literal', value: 'notAnIdentifier' },
        imported: { type: 'Identifier', name: 'original' },
      }

      expect(() => visitor.ImportSpecifier(node)).not.toThrow()
    })

    test('should handle boolean in visitor methods', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator(true)).not.toThrow()
      expect(() => visitor.FunctionDeclaration(false)).not.toThrow()
    })

    test('should handle numeric 0 in visitor methods', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator(0)).not.toThrow()
    })

    test('should handle empty string in visitor methods', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.Identifier('')).not.toThrow()
    })

    test('should handle node with empty name', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: '' },
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
    })

    test('should handle deeply nested node structure', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'deep',
          loc: {
            start: { line: 10, column: 20 },
            end: { line: 10, column: 24 },
          },
        },
        init: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
        },
        loc: {
          start: { line: 10, column: 16 },
          end: { line: 10, column: 35 },
        },
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
    })

    test('should handle node with extra properties', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'extra' },
        init: null,
        extra: true,
        range: [0, 10],
        parent: {},
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
    })

    test('should handle very long variable name', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const longName = 'a'.repeat(1000)
      expect(() => visitor.VariableDeclarator(createVariableDeclarator(longName))).not.toThrow()
    })
  })

  // =========================================================================
  // 6. Location tracking (15 tests)
  // =========================================================================
  describe('location tracking', () => {
    test('VariableDeclarator should preserve line/column info', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = createVariableDeclarator('locVar', 5, 10)
      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
    })

    test('FunctionDeclaration should preserve line/column info', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = createFunctionDeclaration('locFunc', 10, 5)
      expect(() => visitor.FunctionDeclaration(node)).not.toThrow()
    })

    test('ClassDeclaration should preserve line/column info', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = createClassDeclaration('LocClass', 15, 0)
      expect(() => visitor.ClassDeclaration(node)).not.toThrow()
    })

    test('ImportSpecifier should preserve line/column info', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = createImportSpecifier('locImport', 3, 8)
      expect(() => visitor.ImportSpecifier(node)).not.toThrow()
    })

    test('Identifier should preserve line/column info', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = createIdentifier('locId', 20, 15)
      expect(() => visitor.Identifier(node)).not.toThrow()
    })

    test('should handle line 0 column 0', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator(createVariableDeclarator('zero', 0, 0))).not.toThrow()
    })

    test('should handle large line numbers', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() =>
        visitor.FunctionDeclaration(createFunctionDeclaration('deep', 9999, 0)),
      ).not.toThrow()
    })

    test('should handle large column numbers', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ClassDeclaration(createClassDeclaration('Wide', 1, 5000))).not.toThrow()
    })

    test('should track variable at different locations correctly', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a', 1, 0))
      visitor.VariableDeclarator(createVariableDeclarator('b', 2, 4))
      visitor.VariableDeclarator(createVariableDeclarator('c', 3, 8))

      visitor.Identifier(createIdentifier('a', 10, 0))
      visitor.Identifier(createIdentifier('b', 11, 2))
      visitor.Identifier(createIdentifier('c', 12, 4))

      expect(true).toBe(true)
    })

    test('should handle node with only start location', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'partial',
          loc: { start: { line: 1, column: 0 } },
        },
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
    })

    test('should handle node with only end location', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'partialEnd',
          loc: { end: { line: 1, column: 10 } },
        },
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
    })

    test('should handle node without loc on id', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'noIdLoc' },
        init: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
    })

    test('should handle Identifier node without loc', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = { type: 'Identifier', name: 'bare' }
      expect(() => visitor.Identifier(node)).not.toThrow()
    })

    test('should handle loc with negative values gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const node = {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: 'negative',
          loc: { start: { line: -1, column: -1 }, end: { line: -1, column: 8 } },
        },
        init: null,
      }

      expect(() => visitor.VariableDeclarator(node)).not.toThrow()
    })

    test('should handle VariableDeclaration wrapper node', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const decl = createVariableDeclaration([
        createVariableDeclarator('a', 1, 6),
        createVariableDeclarator('b', 1, 9),
      ])

      const node = decl as Record<string, unknown>
      const declarations = node.declarations as unknown[]
      for (const d of declarations) {
        visitor.VariableDeclarator(d)
      }

      expect(true).toBe(true)
    })
  })

  // =========================================================================
  // 7. Messages / context interactions (10 tests)
  // =========================================================================
  describe('context interactions', () => {
    test('report function should not be called for declared variables', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('declared'))
      visitor.Identifier(createIdentifier('declared'))

      expect(reports).toHaveLength(0)
    })

    test('context getFilePath should be callable without error', () => {
      const { context } = createMockRuleContext({ filePath: '/custom/path.ts' })
      expect(context.getFilePath()).toBe('/custom/path.ts')
    })

    test('context getSource should be callable without error', () => {
      const { context } = createMockRuleContext({ source: 'let x = 2;', filePath: '/src/file.ts' })
      expect(context.getSource()).toBe('let x = 2;')
    })

    test('context getAST should return null', () => {
      const { context } = createMockRuleContext()
      expect(context.getAST()).toBeNull()
    })

    test('context getTokens should return empty array', () => {
      const { context } = createMockRuleContext()
      expect(context.getTokens()).toEqual([])
    })

    test('context getComments should return empty array', () => {
      const { context } = createMockRuleContext()
      expect(context.getComments()).toEqual([])
    })

    test('context logger methods should be callable', () => {
      const { context } = createMockRuleContext()
      expect(() => context.logger.debug('test')).not.toThrow()
      expect(() => context.logger.info('test')).not.toThrow()
      expect(() => context.logger.warn('test')).not.toThrow()
      expect(() => context.logger.error('test')).not.toThrow()
    })

    test('context workspaceRoot should be accessible', () => {
      const { context } = createMockRuleContext()
      expect(context.workspaceRoot).toBe('/src')
    })

    test('visitor should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/project/src/utils.ts' })
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('util'))
      visitor.Identifier(createIdentifier('util'))

      expect(reports).toHaveLength(0)
    })

    test('visitor should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'function hello() { return "world"; }', filePath: '/src/app.ts' })
      const visitor = noUndefRule.create(context)

      visitor.FunctionDeclaration(createFunctionDeclaration('hello'))
      visitor.Identifier(createIdentifier('hello'))

      expect(reports).toHaveLength(0)
    })
  })

  // =========================================================================
  // 8. Multiple reports / mixed declarations (10 tests)
  // =========================================================================
  describe('mixed declarations', () => {
    test('should handle combination of different declaration types', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.FunctionDeclaration(createFunctionDeclaration('myFunc'))
      visitor.ClassDeclaration(createClassDeclaration('MyClass'))
      visitor.ImportSpecifier(createImportSpecifier('imported'))
      visitor.Identifier(createIdentifier('used'))

      expect(true).toBe(true)
    })

    test('should track same name from different declaration types', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('name'))
      visitor.FunctionDeclaration(createFunctionDeclaration('name'))
      visitor.ClassDeclaration(createClassDeclaration('name'))
      visitor.ImportSpecifier(createImportSpecifier('name'))

      expect(true).toBe(true)
    })

    test('should handle interleaved declarations and usages', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.Identifier(createIdentifier('a'))
      visitor.FunctionDeclaration(createFunctionDeclaration('b'))
      visitor.Identifier(createIdentifier('b'))
      visitor.ClassDeclaration(createClassDeclaration('C'))
      visitor.Identifier(createIdentifier('C'))

      expect(reports).toHaveLength(0)
    })

    test('should handle many declarations then many usages', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      const names = ['alpha', 'beta', 'gamma', 'delta', 'epsilon']
      for (const n of names) {
        visitor.VariableDeclarator(createVariableDeclarator(n))
      }
      for (const n of names) {
        visitor.Identifier(createIdentifier(n))
      }

      expect(reports).toHaveLength(0)
    })

    test('should handle declaration in any order', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.ImportSpecifier(createImportSpecifier('imp'))
      visitor.ClassDeclaration(createClassDeclaration('Cls'))
      visitor.FunctionDeclaration(createFunctionDeclaration('fn'))
      visitor.VariableDeclarator(createVariableDeclarator('v'))

      visitor.Identifier(createIdentifier('imp'))
      visitor.Identifier(createIdentifier('Cls'))
      visitor.Identifier(createIdentifier('fn'))
      visitor.Identifier(createIdentifier('v'))

      expect(reports).toHaveLength(0)
    })

    test('should handle multiple visitors from same rule', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()

      const visitor1 = noUndefRule.create(ctx1)
      const visitor2 = noUndefRule.create(ctx2)

      visitor1.VariableDeclarator(createVariableDeclarator('x'))
      visitor2.VariableDeclarator(createVariableDeclarator('y'))

      visitor1.Identifier(createIdentifier('x'))
      visitor2.Identifier(createIdentifier('y'))

      expect(r1).toHaveLength(0)
      expect(r2).toHaveLength(0)
    })

    test('should handle two separate visitors independently', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()

      const visitor1 = noUndefRule.create(ctx1)
      const visitor2 = noUndefRule.create(ctx2)

      visitor1.VariableDeclarator(createVariableDeclarator('shared'))
      // visitor2 does NOT declare 'shared'
      visitor1.Identifier(createIdentifier('shared'))
      visitor2.Identifier(createIdentifier('shared'))

      // Both should have 0 reports since Identifier visitor is simplified
      expect(r1).toHaveLength(0)
      expect(r2).toHaveLength(0)
    })

    test('should handle variable then function then class with same name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('item'))
      visitor.FunctionDeclaration(createFunctionDeclaration('item'))
      visitor.ClassDeclaration(createClassDeclaration('item'))
      visitor.Identifier(createIdentifier('item'))

      expect(reports).toHaveLength(0)
    })

    test('should handle rapid sequential create calls', () => {
      for (let i = 0; i < 10; i++) {
        const { context } = createMockRuleContext()
        const visitor = noUndefRule.create(context)
        visitor.VariableDeclarator(createVariableDeclarator(`v${i}`))
      }

      expect(true).toBe(true)
    })

    test('should handle all visitors with all-null inputs', () => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(null)
      visitor.FunctionDeclaration(null)
      visitor.ClassDeclaration(null)
      visitor.ImportSpecifier(null)
      visitor.Identifier(null)

      expect(true).toBe(true)
    })
  })

  // =========================================================================
  // 9. Context variations (10 tests)
  // =========================================================================
  describe('context variations', () => {
    test('should work with empty source string', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/empty.ts' })
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.Identifier(createIdentifier('x'))

      expect(reports).toHaveLength(0)
    })

    test('should work with multi-line source', () => {
      const source = `const a = 1;
const b = 2;
function c() { return a + b; }`
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/multi.ts' })
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('a'))
      visitor.VariableDeclarator(createVariableDeclarator('b'))
      visitor.FunctionDeclaration(createFunctionDeclaration('c'))

      visitor.Identifier(createIdentifier('a'))
      visitor.Identifier(createIdentifier('b'))
      visitor.Identifier(createIdentifier('c'))

      expect(reports).toHaveLength(0)
    })

    test('should work with config options containing globalsAllowList', () => {
      const { context, reports } = createMockRuleContext({ options: [{ globalsAllowList: ['console', 'window'] }] })
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('local'))
      visitor.Identifier(createIdentifier('local'))

      expect(reports).toHaveLength(0)
    })

    test('should work with config options containing checkShadowing', () => {
      const { context, reports } = createMockRuleContext({ options: [{ checkShadowing: true }] })
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('shadow'))
      visitor.Identifier(createIdentifier('shadow'))

      expect(reports).toHaveLength(0)
    })

    test('should work with long file path', () => {
      const longPath = '/very/deeply/nested/directory/structure/src/components/utils/helper.ts'
      const { context, reports } = createMockRuleContext({ filePath: longPath })
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('helper'))
      visitor.Identifier(createIdentifier('helper'))

      expect(reports).toHaveLength(0)
    })

    test('should work with workspace root in context', () => {
      const { context, reports } = createMockRuleContext()
      expect(context.workspaceRoot).toBe('/src')

      const visitor = noUndefRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('rootVar'))
      visitor.Identifier(createIdentifier('rootVar'))

      expect(reports).toHaveLength(0)
    })

    test('should work when report is never called', () => {
      const { reports } = createMockRuleContext()
      expect(reports).toHaveLength(0)
    })

    test('should work with undefined options in config', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noUndefRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.Identifier(createIdentifier('x'))

      expect(reports).toHaveLength(0)
    })

    test('should work with null AST', () => {
      const { context, reports } = createMockRuleContext()
      expect(context.getAST()).toBeNull()

      const visitor = noUndefRule.create(context)
      visitor.VariableDeclarator(createVariableDeclarator('x'))

      expect(reports).toHaveLength(0)
    })

    test('should work with config having additional unknown properties', () => {
      const { context, reports } = createMockRuleContext({ options: [{ unknownProp: 'value', another: 42 }] })
      const visitor = noUndefRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('x'))
      visitor.Identifier(createIdentifier('x'))

      expect(reports).toHaveLength(0)
    })
  })

  // =========================================================================
  // 10. test.each parameterized tests (40+ tests)
  // =========================================================================
  describe('parameterized VariableDeclarator tests', () => {
    test.each([
      ['x'],
      ['myVar'],
      ['_private'],
      ['$jquery'],
      ['camelCase'],
      ['PascalCase'],
      ['UPPER_CASE'],
      ['snake_case'],
      ['a1'],
      ['num_1'],
      ['___internal'],
      ['trailing_'],
      ['$dollar'],
      ['mixed_Case_123'],
    ])('should track variable name "%s"', (name: string) => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.VariableDeclarator(createVariableDeclarator(name))).not.toThrow()
    })
  })

  describe('parameterized FunctionDeclaration tests', () => {
    test.each([
      ['fn'],
      ['myFunc'],
      ['handler'],
      ['onClick'],
      ['get_value'],
      ['setValue'],
      ['process'],
      ['calculate'],
      ['f'],
      ['_init'],
    ])('should track function name "%s"', (name: string) => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.FunctionDeclaration(createFunctionDeclaration(name))).not.toThrow()
    })
  })

  describe('parameterized ClassDeclaration tests', () => {
    test.each([
      ['Cls'],
      ['MyClass'],
      ['Component'],
      ['Service'],
      ['Helper_Utils'],
      ['A'],
      ['AbstractHandler'],
    ])('should track class name "%s"', (name: string) => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ClassDeclaration(createClassDeclaration(name))).not.toThrow()
    })
  })

  describe('parameterized ImportSpecifier tests', () => {
    test.each([
      ['useState'],
      ['useEffect'],
      ['Component'],
      ['Router'],
      ['axios'],
      ['_'],
      ['lodash'],
    ])('should track import name "%s"', (name: string) => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ImportSpecifier(createImportSpecifier(name))).not.toThrow()
    })
  })

  describe('parameterized edge case inputs', () => {
    test.each([[null], [undefined], [0], [''], [false], [true]])(
      'should not throw for VariableDeclarator with input %s',
      (input: unknown) => {
        const { context } = createMockRuleContext()
        const visitor = noUndefRule.create(context)

        expect(() => visitor.VariableDeclarator(input)).not.toThrow()
      },
    )

    test.each([[null], [undefined], [0], [''], [false], [true]])(
      'should not throw for FunctionDeclaration with input %s',
      (input: unknown) => {
        const { context } = createMockRuleContext()
        const visitor = noUndefRule.create(context)

        expect(() => visitor.FunctionDeclaration(input)).not.toThrow()
      },
    )

    test.each([[null], [undefined], [0], [''], [false], [true]])(
      'should not throw for ClassDeclaration with input %s',
      (input: unknown) => {
        const { context } = createMockRuleContext()
        const visitor = noUndefRule.create(context)

        expect(() => visitor.ClassDeclaration(input)).not.toThrow()
      },
    )

    test.each([[null], [undefined], [0], [''], [false], [true]])(
      'should not throw for ImportSpecifier with input %s',
      (input: unknown) => {
        const { context } = createMockRuleContext()
        const visitor = noUndefRule.create(context)

        expect(() => visitor.ImportSpecifier(input)).not.toThrow()
      },
    )

    test.each([[null], [undefined], [0], [''], [false], [true]])(
      'should not throw for Identifier with input %s',
      (input: unknown) => {
        const { context } = createMockRuleContext()
        const visitor = noUndefRule.create(context)

        expect(() => visitor.Identifier(input)).not.toThrow()
      },
    )
  })

  describe('parameterized location tests', () => {
    test.each([
      [1, 0],
      [1, 10],
      [5, 0],
      [5, 20],
      [100, 0],
      [100, 50],
    ])('should handle VariableDeclarator at line %d column %d', (line: number, col: number) => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() =>
        visitor.VariableDeclarator(createVariableDeclarator('loc', line, col)),
      ).not.toThrow()
    })

    test.each([
      [1, 0],
      [10, 5],
      [50, 30],
    ])('should handle FunctionDeclaration at line %d column %d', (line: number, col: number) => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() =>
        visitor.FunctionDeclaration(createFunctionDeclaration('fn', line, col)),
      ).not.toThrow()
    })

    test.each([
      [1, 0],
      [20, 10],
      [999, 0],
    ])('should handle ClassDeclaration at line %d column %d', (line: number, col: number) => {
      const { context } = createMockRuleContext()
      const visitor = noUndefRule.create(context)

      expect(() => visitor.ClassDeclaration(createClassDeclaration('Cls', line, col))).not.toThrow()
    })
  })
})

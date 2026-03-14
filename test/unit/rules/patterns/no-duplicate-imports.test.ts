import { describe, test, expect, vi } from 'vitest'
import { noDuplicateImportsRule } from '../../../../src/rules/patterns/no-duplicate-imports.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'import { a } from "module";',
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

function createImportDeclaration(module: string, line = 1, column = 0): unknown {
  return {
    type: 'ImportDeclaration',
    source: {
      type: 'Literal',
      value: module,
    },
    specifiers: [],
    loc: {
      start: { line, column },
      end: { line, column: module.length + 10 },
    },
  }
}

function createProgram(): unknown {
  return {
    type: 'Program',
    body: [],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 1 },
    },
  }
}

describe('no-duplicate-imports rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noDuplicateImportsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noDuplicateImportsRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noDuplicateImportsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noDuplicateImportsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noDuplicateImportsRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noDuplicateImportsRule.meta.fixable).toBe('code')
    })

    test('should mention duplicate in description', () => {
      expect(noDuplicateImportsRule.meta.docs?.description.toLowerCase()).toContain('duplicate')
    })

    test('should mention imports in description', () => {
      expect(noDuplicateImportsRule.meta.docs?.description.toLowerCase()).toContain('import')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      expect(visitor).toHaveProperty('Program')
      expect(visitor).toHaveProperty('ImportDeclaration')
    })
  })

  describe('detecting duplicate imports', () => {
    test('should report duplicate imports from same module', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('lodash')
      expect(reports[0].message).toContain('combined')
    })

    test('should report multiple duplicate imports', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 3, 0))

      expect(reports.length).toBe(2)
    })

    test('should not report single import', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report imports from different modules', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('react', 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should detect duplicates across multiple modules', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('react', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 3, 0))
      visitor.ImportDeclaration(createImportDeclaration('react', 4, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 5, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('error messages', () => {
    test('should include module name in error message', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports[0].message).toMatch(/'lodash'/)
    })

    test('should suggest combining imports', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports[0].message).toContain('combined')
    })

    test('should mention single import statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports[0].message).toContain('single import statement')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      expect(() => visitor.ImportDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      expect(() => visitor.ImportDeclaration(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      expect(() => visitor.ImportDeclaration('string')).not.toThrow()
      expect(() => visitor.ImportDeclaration(123)).not.toThrow()
    })

    test('should handle node without source', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        specifiers: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: {
          type: 'Literal',
          value: 'lodash',
        },
        specifiers: [],
      })

      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: {
          type: 'Literal',
          value: 'lodash',
        },
        specifiers: [],
      })

      expect(reports.length).toBe(1)

      expect(() => visitor.ImportDeclaration({})).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with non-Literal source', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: {
          type: 'Identifier',
          name: 'moduleName',
        },
        specifiers: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with non-string source value', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: {
          type: 'Literal',
          value: 123,
        },
        specifiers: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

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
        getSource: () => 'import { a } from "module";',
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

      const visitor = noDuplicateImportsRule.create(context)

      expect(() => {
        visitor.Program(createProgram())
        visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
        visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))
      }).not.toThrow()

      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 10, 5))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 15, 10))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should reset state between Program visits', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports.length).toBe(1)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 3, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('different module types', () => {
    test('should detect duplicate relative imports', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('./utils', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('./utils', 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('./utils')
    })

    test('should detect duplicate npm package imports', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('@angular/core', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('@angular/core', 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('@angular/core')
    })

    test('should detect duplicate absolute path imports', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('/absolute/path', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('/absolute/path', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should treat similar but different paths as distinct', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('./utils', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('./utils/index', 2, 0))

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple import patterns', () => {
    test('should detect duplicates with mixed import types', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('react', 3, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 4, 0))

      expect(reports.length).toBe(2)
    })

    test('should handle module names with special characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('@angular/core', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('@angular/core', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle module names with file extensions', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('./utils.ts', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('./utils.ts', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested module paths', () => {
      const { context, reports } = createMockContext()
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('../../utils/helpers', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('../../utils/helpers', 2, 0))

      expect(reports.length).toBe(1)
    })
  })
})

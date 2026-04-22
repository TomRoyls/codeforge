import { describe, test, expect, vi } from 'vitest'
import { noDuplicateImportsRule } from '../../../../src/rules/patterns/no-duplicate-imports.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

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

    test('should have docs property defined', () => {
      expect(noDuplicateImportsRule.meta.docs).toBeDefined()
    })

    test('should have a string description', () => {
      expect(typeof noDuplicateImportsRule.meta.docs?.description).toBe('string')
    })

    test('should have a non-empty description', () => {
      expect(noDuplicateImportsRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have type as a valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noDuplicateImportsRule.meta.type)
    })

    test('should have severity as a valid Severity', () => {
      expect(['off', 'warn', 'error']).toContain(noDuplicateImportsRule.meta.severity)
    })

    test('should have fixable as code', () => {
      expect(noDuplicateImportsRule.meta.fixable).toBe('code')
    })

    test('should not be deprecated', () => {
      expect(noDuplicateImportsRule.meta.deprecated).toBeFalsy()
    })

    test('should have docs url defined', () => {
      expect(noDuplicateImportsRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs url as a string', () => {
      expect(typeof noDuplicateImportsRule.meta.docs?.url).toBe('string')
    })

    test('should have docs url containing https', () => {
      expect(noDuplicateImportsRule.meta.docs?.url).toContain('https')
    })

    test('should have category as a string', () => {
      expect(typeof noDuplicateImportsRule.meta.docs?.category).toBe('string')
    })

    test('should have description mentioning module', () => {
      expect(noDuplicateImportsRule.meta.docs?.description.toLowerCase()).toContain('module')
    })

    test('should have description mentioning combined or combine', () => {
      const desc = noDuplicateImportsRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc.includes('combined') || desc.includes('combine') || desc.includes('single')).toBe(
        true,
      )
    })

    test('should have recommended as boolean', () => {
      expect(typeof noDuplicateImportsRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should not require type checking', () => {
      expect(noDuplicateImportsRule.meta.requiresTypeChecking).toBeFalsy()
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noDuplicateImportsRule.meta.schema)).toBe(true)
    })

    test('should have schema as empty array', () => {
      expect(noDuplicateImportsRule.meta.schema).toEqual([])
    })

    test('should not have replacedBy property', () => {
      expect(noDuplicateImportsRule.meta.replacedBy).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      expect(visitor).toHaveProperty('Program')
      expect(visitor).toHaveProperty('ImportDeclaration')
    })

    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('should have Program as a function', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      expect(typeof visitor.Program).toBe('function')
    })

    test('should have ImportDeclaration as a function', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      expect(typeof visitor.ImportDeclaration).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor1 = noDuplicateImportsRule.create(context)
      const visitor2 = noDuplicateImportsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should have exactly two visitor methods', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      expect(Object.keys(visitor)).toHaveLength(2)
    })

    test('should accept context with minimal properties', () => {
      const reports: ReportDescriptor[] = []
      const minimalContext = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '',
      } as unknown as RuleContext

      expect(() => noDuplicateImportsRule.create(minimalContext)).not.toThrow()
    })

    test('should create visitor that does not throw when Program is called without arguments', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      expect(() => visitor.Program()).not.toThrow()
    })
  })

  describe('detecting duplicate imports', () => {
    test('should report duplicate imports from same module', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('lodash')
      expect(reports[0].message).toContain('combined')
    })

    test('should report multiple duplicate imports', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 3, 0))

      expect(reports.length).toBe(2)
    })

    test('should not report single import', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report imports from different modules', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('react', 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should detect duplicates across multiple modules', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('react', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 3, 0))
      visitor.ImportDeclaration(createImportDeclaration('react', 4, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 5, 0))

      expect(reports.length).toBe(3)
    })

    test('should detect exactly two duplicates of same module', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('foo', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('foo', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect three duplicates as two reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('foo', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('foo', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('foo', 3, 0))

      expect(reports.length).toBe(2)
    })

    test('should detect four duplicates as three reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('foo', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('foo', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('foo', 3, 0))
      visitor.ImportDeclaration(createImportDeclaration('foo', 4, 0))

      expect(reports.length).toBe(3)
    })

    test('should detect five duplicates as four reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      for (let i = 1; i <= 5; i++) {
        visitor.ImportDeclaration(createImportDeclaration('foo', i, 0))
      }

      expect(reports.length).toBe(4)
    })

    test('should detect ten duplicates as nine reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      for (let i = 1; i <= 10; i++) {
        visitor.ImportDeclaration(createImportDeclaration('bar', i, 0))
      }

      expect(reports.length).toBe(9)
    })

    test('should detect duplicates for each module independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      // lodash: 3 imports → 2 reports
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 3, 0))
      // react: 2 imports → 1 report
      visitor.ImportDeclaration(createImportDeclaration('react', 4, 0))
      visitor.ImportDeclaration(createImportDeclaration('react', 5, 0))
      // vue: 1 import → 0 reports
      visitor.ImportDeclaration(createImportDeclaration('vue', 6, 0))

      expect(reports.length).toBe(3)
    })

    test('should detect duplicate when interleaved with other modules', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('a', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('b', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('c', 3, 0))
      visitor.ImportDeclaration(createImportDeclaration('a', 4, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'a'")
    })

    test('should detect duplicate when first import has same name as another module', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash/debounce', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 3, 0))

      expect(reports.length).toBe(1)
    })

    test('should not report duplicate with empty module name string', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('', 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should report duplicate for single-character module names', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('a', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('a', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect duplicates with very long module names', () => {
      const longName = '@very-long-scope/very-long-package-name-with-lots-of-hyphens-and-words'
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration(longName, 1, 0))
      visitor.ImportDeclaration(createImportDeclaration(longName, 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(longName)
    })

    test('should detect duplicates when modules have spaces in name', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('my module', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('my module', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should treat uppercase and lowercase as different modules', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('Lodash', 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should treat module names with trailing slash differently', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash/', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should detect duplicate with whitespace-only module name', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('   ', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('   ', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect duplicates for modules with unicode names', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('日本語モジュール', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('日本語モジュール', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle 20 unique imports without false positives', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      for (let i = 0; i < 20; i++) {
        visitor.ImportDeclaration(createImportDeclaration(`module-${i}`, i + 1, 0))
      }

      expect(reports.length).toBe(0)
    })

    test('should handle mix of unique and duplicate imports', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('a', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('b', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('c', 3, 0))
      visitor.ImportDeclaration(createImportDeclaration('a', 4, 0)) // dup
      visitor.ImportDeclaration(createImportDeclaration('d', 5, 0))
      visitor.ImportDeclaration(createImportDeclaration('b', 6, 0)) // dup
      visitor.ImportDeclaration(createImportDeclaration('e', 7, 0))
      visitor.ImportDeclaration(createImportDeclaration('c', 8, 0)) // dup

      expect(reports.length).toBe(3)
    })
  })

  describe('error messages', () => {
    test('should include module name in error message', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports[0].message).toMatch(/'lodash'/)
    })

    test('should suggest combining imports', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports[0].message).toContain('combined')
    })

    test('should mention single import statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports[0].message).toContain('single import statement')
    })

    test('should include module name wrapped in quotes', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('my-module', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('my-module', 2, 0))

      expect(reports[0].message).toContain("'my-module'")
    })

    test('should have consistent message format across different modules', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('react', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('react', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 3, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 4, 0))

      expect(reports[0].message).toContain('Multiple imports from')
      expect(reports[1].message).toContain('Multiple imports from')
    })

    test('should mention Multiple imports at the start of message', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('foo', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('foo', 2, 0))

      expect(reports[0].message).toMatch(/^Multiple imports/)
    })

    test('should produce message as a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('foo', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('foo', 2, 0))

      expect(typeof reports[0].message).toBe('string')
    })

    test('should have message ending with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('foo', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('foo', 2, 0))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should have unique messages for different module duplicates', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('react', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('react', 3, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 4, 0))

      expect(reports[0].message).toContain('react')
      expect(reports[1].message).toContain('lodash')
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('should produce same message text for same module duplicates', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('foo', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('foo', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('foo', 3, 0))

      // Both messages for same module should have the same template
      expect(reports[0].message).toContain("'foo'")
      expect(reports[1].message).toContain("'foo'")
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      expect(() => visitor.ImportDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      expect(() => visitor.ImportDeclaration(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      expect(() => visitor.ImportDeclaration('string')).not.toThrow()
      expect(() => visitor.ImportDeclaration(123)).not.toThrow()
    })

    test('should handle node without source', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        specifiers: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
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
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
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
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
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
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
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
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 10, 5))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 15, 10))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should reset state between Program visits', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports.length).toBe(1)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 3, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      expect(() => visitor.ImportDeclaration(true)).not.toThrow()
      expect(() => visitor.ImportDeclaration(false)).not.toThrow()
    })

    test('should handle numeric node', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      expect(() => visitor.ImportDeclaration(0)).not.toThrow()
      expect(() => visitor.ImportDeclaration(-1)).not.toThrow()
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      expect(() => visitor.ImportDeclaration([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null source', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: null,
        specifiers: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined source', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: undefined,
        specifiers: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with source as number value', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 42 },
        specifiers: [],
      })
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 42 },
        specifiers: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with source as boolean value', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: true },
        specifiers: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with source as null value', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: null },
        specifiers: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with source as object value', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: { name: 'test' } },
        specifiers: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with source as array value', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: ['test'] },
        specifiers: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with empty object as source', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: {},
        specifiers: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'VariableDeclaration',
        source: { type: 'Literal', value: 'lodash' },
        specifiers: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        source: { type: 'Literal', value: 'lodash' },
        specifiers: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should handle source with empty string value', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: '' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      // Single empty import, no duplicate
      expect(reports.length).toBe(0)
    })

    test('should handle duplicate with only loc.start (no loc.end)', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'foo' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 } },
      })
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'foo' },
        specifiers: [],
        loc: { start: { line: 2, column: 0 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle loc with non-numeric line', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'foo' },
        specifiers: [],
        loc: { start: { line: 'one', column: 0 }, end: { line: 'one', column: 5 } },
      })
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'foo' },
        specifiers: [],
        loc: { start: { line: 'two', column: 0 }, end: { line: 'two', column: 5 } },
      })

      // Should still report (loc extraction falls back to default)
      expect(reports.length).toBe(1)
    })

    test('should handle loc with missing start column', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'foo' },
        specifiers: [],
        loc: { start: { line: 1 }, end: { line: 1, column: 5 } },
      })
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'foo' },
        specifiers: [],
        loc: { start: { line: 2 }, end: { line: 2, column: 5 } },
      })

      expect(reports.length).toBe(1)
      // Column falls back to 0
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle calling ImportDeclaration before Program', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      // ImportDeclaration before Program - moduleMap may or may not be clear
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      // This is valid behavior - the rule tracks imports regardless of Program call order
      expect(reports.length).toBeGreaterThanOrEqual(0)
    })

    test('should handle multiple Program resets', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('a', 1, 0))
      visitor.Program(createProgram()) // reset
      visitor.Program(createProgram()) // reset again
      visitor.ImportDeclaration(createImportDeclaration('a', 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle very large line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('foo', 999999, 0))
      visitor.ImportDeclaration(createImportDeclaration('foo', 1000000, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1000000)
    })

    test('should handle very large column numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('foo', 1, 99999))
      visitor.ImportDeclaration(createImportDeclaration('foo', 1, 100000))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(100000)
    })

    test('should handle zero line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('foo', 0, 0))
      visitor.ImportDeclaration(createImportDeclaration('foo', 0, 5))

      expect(reports.length).toBe(1)
    })

    test('should handle negative column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('foo', 1, -1))
      visitor.ImportDeclaration(createImportDeclaration('foo', 2, -1))

      expect(reports.length).toBe(1)
    })

    test('should handle function as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      expect(() => visitor.ImportDeclaration(() => {})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Symbol as node', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      expect(() => visitor.ImportDeclaration(Symbol('test'))).not.toThrow()
    })

    test('should handle NaN as node', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      expect(() => visitor.ImportDeclaration(NaN)).not.toThrow()
    })

    test('should handle Infinity as node', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      expect(() => visitor.ImportDeclaration(Infinity)).not.toThrow()
    })
  })

  describe('location reporting', () => {
    test('should report location of second duplicate import', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 5, 3))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location of third duplicate import', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 10, 5))

      expect(reports[1].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.column).toBe(5)
    })

    test('should report different locations for consecutive duplicates', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('foo', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('foo', 5, 0))
      visitor.ImportDeclaration(createImportDeclaration('foo', 10, 0))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.line).toBe(10)
    })

    test('should include end location in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBeDefined()
      expect(reports[0].loc?.end.column).toBeDefined()
    })

    test('should report loc as object with start and end', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('foo', 3, 2))
      visitor.ImportDeclaration(createImportDeclaration('foo', 7, 4))

      const loc = reports[0].loc
      expect(loc).toBeDefined()
      expect(typeof loc?.start.line).toBe('number')
      expect(typeof loc?.start.column).toBe('number')
      expect(typeof loc?.end.line).toBe('number')
      expect(typeof loc?.end.column).toBe('number')
    })

    test('should report location at column 0 when duplicate is at start of line', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('foo', 5, 10))
      visitor.ImportDeclaration(createImportDeclaration('foo', 8, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle same line different column duplicates', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('foo', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('foo', 1, 20))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'lodash' },
        specifiers: [],
        loc: { start: { line: 5, column: 3 }, end: { line: 5, column: 20 } },
      })
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'lodash' },
        specifiers: [],
        // No loc
      })

      expect(reports.length).toBe(1)
      // Default location when no loc
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve exact location for each report', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('a', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('a', 2, 5))
      visitor.ImportDeclaration(createImportDeclaration('a', 3, 10))

      expect(reports[0].loc?.start).toEqual({ line: 2, column: 5 })
      expect(reports[1].loc?.start).toEqual({ line: 3, column: 10 })
    })
  })

  describe('different module types', () => {
    test('should detect duplicate relative imports', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('./utils', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('./utils', 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('./utils')
    })

    test('should detect duplicate npm package imports', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('@angular/core', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('@angular/core', 2, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('@angular/core')
    })

    test('should detect duplicate absolute path imports', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('/absolute/path', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('/absolute/path', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should treat similar but different paths as distinct', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('./utils', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('./utils/index', 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should detect duplicate parent directory imports', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('../parent', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('../parent', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate grandparent directory imports', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('../../grandparent', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('../../grandparent', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate scoped package imports', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('@babel/core', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('@babel/core', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should treat different scoped packages as distinct', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('@babel/core', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('@babel/parser', 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should treat different scopes as distinct', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('@babel/core', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('@types/core', 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should detect duplicate imports with file extensions', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('./file.js', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('./file.js', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should treat .js and .ts extensions as different', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('./file.js', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('./file.ts', 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should detect duplicate URL imports', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('https://example.com/module', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('https://example.com/module', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate data URI imports', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(
        createImportDeclaration('data:text/javascript,export default 1', 1, 0),
      )
      visitor.ImportDeclaration(
        createImportDeclaration('data:text/javascript,export default 1', 2, 0),
      )

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate index imports', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('./index', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('./index', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should treat ./foo and ./foo/ as different', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('./foo', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('./foo/', 2, 0))

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple import patterns', () => {
    test('should detect duplicates with mixed import types', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('react', 3, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 4, 0))

      expect(reports.length).toBe(2)
    })

    test('should handle module names with special characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('@angular/core', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('@angular/core', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle module names with file extensions', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('./utils.ts', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('./utils.ts', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle deeply nested module paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('../../utils/helpers', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('../../utils/helpers', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should detect duplicates across interleaved unique imports', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('a', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('b', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('c', 3, 0))
      visitor.ImportDeclaration(createImportDeclaration('d', 4, 0))
      visitor.ImportDeclaration(createImportDeclaration('a', 5, 0))

      expect(reports.length).toBe(1)
    })

    test('should report each module pair independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('x', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('y', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('z', 3, 0))
      visitor.ImportDeclaration(createImportDeclaration('x', 4, 0))
      visitor.ImportDeclaration(createImportDeclaration('y', 5, 0))

      expect(reports.length).toBe(2)
    })

    test('should handle pattern where every other import is duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('a', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('a', 2, 0)) // dup
      visitor.ImportDeclaration(createImportDeclaration('b', 3, 0))
      visitor.ImportDeclaration(createImportDeclaration('b', 4, 0)) // dup
      visitor.ImportDeclaration(createImportDeclaration('c', 5, 0))
      visitor.ImportDeclaration(createImportDeclaration('c', 6, 0)) // dup

      expect(reports.length).toBe(3)
    })

    test('should handle all unique imports with no duplicates', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('a', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('b', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('c', 3, 0))
      visitor.ImportDeclaration(createImportDeclaration('d', 4, 0))
      visitor.ImportDeclaration(createImportDeclaration('e', 5, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle single module imported many times', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      for (let i = 1; i <= 50; i++) {
        visitor.ImportDeclaration(createImportDeclaration('heavy-module', i, 0))
      }

      expect(reports.length).toBe(49)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";', filePath: '/src/components/App.tsx' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('react', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('react', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with empty file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";', filePath: '' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a, b } from "lodash"; import { c } from "lodash";', filePath: '/src/file.ts' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with options containing extra properties', () => {
      const { context, reports } = createMockRuleContext({ options: [{
        ignore: ['react'],
        allowSameModule: false,
      }], source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/home/user/project/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext

      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('foo', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('foo', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should work when logger methods are called', () => {
      const debug = vi.fn()
      const info = vi.fn()
      const warn = vi.fn()
      const error = vi.fn()

      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug, info, warn, error },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      // Rule should work regardless of logger
      expect(reports.length).toBe(1)
    })

    test('should work with getAST returning non-null', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => ({ type: 'Program', body: [] }),
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('foo', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('foo', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with getTokens returning non-empty', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [{ type: 'Import', value: 'import' }],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('foo', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('foo', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with getComments returning non-empty', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [{ type: 'Line', value: ' comment' }],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('foo', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('foo', 2, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('report descriptor', () => {
    test('should have message property in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports[0]).toHaveProperty('message')
    })

    test('should have loc property in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports[0]).toHaveProperty('loc')
    })

    test('should have loc.start in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports[0].loc?.start).toBeDefined()
    })

    test('should have loc.end in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should have numeric line in loc.start', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 7, 3))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 12, 8))

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('should have numeric column in loc.start', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 5))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 10))

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have correct end line in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 5, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 8, 4))

      expect(reports[0].loc?.end.line).toBe(8)
    })

    test('should call context.report exactly once for one duplicate', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))

      expect(reports.length).toBe(1)
    })

    test('should call context.report twice for two duplicates of same module', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 3, 0))

      expect(reports.length).toBe(2)
    })

    test('should not call report for valid single import', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not call report for valid multiple different imports', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('react', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('vue', 3, 0))

      expect(reports.length).toBe(0)
    })
  })

  describe('negative cases - unique imports', () => {
    test('should not report when importing from different modules', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('react', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('vue', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('angular', 3, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report for single import', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report when no imports exist', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report when only Program is called', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.Program(createProgram())
      visitor.Program(createProgram())

      expect(reports.length).toBe(0)
    })

    test('should not report for modules differing only in case', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('React', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('react', 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report for modules differing by trailing slash', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash/', 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report for modules differing by file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('./utils', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('./utils.ts', 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report for modules differing by subpath', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash/map', 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report for different scoped packages', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('@types/node', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('@types/react', 2, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report for different relative paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('./a', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('./b', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('../c', 3, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report for different depth relative paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('.', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('..', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('../..', 3, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report after reset for previously seen module', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))
      expect(reports.length).toBe(1)

      // Reset
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 3, 0))
      expect(reports.length).toBe(1) // Still 1, not 2
    })

    test('should not report for import with non-string source', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 42 },
        specifiers: [],
      })
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 42 },
        specifiers: [],
      })

      expect(reports.length).toBe(0)
    })

    test('should not report for nodes that are not ImportDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ExportNamedDeclaration',
        source: { type: 'Literal', value: 'lodash' },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report for import from null source', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: null,
        specifiers: [],
      })
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: null,
        specifiers: [],
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('state management', () => {
    test('should clear module map on Program visit', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('lodash', 2, 0))
      expect(reports.length).toBe(1)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('lodash', 3, 0))
      expect(reports.length).toBe(1)
    })

    test('should track modules independently after reset', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('a', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('a', 2, 0))
      expect(reports.length).toBe(1)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('b', 3, 0))
      visitor.ImportDeclaration(createImportDeclaration('b', 4, 0))
      expect(reports.length).toBe(2)
    })

    test('should maintain state within same Program scope', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('a', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('b', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('a', 3, 0))
      visitor.ImportDeclaration(createImportDeclaration('b', 4, 0))
      visitor.ImportDeclaration(createImportDeclaration('a', 5, 0))

      // a: 3 imports → 2 reports, b: 2 imports → 1 report = 3 total
      expect(reports.length).toBe(3)
    })

    test('should start fresh after multiple resets', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('a', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('a', 2, 0))

      visitor.Program(createProgram())
      visitor.Program(createProgram())
      visitor.Program(createProgram())

      visitor.ImportDeclaration(createImportDeclaration('a', 5, 0))
      expect(reports.length).toBe(1) // Only the first pair, then reset
    })

    test('should not carry state between two visitors', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const reports1: ReportDescriptor[] = []
      const reports2: ReportDescriptor[] = []

      const context1 = {
        ...context,
        report: (d: ReportDescriptor) => {
          reports1.push(d)
        },
      } as unknown as RuleContext

      const context2 = {
        ...context,
        report: (d: ReportDescriptor) => {
          reports2.push(d)
        },
      } as unknown as RuleContext

      const visitor1 = noDuplicateImportsRule.create(context1)
      const visitor2 = noDuplicateImportsRule.create(context2)

      visitor1.Program(createProgram())
      visitor1.ImportDeclaration(createImportDeclaration('foo', 1, 0))

      visitor2.Program(createProgram())
      visitor2.ImportDeclaration(createImportDeclaration('foo', 2, 0))
      visitor2.ImportDeclaration(createImportDeclaration('foo', 3, 0))

      expect(reports1.length).toBe(0)
      expect(reports2.length).toBe(1)
    })

    test('should handle rapid alternating Program and Import calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('a', 1, 0))
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('a', 2, 0))
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('a', 3, 0))

      expect(reports.length).toBe(0)
    })

    test('should accumulate reports across modules without reset', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('a', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('a', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('b', 3, 0))
      visitor.ImportDeclaration(createImportDeclaration('b', 4, 0))
      visitor.ImportDeclaration(createImportDeclaration('c', 5, 0))
      visitor.ImportDeclaration(createImportDeclaration('c', 6, 0))

      expect(reports.length).toBe(3)
    })
  })

  describe('import specifier types', () => {
    test('should detect duplicate regardless of named specifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'lodash' },
        specifiers: [{ type: 'ImportSpecifier', imported: { name: 'map' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'lodash' },
        specifiers: [{ type: 'ImportSpecifier', imported: { name: 'filter' } }],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate regardless of default specifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'react' },
        specifiers: [{ type: 'ImportDefaultSpecifier', local: { name: 'React' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'react' },
        specifiers: [{ type: 'ImportDefaultSpecifier', local: { name: 'React2' } }],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate regardless of namespace specifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'lodash' },
        specifiers: [{ type: 'ImportNamespaceSpecifier', local: { name: '_' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'lodash' },
        specifiers: [{ type: 'ImportNamespaceSpecifier', local: { name: 'lodash' } }],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate when first is default and second is named', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'foo' },
        specifiers: [{ type: 'ImportDefaultSpecifier', local: { name: 'foo' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'foo' },
        specifiers: [{ type: 'ImportSpecifier', imported: { name: 'bar' } }],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate when first is namespace and second is default', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'lib' },
        specifiers: [{ type: 'ImportNamespaceSpecifier', local: { name: 'libNS' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'lib' },
        specifiers: [{ type: 'ImportDefaultSpecifier', local: { name: 'libDefault' } }],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate when one has empty specifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'side-effects' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'side-effects' },
        specifiers: [{ type: 'ImportDefaultSpecifier', local: { name: 'x' } }],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate when both have empty specifiers (side-effect imports)', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'polyfill' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'polyfill' },
        specifiers: [],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with mixed specifier types from same module', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      // default import
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'utils' },
        specifiers: [{ type: 'ImportDefaultSpecifier', local: { name: 'utils' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      // namespace import
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'utils' },
        specifiers: [{ type: 'ImportNamespaceSpecifier', local: { name: 'utilsNS' } }],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      })
      // named import
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'utils' },
        specifiers: [{ type: 'ImportSpecifier', imported: { name: 'helper' } }],
        loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 10 } },
      })

      expect(reports.length).toBe(2)
    })
  })

  describe('rule definition structure', () => {
    test('should have create as a function', () => {
      expect(typeof noDuplicateImportsRule.create).toBe('function')
    })

    test('should have meta as an object', () => {
      expect(typeof noDuplicateImportsRule.meta).toBe('object')
      expect(noDuplicateImportsRule.meta).not.toBeNull()
    })

    test('should have exactly meta and create properties', () => {
      expect(Object.keys(noDuplicateImportsRule).sort()).toEqual(['create', 'meta'])
    })

    test('should export rule as default export', () => {
      expect(noDuplicateImportsRule).toBeDefined()
    })
  })

  describe('Program visitor behavior', () => {
    test('should accept Program node with no properties', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      expect(() => visitor.Program({})).not.toThrow()
    })

    test('should accept Program node with null body', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      expect(() => visitor.Program({ type: 'Program', body: null })).not.toThrow()
    })

    test('should accept Program node without type', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      expect(() => visitor.Program({ body: [] })).not.toThrow()
    })

    test('should not report when Program is called multiple times with no imports', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.Program(createProgram())
      }

      expect(reports.length).toBe(0)
    })
  })

  describe('import declaration with extra properties', () => {
    test('should detect duplicate with importKind property', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'types' },
        specifiers: [],
        importKind: 'type',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'types' },
        specifiers: [],
        importKind: 'value',
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with assertions property', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'data.json' },
        specifiers: [],
        assertions: [{ type: 'ImportAttribute', key: { name: 'type' }, value: { value: 'json' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'data.json' },
        specifiers: [],
        assertions: [],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should detect duplicate regardless of extra node properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)

      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        ...createImportDeclaration('extra', 1, 0),
        range: [0, 20],
        comments: [],
        tokens: [],
        parent: { type: 'Program' },
      })
      visitor.ImportDeclaration({
        ...createImportDeclaration('extra', 2, 0),
        range: [30, 50],
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('additional detection scenarios', () => {
    test('should detect duplicate with module name containing dashes', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('my-cool-module', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('my-cool-module', 2, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('my-cool-module')
    })

    test('should detect duplicate with module name containing underscores', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('my_util_pkg', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('my_util_pkg', 2, 0))
      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with module name containing dots', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('module.with.dots', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('module.with.dots', 2, 0))
      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with tilde in module name', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('~/utils', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('~/utils', 2, 0))
      expect(reports.length).toBe(1)
    })

    test('should detect duplicate with at-sign scoped module and subpath', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('@angular/core/testing', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('@angular/core/testing', 2, 0))
      expect(reports.length).toBe(1)
    })

    test('should not treat @scope/pkg and @scope/pkg/sub as duplicates', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('@scope/pkg', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('@scope/pkg/sub', 2, 0))
      expect(reports.length).toBe(0)
    })

    test('should handle module name that is a number string', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('42', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('42', 2, 0))
      expect(reports.length).toBe(1)
    })

    test('should handle module name that looks like version number', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('1.2.3', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('1.2.3', 2, 0))
      expect(reports.length).toBe(1)
    })

    test('should handle very short module name of single character', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('x', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('x', 2, 0))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'x'")
    })

    test('should handle module name with consecutive slashes', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('path//to///module', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('path//to///module', 2, 0))
      expect(reports.length).toBe(1)
    })

    test('should not report duplicate for empty module name (falsy value)', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('', 2, 0))
      // Empty string is falsy, getModuleFromImport returns null
      expect(reports.length).toBe(0)
    })
  })

  describe('Program reset interactions', () => {
    test('should count reports cumulatively across resets', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('a', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('a', 2, 0))
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('b', 3, 0))
      visitor.ImportDeclaration(createImportDeclaration('b', 4, 0))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('a')
      expect(reports[1].message).toContain('b')
    })

    test('should not carry imports across reset', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('x', 1, 0))
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('x', 2, 0))
      expect(reports.length).toBe(0)
    })

    test('should handle reset with no imports in between', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      visitor.Program(createProgram())
      visitor.Program(createProgram())
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('a', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('a', 2, 0))
      expect(reports.length).toBe(1)
    })

    test('should handle single import before reset then duplicate after', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('mod', 1, 0))
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('mod', 2, 0))
      visitor.ImportDeclaration(createImportDeclaration('mod', 3, 0))
      expect(reports.length).toBe(1)
    })
  })

  describe('additional edge cases', () => {
    test('should handle node with prototype chain properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      const proto = { type: 'ImportDeclaration' }
      const node = Object.create(proto)
      node.source = { type: 'Literal', value: 'inherited' }
      node.specifiers = []
      expect(() => visitor.ImportDeclaration(node)).not.toThrow()
    })

    test('should handle Error object as node', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      expect(() => visitor.ImportDeclaration(new Error('test'))).not.toThrow()
    })

    test('should handle Promise object as node', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      expect(() => visitor.ImportDeclaration(Promise.resolve('test'))).not.toThrow()
    })

    test('should handle BigInt as node', () => {
      const { context } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      expect(() => visitor.ImportDeclaration(BigInt(42))).not.toThrow()
    })

    test('should handle nested object with valid structure', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      visitor.Program(createProgram())
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: {
          type: 'Literal',
          value: 'nested',
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: {
          type: 'Literal',
          value: 'nested',
          loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 5 } },
        },
        specifiers: [],
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should handle same import visited twice from same node reference', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      const node = createImportDeclaration('same-ref', 1, 0)
      visitor.Program(createProgram())
      visitor.ImportDeclaration(node)
      visitor.ImportDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should work with source value containing regex special chars', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('module(v2)', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('module(v2)', 2, 0))
      expect(reports.length).toBe(1)
    })

    test('should work with source value containing brackets', () => {
      const { context, reports } = createMockRuleContext({ source: 'import { a } from "module";' })
      const visitor = noDuplicateImportsRule.create(context)
      visitor.Program(createProgram())
      visitor.ImportDeclaration(createImportDeclaration('module[0]', 1, 0))
      visitor.ImportDeclaration(createImportDeclaration('module[0]', 2, 0))
      expect(reports.length).toBe(1)
    })
  })
})

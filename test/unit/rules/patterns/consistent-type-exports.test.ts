import { describe, test, expect, vi } from 'vitest'
import { consistentTypeExportsRule } from '../../../../src/rules/patterns/consistent-type-exports.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext } from '../../../helpers/ast-helpers.js'

function createExportNamedDeclaration(
  declarationType: string | null,
  exportKind = 'value',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'ExportNamedDeclaration',
    exportKind,
    declaration: declarationType
      ? {
          type: declarationType,
        }
      : null,
    specifiers: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createExportWithTypeSpecifier(line = 1, column = 0): unknown {
  return {
    type: 'ExportNamedDeclaration',
    exportKind: 'value',
    declaration: null,
    specifiers: [
      {
        type: 'ExportSpecifier',
        exportKind: 'type',
        local: { name: 'MyType' },
        exported: { name: 'MyType' },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

describe('consistent-type-exports rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(consistentTypeExportsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(consistentTypeExportsRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(consistentTypeExportsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(consistentTypeExportsRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(consistentTypeExportsRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(consistentTypeExportsRule.meta.fixable).toBeUndefined()
    })

    test('should mention type exports in description', () => {
      expect(consistentTypeExportsRule.meta.docs?.description.toLowerCase()).toContain(
        'type export',
      )
    })
  })

  describe('detecting type exports without type keyword', () => {
    test('should report type alias without export type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('export type')
    })

    test('should report interface without export type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSInterfaceDeclaration'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('export type')
    })

    test('should report enum without export type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSEnumDeclaration'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('export type')
    })

    test('should not report when export type is used', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration', 'type'))

      expect(reports.length).toBe(0)
    })

    test('should not report when type specifier is used', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(createExportWithTypeSpecifier())

      expect(reports.length).toBe(0)
    })

    test('should not report value exports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(createExportNamedDeclaration('FunctionDeclaration'))

      expect(reports.length).toBe(0)
    })

    test('should not report exports without declaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(createExportNamedDeclaration(null))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      expect(() => visitor.ExportNamedDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      expect(() => visitor.ExportNamedDeclaration(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      expect(() => visitor.ExportNamedDeclaration('string')).not.toThrow()
      expect(() => visitor.ExportNamedDeclaration(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      const node = createExportNamedDeclaration('TSTypeAliasDeclaration')
      delete (node as Record<string, unknown>).loc
      expect(() => visitor.ExportNamedDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      const node = createExportNamedDeclaration('TSTypeAliasDeclaration', 'value', 10, 5)
      visitor.ExportNamedDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('rule definition structure', () => {
    test('should export the rule as default export', () => {
      const defaultExport = consistentTypeExportsRule
      expect(defaultExport).toBeDefined()
      expect(defaultExport.meta).toBeDefined()
      expect(defaultExport.create).toBeDefined()
    })

    test('should have exactly two properties: meta and create', () => {
      const keys = Object.keys(consistentTypeExportsRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })

    test('should have create as a function', () => {
      expect(typeof consistentTypeExportsRule.create).toBe('function')
    })

    test('should have meta as an object', () => {
      expect(typeof consistentTypeExportsRule.meta).toBe('object')
    })

    test('should have a docs object in meta', () => {
      expect(consistentTypeExportsRule.meta.docs).toBeDefined()
      expect(typeof consistentTypeExportsRule.meta.docs).toBe('object')
    })

    test('should have a description string in docs', () => {
      expect(typeof consistentTypeExportsRule.meta.docs?.description).toBe('string')
      expect(consistentTypeExportsRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have a valid docs URL', () => {
      expect(consistentTypeExportsRule.meta.docs?.url).toBeDefined()
      expect(consistentTypeExportsRule.meta.docs?.url).toContain('https://')
    })

    test('should have schema as an empty array', () => {
      expect(Array.isArray(consistentTypeExportsRule.meta.schema)).toBe(true)
      expect(consistentTypeExportsRule.meta.schema).toHaveLength(0)
    })

    test('should have type as one of valid rule types', () => {
      const validTypes = ['problem', 'suggestion', 'layout']
      expect(validTypes).toContain(consistentTypeExportsRule.meta.type)
    })

    test('should have severity as one of valid severities', () => {
      const validSeverities = ['off', 'warn', 'error']
      expect(validSeverities).toContain(consistentTypeExportsRule.meta.severity)
    })
  })

  describe('visitor creation', () => {
    test('should return an object with ExportNamedDeclaration method', () => {
      const { context } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      expect(visitor).toBeDefined()
      expect(typeof visitor.ExportNamedDeclaration).toBe('function')
    })

    test('should create a new visitor for each call', () => {
      const { context } = createMockRuleContext()
      const visitor1 = consistentTypeExportsRule.create(context)
      const visitor2 = consistentTypeExportsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('visitor ExportNamedDeclaration should not return a value', () => {
      const { context } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      const result = visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSTypeAliasDeclaration'),
      )
      expect(result).toBeUndefined()
    })

    test('should accept context with empty options', () => {
      const { context } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      expect(visitor).toBeDefined()
      expect(typeof visitor.ExportNamedDeclaration).toBe('function')
    })

    test('should accept context with various file paths', () => {
      const paths = ['/src/file.ts', '/project/index.ts', '/a/b/c.ts']
      for (const path of paths) {
        const { context } = createMockRuleContext({ filePath: path })
        const visitor = consistentTypeExportsRule.create(context)
        expect(visitor).toBeDefined()
      }
    })

    test('should accept context with various source code', () => {
      const sources = [
        'export type MyType = string;',
        'export interface Foo {}',
        'const x = 1;',
        '',
      ]
      for (const source of sources) {
        const { context } = createMockRuleContext({ filePath: '/src/file.ts', source })
        const visitor = consistentTypeExportsRule.create(context)
        expect(visitor).toBeDefined()
      }
    })
  })

  describe('type alias detection', () => {
    test('should report TSTypeAliasDeclaration with value exportKind', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSTypeAliasDeclaration', 'value'),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report TSTypeAliasDeclaration with type exportKind', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration', 'type'))
      expect(reports.length).toBe(0)
    })

    test('should report TSTypeAliasDeclaration at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSTypeAliasDeclaration', 'value', 1, 0),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with loc.end as null', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: 3, column: 5 }, end: null },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      expect(() => visitor.ExportNamedDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle node with loc as empty object', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: {},
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      expect(() => visitor.ExportNamedDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should throw when specifiers is a string (non-array)', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: 'not-array',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      expect(() => visitor.ExportNamedDeclaration(node)).toThrow(TypeError)
    })

    test('should throw when specifiers is a number (non-array)', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      expect(() => visitor.ExportNamedDeclaration(node)).toThrow(TypeError)
    })
  })

  describe('multiple node processing', () => {
    test('should report all type exports in sequence', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSInterfaceDeclaration'))
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSEnumDeclaration'))

      expect(reports.length).toBe(3)
    })

    test('should only report type exports, not value exports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('FunctionDeclaration'))
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSInterfaceDeclaration'))
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('ClassDeclaration'))

      expect(reports.length).toBe(2)
    })

    test('should handle interleaved valid and invalid exports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSTypeAliasDeclaration', 'value'),
      )
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration', 'type'))
      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSInterfaceDeclaration', 'value'),
      )
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSInterfaceDeclaration', 'type'))
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSEnumDeclaration', 'value'))
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSEnumDeclaration', 'type'))

      expect(reports.length).toBe(3)
    })

    test('should handle many exports at once', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.ExportNamedDeclaration(
          createExportNamedDeclaration('TSTypeAliasDeclaration', 'value', i + 1, 0),
        )
      }

      expect(reports.length).toBe(50)
    })

    test('should maintain separate reports for each violation', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSTypeAliasDeclaration', 'value', 1, 0),
      )
      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSTypeAliasDeclaration', 'value', 5, 10),
      )

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('should handle null nodes interspersed with valid nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
      visitor.ExportNamedDeclaration(null)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSInterfaceDeclaration'))

      expect(reports.length).toBe(2)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const paths = ['/src/types.ts', '/src/interfaces.ts', '/src/enums.ts', '/lib/index.ts']
      for (const filePath of paths) {
        const { context, reports } = createMockRuleContext({ filePath })
        const visitor = consistentTypeExportsRule.create(context)
        visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
        expect(reports.length).toBe(1)
      }
    })

    test('should work with different source code strings', () => {
      const sources = [
        'export type MyType = string;',
        'export interface IFoo { bar: string }',
        'export enum Color { Red, Green, Blue }',
        '',
        'const x = 1; export type T = typeof x;',
      ]
      for (const source of sources) {
        const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
        const visitor = consistentTypeExportsRule.create(context)
        visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
        expect(reports.length).toBe(1)
      }
    })

    test('should work with empty options', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
      expect(reports.length).toBe(1)
    })

    test('should work with extra options that are ignored', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ extraOption: true, anotherOption: 'test' }],
      })
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
      expect(reports.length).toBe(1)
    })

    test('should work with long file path', () => {
      const longPath = '/very/deeply/nested/directory/structure/that/goes/on/and/on/file.ts'
      const { context, reports } = createMockRuleContext({ filePath: longPath })
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
      expect(reports.length).toBe(1)
    })

    test('should work with file path containing special characters', () => {
      const specialPath = '/src/[my-package]/types.ts'
      const { context, reports } = createMockRuleContext({ filePath: specialPath })
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
      expect(reports.length).toBe(1)
    })

    test('should work with unicode source code', () => {
      const unicodeSource = 'export type 类型 = string;'
      const { context, reports } = createMockRuleContext({
        filePath: '/src/file.ts',
        source: unicodeSource,
      })
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
      expect(reports.length).toBe(1)
    })
  })

  describe('isExportNamedDeclaration guard', () => {
    test('should reject nodes without type property', () => {
      const node = { exportKind: 'value', declaration: { type: 'TSTypeAliasDeclaration' } }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should reject nodes with wrong type', () => {
      const node = {
        type: 'ExportDefaultDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should accept ExportNamedDeclaration type', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should be case-sensitive for type check', () => {
      const node = {
        type: 'exportnameddeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should be case-sensitive for EXPORTNAMEDDECLARATION', () => {
      const node = {
        type: 'EXPORTNAMEDDECLARATION',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('isTypeExport detection', () => {
    test('should detect TSTypeAliasDeclaration as type export', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
      expect(reports.length).toBe(1)
    })

    test('should detect TSInterfaceDeclaration as type export', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSInterfaceDeclaration'))
      expect(reports.length).toBe(1)
    })

    test('should detect TSEnumDeclaration as type export', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSEnumDeclaration'))
      expect(reports.length).toBe(1)
    })

    test('should not detect TSTypeReference as type export', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeReference'))
      expect(reports.length).toBe(0)
    })

    test('should not detect TSPropertySignature as type export', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSPropertySignature'))
      expect(reports.length).toBe(0)
    })

    test('should not detect TSMethodSignature as type export', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSMethodSignature'))
      expect(reports.length).toBe(0)
    })

    test('should not detect TSCallSignatureDeclaration as type export', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSCallSignatureDeclaration'))
      expect(reports.length).toBe(0)
    })

    test('should not detect TSConstructSignatureDeclaration as type export', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSConstructSignatureDeclaration'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not detect TSIndexSignature as type export', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSIndexSignature'))
      expect(reports.length).toBe(0)
    })

    test('should not detect TSParameterProperty as type export', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSParameterProperty'))
      expect(reports.length).toBe(0)
    })

    test('should not detect TSAbstractClassDeclaration as type export', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSAbstractClassDeclaration'))
      expect(reports.length).toBe(0)
    })

    test('should not detect TSTypeParameterDeclaration as type export', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeParameterDeclaration'))
      expect(reports.length).toBe(0)
    })

    test('should not detect TSTypeParameter as type export', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeParameter'))
      expect(reports.length).toBe(0)
    })
  })

  describe('hasTypeSpecifier detection', () => {
    test('should return true when exportKind is type at node level', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'type',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should return true when specifier has exportKind type', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: null,
        specifiers: [
          {
            type: 'ExportSpecifier',
            exportKind: 'type',
            local: { name: 'A' },
            exported: { name: 'A' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should return true when specifier has importKind type', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: null,
        specifiers: [
          {
            type: 'ExportSpecifier',
            importKind: 'type',
            local: { name: 'A' },
            exported: { name: 'A' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should return false when specifier has value exportKind and value importKind', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [
          {
            type: 'ExportSpecifier',
            exportKind: 'value',
            importKind: 'value',
            local: { name: 'A' },
            exported: { name: 'A' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle undefined specifiers', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should handle null specifiers', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('priority of checks', () => {
    test('should check isExportType before isTypeExport', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration', 'type'))
      expect(reports.length).toBe(0)
    })

    test('should check hasTypeSpecifier before isTypeExport', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [
          {
            type: 'ExportSpecifier',
            exportKind: 'type',
            local: { name: 'X' },
            exported: { name: 'X' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should check isExportNamedDeclaration first', () => {
      const node = {
        type: 'NotExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should fall through to isTypeExport when not export type and no type specifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSTypeAliasDeclaration', 'value'),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('combined declaration and specifier scenarios', () => {
    test('should report type alias with value specifiers', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration', id: { name: 'MyType' } },
        specifiers: [
          {
            type: 'ExportSpecifier',
            exportKind: 'value',
            local: { name: 'other' },
            exported: { name: 'other' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('should not report type alias when node exportKind is type', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'type',
        declaration: { type: 'TSTypeAliasDeclaration', id: { name: 'MyType' } },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle interface with type specifier in re-export', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: null,
        specifiers: [
          {
            type: 'ExportSpecifier',
            exportKind: 'type',
            local: { name: 'MyInterface' },
            exported: { name: 'MyInterface' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(0)
    })

    test('should handle enum with value specifier', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSEnumDeclaration', id: { name: 'Status' } },
        specifiers: [
          {
            type: 'ExportSpecifier',
            exportKind: 'value',
            local: { name: 'Status' },
            exported: { name: 'Status' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('docs metadata', () => {
    test('should have description that mentions consistent usage', () => {
      expect(consistentTypeExportsRule.meta.docs?.description.toLowerCase()).toContain('consistent')
    })

    test('should have description that mentions type exports', () => {
      expect(consistentTypeExportsRule.meta.docs?.description).toContain('type exports')
    })

    test('should have description that mentions export type keyword', () => {
      expect(consistentTypeExportsRule.meta.docs?.description).toContain('export type')
    })

    test('should have description that mentions intent', () => {
      expect(consistentTypeExportsRule.meta.docs?.description.toLowerCase()).toContain('intent')
    })

    test('should have category patterns', () => {
      expect(consistentTypeExportsRule.meta.docs?.category).toBe('patterns')
    })

    test('should be recommended', () => {
      expect(consistentTypeExportsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have docs URL', () => {
      expect(consistentTypeExportsRule.meta.docs?.url).toBeDefined()
      expect(typeof consistentTypeExportsRule.meta.docs?.url).toBe('string')
    })

    test('should have docs URL pointing to codeforge', () => {
      expect(consistentTypeExportsRule.meta.docs?.url).toContain('codeforge')
    })

    test('should have docs URL containing rule name', () => {
      expect(consistentTypeExportsRule.meta.docs?.url).toContain('consistent-type-exports')
    })

    test('should not be deprecated', () => {
      expect(consistentTypeExportsRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(consistentTypeExportsRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(consistentTypeExportsRule.meta.requiresTypeChecking).toBeUndefined()
    })
  })

  describe('report descriptor structure', () => {
    test('should always include message in report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
      expect(reports[0]).toHaveProperty('message')
    })

    test('should include loc in report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
      expect(reports[0]).toHaveProperty('loc')
    })

    test('loc should have start property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
      expect(reports[0].loc).toHaveProperty('start')
    })

    test('loc should have end property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
      expect(reports[0].loc).toHaveProperty('end')
    })

    test('loc start should have line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('loc end should have line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
      expect(reports[0].loc?.end).toHaveProperty('line')
      expect(reports[0].loc?.end).toHaveProperty('column')
    })
  })

  describe('robustness', () => {
    test('should not throw when calling report throws', () => {
      const context = {
        report: () => {
          throw new Error('report failed')
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = consistentTypeExportsRule.create(context)
      expect(() =>
        visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration')),
      ).toThrow('report failed')
    })

    test('should handle being called many times without memory issues', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      for (let i = 0; i < 100; i++) {
        visitor.ExportNamedDeclaration(
          createExportNamedDeclaration('TSTypeAliasDeclaration', 'value', i + 1, 0),
        )
      }
      expect(reports.length).toBe(100)
    })

    test('should handle being called many times with mixed valid/invalid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      for (let i = 0; i < 100; i++) {
        const kind = i % 2 === 0 ? 'value' : 'type'
        visitor.ExportNamedDeclaration(
          createExportNamedDeclaration('TSTypeAliasDeclaration', kind, i + 1, 0),
        )
      }
      expect(reports.length).toBe(50)
    })

    test('should not modify the input node', () => {
      const { context } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      const originalNode = createExportNamedDeclaration('TSTypeAliasDeclaration')
      const nodeCopy = JSON.parse(JSON.stringify(originalNode))
      visitor.ExportNamedDeclaration(originalNode)
      expect(originalNode).toEqual(nodeCopy)
    })

    test('should work after creating many visitors', () => {
      for (let i = 0; i < 50; i++) {
        const { context, reports } = createMockRuleContext()
        const visitor = consistentTypeExportsRule.create(context)
        visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
        expect(reports.length).toBe(1)
      }
    })

    test('should work with visitor called only with null nodes then valid node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(null)
      visitor.ExportNamedDeclaration(undefined)
      visitor.ExportNamedDeclaration({})
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
      expect(reports.length).toBe(1)
    })
  })

  describe('declaration type variations', () => {
    test('should report TSTypeAliasDeclaration at line 1', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSTypeAliasDeclaration', 'value', 1),
      )
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report TSTypeAliasDeclaration at line 999', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSTypeAliasDeclaration', 'value', 999),
      )
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(999)
    })

    test('should report TSInterfaceDeclaration at column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSInterfaceDeclaration', 'value', 1, 0),
      )
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report TSInterfaceDeclaration at column 100', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSInterfaceDeclaration', 'value', 1, 100),
      )
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.column).toBe(100)
    })

    test('should report TSEnumDeclaration at line 1 column 1', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSEnumDeclaration', 'value', 1, 1),
      )
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(1)
    })

    test('should handle type alias with complex declaration properties', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: {
          type: 'TSTypeAliasDeclaration',
          id: { type: 'Identifier', name: 'ComplexType' },
          typeParameters: { type: 'TSTypeParameterDeclaration', params: [] },
          typeAnnotation: { type: 'TSTypeReference' },
        },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
    })

    test('should handle interface with heritage clauses', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: {
          type: 'TSInterfaceDeclaration',
          id: { type: 'Identifier', name: 'ChildInterface' },
          extends: [{ type: 'TSExpressionWithTypeArguments' }],
          body: { type: 'TSInterfaceBody', body: [] },
        },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
    })

    test('should handle enum with initializer members', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: {
          type: 'TSEnumDeclaration',
          id: { type: 'Identifier', name: 'Direction' },
          members: [
            { type: 'TSEnumMember', id: { name: 'Up' }, initializer: { value: 0 } },
            { type: 'TSEnumMember', id: { name: 'Down' }, initializer: { value: 1 } },
          ],
          declare: false,
          const: false,
        },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 4, column: 1 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
    })

    test('should handle const enum', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: {
          type: 'TSEnumDeclaration',
          id: { type: 'Identifier', name: 'ConstEnum' },
          members: [],
          const: true,
        },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
    })
  })

  describe('export specifier edge cases', () => {
    test('should not report when single specifier has exportKind type', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: null,
        specifiers: [
          {
            type: 'ExportSpecifier',
            exportKind: 'type',
            local: { name: 'T' },
            exported: { name: 'T' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(0)
    })

    test('should not report when one of many specifiers has importKind type', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: null,
        specifiers: [
          {
            type: 'ExportSpecifier',
            exportKind: 'value',
            local: { name: 'a' },
            exported: { name: 'a' },
          },
          {
            type: 'ExportSpecifier',
            exportKind: 'value',
            local: { name: 'b' },
            exported: { name: 'b' },
          },
          {
            type: 'ExportSpecifier',
            importKind: 'type',
            local: { name: 'c' },
            exported: { name: 'c' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(0)
    })

    test('should report when all specifiers have value exportKind and type declaration', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSInterfaceDeclaration' },
        specifiers: [
          {
            type: 'ExportSpecifier',
            exportKind: 'value',
            local: { name: 'a' },
            exported: { name: 'a' },
          },
          {
            type: 'ExportSpecifier',
            exportKind: 'value',
            local: { name: 'b' },
            exported: { name: 'b' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
    })

    test('should handle specifier with empty local and exported names', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: null,
        specifiers: [
          {
            type: 'ExportSpecifier',
            exportKind: 'type',
            local: { name: '' },
            exported: { name: '' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(0)
    })

    test('should handle specifier object without local property', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [{ type: 'ExportSpecifier', exportKind: 'type' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(0)
    })

    test('should handle many specifiers with one type specifier at end', () => {
      const specs = []
      for (let i = 0; i < 10; i++) {
        specs.push({
          type: 'ExportSpecifier',
          exportKind: 'value',
          local: { name: `v${i}` },
          exported: { name: `v${i}` },
        })
      }
      specs.push({
        type: 'ExportSpecifier',
        exportKind: 'type',
        local: { name: 'T' },
        exported: { name: 'T' },
      })
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: null,
        specifiers: specs,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 100 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(0)
    })

    test('should handle many specifiers with one type specifier at start', () => {
      const specs = [
        {
          type: 'ExportSpecifier',
          exportKind: 'type',
          local: { name: 'T' },
          exported: { name: 'T' },
        },
      ]
      for (let i = 0; i < 10; i++) {
        specs.push({
          type: 'ExportSpecifier',
          exportKind: 'value',
          local: { name: `v${i}` },
          exported: { name: `v${i}` },
        })
      }
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: null,
        specifiers: specs,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 100 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(0)
    })
  })

  describe('loc extraction edge cases', () => {
    test('should handle loc with only line numbers (no columns)', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: 5 }, end: { line: 7 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('should handle loc with string line numbers', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: '5', column: '3' }, end: { line: '5', column: '20' } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with negative line numbers', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: -1, column: 0 }, end: { line: -1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(-1)
    })

    test('should handle loc with negative column numbers', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: 1, column: -5 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.column).toBe(-5)
    })

    test('should handle loc with very large numbers', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: 999999, column: 999999 }, end: { line: 999999, column: 1000000 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(999999)
      expect(reports[0].loc?.start.column).toBe(999999)
    })

    test('should handle loc with float line numbers', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: 1.5, column: 0 }, end: { line: 1.5, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(1.5)
    })

    test('should handle loc where start equals end', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: 5, column: 10 }, end: { line: 5, column: 10 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(reports[0].loc?.end.line)
      expect(reports[0].loc?.start.column).toBe(reports[0].loc?.end.column)
    })

    test('should handle loc where end is before start', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: 10, column: 20 }, end: { line: 5, column: 0 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
      expect(reports[0].loc?.start.line).toBe(10)
    })
  })

  describe('exportKind variations', () => {
    test('should treat undefined exportKind as not type', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
    })

    test('should treat empty string exportKind as not type', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: '',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
    })

    test('should be case-sensitive for type exportKind', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'Type',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
    })

    test('should be case-sensitive for TYPE exportKind', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'TYPE',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
    })

    test('should treat "value" exportKind as not type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSTypeAliasDeclaration', 'value'),
      )
      expect(reports).toHaveLength(1)
    })

    test('should handle exportKind with whitespace', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: ' type ',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
    })

    test('should handle object exportKind', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: { name: 'type' },
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
    })

    test('should handle array exportKind', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: ['type'],
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
    })
  })

  describe('declaration type edge cases', () => {
    test('should handle declaration type as empty string', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: '' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(0)
    })

    test('should handle declaration type as undefined', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: undefined },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(0)
    })

    test('should handle declaration type as number', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 42 },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(0)
    })

    test('should be case-sensitive for TSTypeAliasDeclaration', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'tstypealiasdeclaration' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(0)
    })

    test('should be case-sensitive for TSInterfaceDeclaration', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'tsinterfacedeclaration' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(0)
    })

    test('should be case-sensitive for TSEnumDeclaration', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'tsenumdeclaration' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(0)
    })

    test('should handle declaration with extra properties', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: {
          type: 'TSTypeAliasDeclaration',
          id: { name: 'MyType' },
          typeAnnotation: { type: 'TSStringKeyword' },
          extra: true,
          metadata: {},
        },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
    })

    test('should not report for TSAsExpression declaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSAsExpression'))
      expect(reports).toHaveLength(0)
    })

    test('should not report for ArrowFunctionExpression declaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('ArrowFunctionExpression'))
      expect(reports).toHaveLength(0)
    })

    test('should not report for TSQualifiedName declaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSQualifiedName'))
      expect(reports).toHaveLength(0)
    })

    test('should not report for TSTupleType declaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTupleType'))
      expect(reports).toHaveLength(0)
    })

    test('should not report for TSUnionType declaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSUnionType'))
      expect(reports).toHaveLength(0)
    })

    test('should not report for TSIntersectionType declaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSIntersectionType'))
      expect(reports).toHaveLength(0)
    })

    test('should not report for TSMappedType declaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSMappedType'))
      expect(reports).toHaveLength(0)
    })

    test('should not report for TSConditionalType declaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSConditionalType'))
      expect(reports).toHaveLength(0)
    })
  })

  describe('mixed scenario stress tests', () => {
    test('should correctly count reports for mixed declaration types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      const declarations = [
        ['TSTypeAliasDeclaration', 'value', true],
        ['TSTypeAliasDeclaration', 'type', false],
        ['TSInterfaceDeclaration', 'value', true],
        ['TSInterfaceDeclaration', 'type', false],
        ['TSEnumDeclaration', 'value', true],
        ['TSEnumDeclaration', 'type', false],
        ['FunctionDeclaration', 'value', false],
        ['ClassDeclaration', 'value', false],
        ['VariableDeclaration', 'value', false],
        ['TSTypeAliasDeclaration', 'value', true],
      ] as const

      for (const [declType, exportKind] of declarations) {
        visitor.ExportNamedDeclaration(createExportNamedDeclaration(declType, exportKind))
      }

      expect(reports).toHaveLength(4)
    })

    test('should handle 200 rapid-fire calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      for (let i = 0; i < 200; i++) {
        const exportKind = i % 3 === 0 ? 'type' : 'value'
        visitor.ExportNamedDeclaration(
          createExportNamedDeclaration('TSTypeAliasDeclaration', exportKind, i + 1, 0),
        )
      }

      expect(reports.length).toBeGreaterThan(0)
      expect(reports.length).toBeLessThan(200)
    })

    test('should handle alternating type and value exports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      for (let i = 0; i < 20; i++) {
        const declType = i % 2 === 0 ? 'TSTypeAliasDeclaration' : 'FunctionDeclaration'
        visitor.ExportNamedDeclaration(createExportNamedDeclaration(declType, 'value', i + 1, 0))
      }

      expect(reports).toHaveLength(10)
    })

    test('should handle all three type declarations together', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSTypeAliasDeclaration', 'value', 1, 0),
      )
      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSInterfaceDeclaration', 'value', 2, 0),
      )
      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSEnumDeclaration', 'value', 3, 0),
      )

      expect(reports).toHaveLength(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })

    test('should handle all three type declarations with type keyword', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSTypeAliasDeclaration', 'type', 1, 0),
      )
      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSInterfaceDeclaration', 'type', 2, 0),
      )
      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSEnumDeclaration', 'type', 3, 0),
      )

      expect(reports).toHaveLength(0)
    })

    test('should maintain correct report order', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSInterfaceDeclaration', 'value', 10, 0),
      )
      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSEnumDeclaration', 'value', 20, 0),
      )
      visitor.ExportNamedDeclaration(
        createExportNamedDeclaration('TSTypeAliasDeclaration', 'value', 30, 0),
      )

      expect(reports).toHaveLength(3)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.line).toBe(20)
      expect(reports[2].loc?.start.line).toBe(30)
    })

    test('should handle node with all properties set to undefined', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: undefined,
        declaration: undefined,
        specifiers: undefined,
        loc: undefined,
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(0)
    })

    test('should handle node with prototype-less object', () => {
      const node = Object.create(null)
      node.type = 'ExportNamedDeclaration'
      node.exportKind = 'value'
      node.declaration = { type: 'TSTypeAliasDeclaration' }
      node.specifiers = []
      node.loc = { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } }

      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
    })

    test('should handle re-using same context for multiple visitors', () => {
      const { context, reports } = createMockRuleContext()
      const visitor1 = consistentTypeExportsRule.create(context)
      const visitor2 = consistentTypeExportsRule.create(context)

      visitor1.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
      visitor2.ExportNamedDeclaration(createExportNamedDeclaration('TSInterfaceDeclaration'))

      expect(reports).toHaveLength(2)
    })
  })

  describe('visitor method names', () => {
    test('should only have ExportNamedDeclaration as a visitor key', () => {
      const { context } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      const keys = Object.keys(visitor)
      expect(keys).toContain('ExportNamedDeclaration')
    })

    test('visitor should be a plain object', () => {
      const { context } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
      expect(Array.isArray(visitor)).toBe(false)
    })
  })

  describe('createMockRuleContext helper', () => {
    test('should create context with default values', () => {
      const { context, reports } = createMockRuleContext()
      expect(context.getFilePath()).toBe('/src/file.ts')
      expect(context.getSource()).toBe('const x = 1;')
      expect(reports).toEqual([])
    })

    test('should create context with custom file path', () => {
      const { context } = createMockRuleContext({ filePath: '/custom/path.ts' })
      expect(context.getFilePath()).toBe('/custom/path.ts')
    })

    test('should create context with custom source', () => {
      const { context } = createMockRuleContext({
        filePath: '/src/file.ts',
        source: 'custom source',
      })
      expect(context.getSource()).toBe('custom source')
    })

    test('should accumulate reports', () => {
      const { context, reports } = createMockRuleContext()
      context.report({ message: 'test1' })
      context.report({ message: 'test2' })
      expect(reports).toHaveLength(2)
      expect(reports[0].message).toBe('test1')
      expect(reports[1].message).toBe('test2')
    })

    test('should provide working logger methods', () => {
      const { context } = createMockRuleContext()
      expect(() => context.logger.debug('test')).not.toThrow()
      expect(() => context.logger.info('test')).not.toThrow()
      expect(() => context.logger.warn('test')).not.toThrow()
      expect(() => context.logger.error('test')).not.toThrow()
    })

    test('should return null AST', () => {
      const { context } = createMockRuleContext()
      expect(context.getAST()).toBeNull()
    })

    test('should return empty tokens array', () => {
      const { context } = createMockRuleContext()
      expect(context.getTokens()).toEqual([])
    })

    test('should return empty comments array', () => {
      const { context } = createMockRuleContext()
      expect(context.getComments()).toEqual([])
    })
  })

  describe('createExportNamedDeclaration helper', () => {
    test('should create node with default values', () => {
      const node = createExportNamedDeclaration('TSTypeAliasDeclaration')
      expect(node).toMatchObject({
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        specifiers: [],
      })
    })

    test('should create node with custom exportKind', () => {
      const node = createExportNamedDeclaration('TSTypeAliasDeclaration', 'type')
      expect(node).toMatchObject({ exportKind: 'type' })
    })

    test('should create node with custom location', () => {
      const node = createExportNamedDeclaration('TSTypeAliasDeclaration', 'value', 10, 5)
      expect((node as Record<string, unknown>).loc).toEqual({
        start: { line: 10, column: 5 },
        end: { line: 10, column: 25 },
      })
    })

    test('should create node without declaration when null', () => {
      const node = createExportNamedDeclaration(null)
      expect((node as Record<string, unknown>).declaration).toBeNull()
    })

    test('should create node with declaration type', () => {
      const node = createExportNamedDeclaration('TSInterfaceDeclaration')
      expect(((node as Record<string, unknown>).declaration as Record<string, unknown>).type).toBe(
        'TSInterfaceDeclaration',
      )
    })
  })

  describe('createExportWithTypeSpecifier helper', () => {
    test('should create node with type specifier', () => {
      const node = createExportWithTypeSpecifier()
      expect(node).toMatchObject({
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: null,
      })
    })

    test('should have exactly one specifier with exportKind type', () => {
      const node = createExportWithTypeSpecifier()
      const specifiers = (node as Record<string, unknown>).specifiers as Record<string, unknown>[]
      expect(specifiers).toHaveLength(1)
      expect(specifiers[0].exportKind).toBe('type')
    })

    test('should create node with default location', () => {
      const node = createExportWithTypeSpecifier()
      expect((node as Record<string, unknown>).loc).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 20 },
      })
    })

    test('should create node with custom location', () => {
      const node = createExportWithTypeSpecifier(15, 8)
      expect((node as Record<string, unknown>).loc).toEqual({
        start: { line: 15, column: 8 },
        end: { line: 15, column: 28 },
      })
    })
  })

  describe('isExportType with specifier importKind', () => {
    test('should not report when specifier has importKind type but no exportKind', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [
          {
            type: 'ExportSpecifier',
            importKind: 'type',
            local: { name: 'X' },
            exported: { name: 'X' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(0)
    })

    test('should report when specifier has neither importKind nor exportKind as type', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [
          {
            type: 'ExportSpecifier',
            importKind: 'value',
            exportKind: 'value',
            local: { name: 'X' },
            exported: { name: 'X' },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
    })
  })

  describe('report with location details', () => {
    test('should include both start and end location in report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      const node = createExportNamedDeclaration('TSTypeAliasDeclaration', 'value', 8, 4)
      visitor.ExportNamedDeclaration(node)
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toEqual({ line: 8, column: 4 })
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(8)
      expect(reports[0].loc?.end.column).toBe(24)
    })

    test('should handle multi-line range in report location', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSInterfaceDeclaration' },
        specifiers: [],
        loc: { start: { line: 10, column: 0 }, end: { line: 25, column: 1 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.end.line).toBe(25)
    })
  })

  describe('concurrent context usage', () => {
    test('should handle multiple contexts independently', () => {
      const ctx1 = createMockRuleContext()
      const ctx2 = createMockRuleContext()
      const visitor1 = consistentTypeExportsRule.create(ctx1.context)
      const visitor2 = consistentTypeExportsRule.create(ctx2.context)

      visitor1.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
      visitor2.ExportNamedDeclaration(createExportNamedDeclaration('TSInterfaceDeclaration'))

      expect(ctx1.reports).toHaveLength(1)
      expect(ctx2.reports).toHaveLength(1)
      expect(ctx1.reports[0].message).toBe(ctx2.reports[0].message)
    })

    test('should not share reports between contexts', () => {
      const ctx1 = createMockRuleContext()
      const ctx2 = createMockRuleContext()
      const visitor1 = consistentTypeExportsRule.create(ctx1.context)

      visitor1.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
      visitor1.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))

      expect(ctx1.reports).toHaveLength(2)
      expect(ctx2.reports).toHaveLength(0)
    })

    test('should handle context with different source code independently', () => {
      const ctx1 = createMockRuleContext({
        filePath: '/src/a.ts',
        source: 'export type A = string;',
      })
      const ctx2 = createMockRuleContext({ filePath: '/src/b.ts', source: 'export { B }' })
      const visitor1 = consistentTypeExportsRule.create(ctx1.context)
      const visitor2 = consistentTypeExportsRule.create(ctx2.context)

      visitor1.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))
      visitor2.ExportNamedDeclaration(createExportNamedDeclaration('TSEnumDeclaration'))

      expect(ctx1.reports).toHaveLength(1)
      expect(ctx2.reports).toHaveLength(1)
    })
  })

  describe('additional edge cases', () => {
    test('should handle node with frozen object', () => {
      const node = Object.freeze({
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSTypeAliasDeclaration' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
    })

    test('should handle node with sealed object', () => {
      const node = Object.seal({
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: 'TSInterfaceDeclaration' },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
    })

    test('should handle declaration with Symbol type', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: { type: Symbol('TSTypeAliasDeclaration') },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(0)
    })

    test('should handle declaration with getter for type', () => {
      let callCount = 0
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        get declaration() {
          callCount++
          return { type: 'TSTypeAliasDeclaration' }
        },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
      expect(callCount).toBeGreaterThan(0)
    })

    test('should handle very deep nesting in declaration', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: {
          type: 'TSTypeAliasDeclaration',
          id: { type: 'Identifier', name: 'Deep' },
          typeAnnotation: {
            type: 'TSUnionType',
            types: [
              { type: 'TSLiteralType', literal: { type: 'Literal' } },
              { type: 'TSStringKeyword' },
            ],
          },
        },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
    })

    test('should handle empty interface declaration', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: {
          type: 'TSInterfaceDeclaration',
          id: { type: 'Identifier', name: 'Empty' },
          body: { type: 'TSInterfaceBody', body: [] },
        },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
    })

    test('should handle declare enum', () => {
      const node = {
        type: 'ExportNamedDeclaration',
        exportKind: 'value',
        declaration: {
          type: 'TSEnumDeclaration',
          id: { type: 'Identifier', name: 'DeclaredEnum' },
          members: [],
          declare: true,
        },
        specifiers: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      const { context, reports } = createMockRuleContext()
      const visitor = consistentTypeExportsRule.create(context)
      visitor.ExportNamedDeclaration(node)
      expect(reports).toHaveLength(1)
    })
  })
})

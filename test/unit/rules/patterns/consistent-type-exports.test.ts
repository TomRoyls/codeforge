import { describe, test, expect, vi } from 'vitest'
import { consistentTypeExportsRule } from '../../../../src/rules/patterns/consistent-type-exports.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'export type MyType = string;',
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
      const { context, reports } = createMockContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('export type')
    })

    test('should report interface without export type', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSInterfaceDeclaration'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('export type')
    })

    test('should report enum without export type', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSEnumDeclaration'))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('export type')
    })

    test('should not report when export type is used', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(createExportNamedDeclaration('TSTypeAliasDeclaration', 'type'))

      expect(reports.length).toBe(0)
    })

    test('should not report when type specifier is used', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(createExportWithTypeSpecifier())

      expect(reports.length).toBe(0)
    })

    test('should not report value exports', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(createExportNamedDeclaration('FunctionDeclaration'))

      expect(reports.length).toBe(0)
    })

    test('should not report exports without declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTypeExportsRule.create(context)

      visitor.ExportNamedDeclaration(createExportNamedDeclaration(null))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = consistentTypeExportsRule.create(context)
      expect(() => visitor.ExportNamedDeclaration(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = consistentTypeExportsRule.create(context)
      expect(() => visitor.ExportNamedDeclaration(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = consistentTypeExportsRule.create(context)

      expect(() => visitor.ExportNamedDeclaration('string')).not.toThrow()
      expect(() => visitor.ExportNamedDeclaration(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTypeExportsRule.create(context)

      const node = createExportNamedDeclaration('TSTypeAliasDeclaration')
      delete (node as Record<string, unknown>).loc
      expect(() => visitor.ExportNamedDeclaration(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = consistentTypeExportsRule.create(context)

      const node = createExportNamedDeclaration('TSTypeAliasDeclaration', 'value', 10, 5)
      visitor.ExportNamedDeclaration(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })
})

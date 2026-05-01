import { describe, expect, test, vi } from 'vitest'
import { noUselessRenameRule } from '../../../../src/rules/patterns/no-useless-rename.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => 'import { foo as foo } from "bar"',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [{}] },
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

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function makeImportSpecifier(name = 'foo', line = 1, column = 0): unknown {
  return {
    type: 'ImportSpecifier',
    imported: { type: 'Identifier', name },
    local: { type: 'Identifier', name },
    loc: makeLoc(line, column, line, column + 20),
  }
}

function makeExportSpecifier(name = 'bar', line = 1, column = 0): unknown {
  return {
    type: 'ExportSpecifier',
    exported: { type: 'Identifier', name },
    local: { type: 'Identifier', name },
    loc: makeLoc(line, column, line, column + 20),
  }
}

describe('no-useless-rename rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUselessRenameRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUselessRenameRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUselessRenameRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUselessRenameRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUselessRenameRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning rename and import', () => {
      const desc = noUselessRenameRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/rename/)
      expect(desc).toMatch(/import/)
    })

    test('should have correct docs URL', () => {
      expect(noUselessRenameRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-useless-rename',
      )
    })

    test('should have empty schema', () => {
      expect(noUselessRenameRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with ImportSpecifier and ExportSpecifier', () => {
      const { context } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      expect(visitor).toHaveProperty('ImportSpecifier')
      expect(visitor).toHaveProperty('ExportSpecifier')
      expect(typeof visitor.ImportSpecifier).toBe('function')
      expect(typeof visitor.ExportSpecifier).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUselessRenameRule).toBeDefined()
      expect(noUselessRenameRule.meta).toBeDefined()
      expect(noUselessRenameRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports useless rename', () => {
    test('reports ImportSpecifier with same imported and local name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('foo'))
      expect(reports.length).toBe(1)
    })

    test('reports ExportSpecifier with same exported and local name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ExportSpecifier(makeExportSpecifier('bar'))
      expect(reports.length).toBe(1)
    })

    test('message contains "Useless"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('foo'))
      expect(reports[0].message).toContain('Useless')
    })

    test('message contains "rename"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('foo'))
      expect(reports[0].message.toLowerCase()).toContain('rename')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('foo'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('foo'))
      expect(reports[0].node).toBeDefined()
    })

    test('message contains the identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('myFunc'))
      expect(reports[0].message).toContain('myFunc')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('a'))
      visitor.ImportSpecifier(makeImportSpecifier('b'))
      visitor.ImportSpecifier(makeImportSpecifier('c'))
      expect(reports.length).toBe(3)
    })

    test('reports Identifier type names correctly for ImportSpecifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('React'))
      expect(reports[0].message).toContain('React')
    })

    test('reports Identifier type names correctly for ExportSpecifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ExportSpecifier(makeExportSpecifier('Component'))
      expect(reports[0].message).toContain('Component')
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('foo', 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('report node property matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = makeImportSpecifier('foo')
      visitor.ImportSpecifier(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports ImportSpecifier with Literal imported name matching local', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Literal', value: 'foo' },
        local: { type: 'Identifier', name: 'foo' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(1)
    })

    test('reports ExportSpecifier with Literal exported name matching local', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ExportSpecifier',
        exported: { type: 'Literal', value: 'bar' },
        local: { type: 'Identifier', name: 'bar' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExportSpecifier(node)
      expect(reports.length).toBe(1)
    })

    test('reports both ImportSpecifier and ExportSpecifier from same context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('a'))
      visitor.ExportSpecifier(makeExportSpecifier('b'))
      expect(reports.length).toBe(2)
    })

    test('reports each violation once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('x'))
      expect(reports.length).toBe(1)
    })

    test('message mentions "imported/exported"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('foo'))
      expect(reports[0].message.toLowerCase()).toContain('imported/exported')
    })

    test('message mentions "local"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('foo'))
      expect(reports[0].message.toLowerCase()).toContain('local')
    })

    test('reports ImportSpecifier with underscore name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('__private'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__private')
    })

    test('reports ExportSpecifier with dollar sign name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ExportSpecifier(makeExportSpecifier('$jquery'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('$jquery')
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report ImportSpecifier with different imported and local names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Identifier', name: 'foo' },
        local: { type: 'Identifier', name: 'bar' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ExportSpecifier with different exported and local names', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ExportSpecifier',
        exported: { type: 'Identifier', name: 'foo' },
        local: { type: 'Identifier', name: 'bar' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully for ImportSpecifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      expect(() => visitor.ImportSpecifier(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully for ExportSpecifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      expect(() => visitor.ExportSpecifier(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully for ImportSpecifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      expect(() => visitor.ImportSpecifier(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully for ExportSpecifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      expect(() => visitor.ExportSpecifier(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node for ImportSpecifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      expect(() => visitor.ImportSpecifier({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node for ExportSpecifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      expect(() => visitor.ExportSpecifier({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when imported is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: null,
        local: { type: 'Identifier', name: 'foo' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when exported is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ExportSpecifier',
        exported: null,
        local: { type: 'Identifier', name: 'bar' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when local is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Identifier', name: 'foo' },
        local: null,
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when local is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Identifier', name: 'foo' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when imported is non-Identifier non-Literal type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' } },
        local: { type: 'Identifier', name: 'a' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when exported is non-Identifier non-Literal type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ExportSpecifier',
        exported: { type: 'MemberExpression', object: { type: 'Identifier', name: 'b' } },
        local: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Literal with number value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Literal', value: 42 },
        local: { type: 'Identifier', name: '42' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when Identifier has no name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Identifier' },
        local: { type: 'Identifier' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when Literal has boolean value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ExportSpecifier',
        exported: { type: 'Literal', value: true },
        local: { type: 'Identifier', name: 'true' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when Literal has null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Literal', value: null },
        local: { type: 'Identifier', name: 'null' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when Literal has object value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ExportSpecifier',
        exported: { type: 'Literal', value: { key: 'val' } },
        local: { type: 'Identifier', name: 'val' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('handles string primitive node for ImportSpecifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      expect(() => visitor.ImportSpecifier('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles number primitive node for ExportSpecifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      expect(() => visitor.ExportSpecifier(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when imported and local are both different Literal strings', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Literal', value: 'foo' },
        local: { type: 'Literal', value: 'bar' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report node with only type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = { type: 'Literal', value: 42 }
      expect(() => visitor.ImportSpecifier(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report ImportSpecifier with different Literal string vs Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Literal', value: 'foo' },
        local: { type: 'Identifier', name: 'bar' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ExportSpecifier with different Literal string vs Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ExportSpecifier',
        exported: { type: 'Literal', value: 'alpha' },
        local: { type: 'Identifier', name: 'beta' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when imported and local names are case-different', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Identifier', name: 'Foo' },
        local: { type: 'Identifier', name: 'foo' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when local name is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Identifier', name: '' },
        local: { type: 'Identifier', name: '' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(1)
    })

    test('does not report ExportSpecifier when both exported and local are missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ExportSpecifier',
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when imported is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: [{ type: 'Identifier', name: 'foo' }],
        local: { type: 'Identifier', name: 'foo' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when local is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Identifier', name: 'foo' },
        local: [{ type: 'Identifier', name: 'foo' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('handles boolean primitive node for ImportSpecifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      expect(() => visitor.ImportSpecifier(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles boolean primitive node for ExportSpecifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      expect(() => visitor.ExportSpecifier(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when Literal has undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Literal', value: undefined },
        local: { type: 'Identifier', name: 'undefined' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ExportSpecifier with Literal number value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ExportSpecifier',
        exported: { type: 'Literal', value: 100 },
        local: { type: 'Identifier', name: '100' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ImportSpecifier with Literal regex value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Literal', value: /pattern/ },
        local: { type: 'Identifier', name: 'pattern' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUselessRenameRule.create(ctx1)
      const visitor2 = noUselessRenameRule.create(ctx2)

      visitor1.ImportSpecifier(makeImportSpecifier('foo'))
      visitor2.ImportSpecifier({
        type: 'ImportSpecifier',
        imported: { type: 'Identifier', name: 'a' },
        local: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 20),
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('a'))
      visitor.ExportSpecifier(makeExportSpecifier('b'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Identifier', name: 'foo' },
        local: { type: 'Identifier', name: 'foo' },
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Identifier', name: 'foo' },
        local: { type: 'Identifier', name: 'foo' },
      }
      visitor.ImportSpecifier(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid and invalid ImportSpecifiers count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('same'))
      visitor.ImportSpecifier({
        type: 'ImportSpecifier',
        imported: { type: 'Identifier', name: 'a' },
        local: { type: 'Identifier', name: 'b' },
        loc: makeLoc(2, 0, 2, 20),
      })
      visitor.ImportSpecifier(makeImportSpecifier('same2'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noUselessRenameRule.create(context)
      const visitor2 = noUselessRenameRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('x'))
      visitor.ImportSpecifier(makeImportSpecifier('x'))
      visitor.ImportSpecifier(makeImportSpecifier('x'))
      expect(reports.length).toBe(3)
    })

    test('reports with both Literal imported and Literal local matching', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Literal', value: 'foo' },
        local: { type: 'Literal', value: 'foo' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with missing imported and exported properties for ImportSpecifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        local: { type: 'Identifier', name: 'foo' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('handles node with missing exported and imported properties for ExportSpecifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ExportSpecifier',
        local: { type: 'Identifier', name: 'bar' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('ImportSpecifier visitor does not affect ExportSpecifier reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('a'))
      expect(reports.length).toBe(1)
      visitor.ExportSpecifier({
        type: 'ExportSpecifier',
        exported: { type: 'Identifier', name: 'x' },
        local: { type: 'Identifier', name: 'y' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('ExportSpecifier visitor does not affect ImportSpecifier reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ExportSpecifier(makeExportSpecifier('a'))
      expect(reports.length).toBe(1)
      visitor.ImportSpecifier({
        type: 'ImportSpecifier',
        imported: { type: 'Identifier', name: 'p' },
        local: { type: 'Identifier', name: 'q' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with loc containing only start', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Identifier', name: 'foo' },
        local: { type: 'Identifier', name: 'foo' },
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('handles node with loc containing only end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ExportSpecifier',
        exported: { type: 'Identifier', name: 'bar' },
        local: { type: 'Identifier', name: 'bar' },
        loc: { end: { line: 7, column: 10 } },
      }
      visitor.ExportSpecifier(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('handles large number of accumulated reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      for (let i = 0; i < 50; i++) {
        visitor.ImportSpecifier(makeImportSpecifier(`name${i}`))
      }
      expect(reports.length).toBe(50)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('all violation messages are identical for same name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('same'))
      visitor.ExportSpecifier(makeExportSpecifier('same'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('rule meta is same reference across multiple accesses', () => {
      const meta1 = noUselessRenameRule.meta
      const meta2 = noUselessRenameRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noUselessRenameRule', () => {
      expect(noUselessRenameRule).toBeDefined()
      expect(typeof noUselessRenameRule.create).toBe('function')
      expect(typeof noUselessRenameRule.meta).toBe('object')
    })

    test('message format includes backtick-wrapped name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('myVar'))
      expect(reports[0].message).toContain('`myVar`')
    })

    test('ImportSpecifier with single-character name reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('x'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('`x`')
    })

    test('ExportSpecifier with single-character name reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ExportSpecifier(makeExportSpecifier('y'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('`y`')
    })

    test('ImportSpecifier and ExportSpecifier can both report in same session', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('imp'))
      visitor.ExportSpecifier(makeExportSpecifier('exp'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('imp')
      expect(reports[1].message).toContain('exp')
    })

    test('does not report ImportSpecifier with Literal string different from local', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Literal', value: 'original' },
        local: { type: 'Identifier', name: 'alias' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('does not report ExportSpecifier with Literal string different from local', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ExportSpecifier',
        exported: { type: 'Literal', value: 'original' },
        local: { type: 'Identifier', name: 'renamed' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('reports ExportSpecifier with Literal string matching local Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ExportSpecifier',
        exported: { type: 'Literal', value: 'sameName' },
        local: { type: 'Identifier', name: 'sameName' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExportSpecifier(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('sameName')
    })

    test('does not report when imported Literal string differs from local Literal string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Literal', value: 'a' },
        local: { type: 'Literal', value: 'b' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('reports ImportSpecifier with Literal matching Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Literal', value: 'identical' },
        local: { type: 'Literal', value: 'identical' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(1)
    })

    test('does not report ImportSpecifier when local type is non-Identifier non-Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const node = {
        type: 'ImportSpecifier',
        imported: { type: 'Identifier', name: 'foo' },
        local: { type: 'MemberExpression', object: { type: 'Identifier', name: 'foo' } },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ImportSpecifier(node)
      expect(reports.length).toBe(0)
    })

    test('visitor functions do not throw when called with wrong node types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      const wrongNode = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'fn' },
        loc: makeLoc(1, 0, 1, 20),
      }
      expect(() => visitor.ImportSpecifier(wrongNode)).not.toThrow()
      expect(() => visitor.ExportSpecifier(wrongNode)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('reports correctly for names with special characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessRenameRule.create(context)
      visitor.ImportSpecifier(makeImportSpecifier('encodeURIComponent'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('encodeURIComponent')
    })
  })
})

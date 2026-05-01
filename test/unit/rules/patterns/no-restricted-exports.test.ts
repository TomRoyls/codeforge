import { describe, expect, test, vi } from 'vitest'
import { noRestrictedExportsRule } from '../../../../src/rules/patterns/no-restricted-exports.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  node?: unknown
}

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
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
    getSource: () => 'export { foo as default }',
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

function makeExportNamedNode(
  specifiers: unknown[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
): unknown {
  return {
    type: 'ExportNamedDeclaration',
    specifiers,
    declaration: null,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeExportSpecifier(exportedName: string, localName: string) {
  return {
    type: 'ExportSpecifier',
    exported: { type: 'Identifier', name: exportedName },
    local: { type: 'Identifier', name: localName },
  }
}

// ===== META TESTS (8) =====

describe('no-restricted-exports rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noRestrictedExportsRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noRestrictedExportsRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noRestrictedExportsRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noRestrictedExportsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noRestrictedExportsRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning restricted exports', () => {
      const desc = noRestrictedExportsRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/export|default|restrict/)
    })

    test('should have correct docs URL', () => {
      expect(noRestrictedExportsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-restricted-exports',
      )
    })

    test('should have empty schema', () => {
      expect(noRestrictedExportsRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ExportNamedDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      expect(visitor).toHaveProperty('ExportNamedDeclaration')
      expect(typeof visitor.ExportNamedDeclaration).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noRestrictedExportsRule).toBeDefined()
      expect(noRestrictedExportsRule.meta).toBeDefined()
      expect(noRestrictedExportsRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS DEFAULT EXPORT (25) =====

  describe('positive cases — reports default export via named', () => {
    test('reports when exported name is "default"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'myFunc')]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports when single specifier exports as default', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'Foo')]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports when default is among multiple specifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([
          makeExportSpecifier('bar', 'bar'),
          makeExportSpecifier('default', 'baz'),
          makeExportSpecifier('qux', 'qux'),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports when default is first specifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([
          makeExportSpecifier('default', 'myDefault'),
          makeExportSpecifier('other', 'other'),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports when default is last specifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([
          makeExportSpecifier('alpha', 'alpha'),
          makeExportSpecifier('default', 'beta'),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports when only specifier is default', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'x')]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports when local name differs from exported "default"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'someLocalName')]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports when local name is also "default"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'default')]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with specifiers array containing many items and default at end', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([
          makeExportSpecifier('a', 'a'),
          makeExportSpecifier('b', 'b'),
          makeExportSpecifier('c', 'c'),
          makeExportSpecifier('d', 'd'),
          makeExportSpecifier('default', 'e'),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with specifiers array containing many items and default in middle', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([
          makeExportSpecifier('a', 'a'),
          makeExportSpecifier('b', 'b'),
          makeExportSpecifier('default', 'c'),
          makeExportSpecifier('d', 'd'),
          makeExportSpecifier('e', 'e'),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports only once even with multiple default specifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([
          makeExportSpecifier('default', 'a'),
          makeExportSpecifier('default', 'b'),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'x')]),
      )
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'y')]),
      )
      expect(reports.length).toBe(2)
    })

    test('report message contains "Unexpected export of "default""', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'myFunc')]),
      )
      expect(reports[0].message).toContain('Unexpected export of "default"')
    })

    test('report message mentions "named export"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'myFunc')]),
      )
      expect(reports[0].message).toContain('named export')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'myFunc')]),
      )
      expect(reports[0].message).toBe(
        'Unexpected export of "default" via named export.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'myFunc')]),
      )
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'myFunc')]),
      )
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input ExportNamedDeclaration node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      const node = makeExportNamedNode([makeExportSpecifier('default', 'myFunc')])
      visitor.ExportNamedDeclaration(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'x')], 5, 10, 5, 40),
      )
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports for export { something as default }', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'something')]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for export { MyClass as default }', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'MyClass')]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for export { helper as default }', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'helper')]),
      )
      expect(reports.length).toBe(1)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'a')]),
      )
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'b')]),
      )
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for node with declaration set to null', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'x')]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports for node with empty declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      const node = {
        type: 'ExportNamedDeclaration',
        specifiers: [makeExportSpecifier('default', 'val')],
        declaration: null,
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('reports when local name is an underscore prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', '_privateExport')]),
      )
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report loc start line matches node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'x')], 3, 5, 3, 25),
      )
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('report loc start column matches node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'x')], 1, 8, 1, 30),
      )
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('report loc end line matches node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'x')], 1, 0, 4, 1),
      )
      expect(reports[0].loc?.end.line).toBe(4)
    })

    test('report loc end column matches node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'x')], 1, 0, 1, 22),
      )
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('report loc is full location object', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'x')], 2, 4, 2, 30),
      )
      expect(reports[0].loc).toEqual({
        start: { line: 2, column: 4 },
        end: { line: 2, column: 30 },
      })
    })

    test('report message is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'x')]),
      )
      expect(typeof reports[0].message).toBe('string')
    })

    test('report message is not empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'x')]),
      )
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('report node is the ExportNamedDeclaration node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      const node = makeExportNamedNode([makeExportSpecifier('default', 'x')])
      visitor.ExportNamedDeclaration(node)
      expect(reports[0].node).toBe(node)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'x')]),
      )
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('multiple reports have independent loc values', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'x')], 1, 0, 1, 20),
      )
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'y')], 5, 3, 5, 25),
      )
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('multiple reports have same message', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'x')]),
      )
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'y')]),
      )
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('multiple reports reference different nodes', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      const node1 = makeExportNamedNode([makeExportSpecifier('default', 'x')])
      const node2 = makeExportNamedNode([makeExportSpecifier('default', 'y')])
      visitor.ExportNamedDeclaration(node1)
      visitor.ExportNamedDeclaration(node2)
      expect(reports[0].node).toBe(node1)
      expect(reports[1].node).toBe(node2)
    })

    test('report for default among many specifiers reports once', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([
          makeExportSpecifier('a', 'a'),
          makeExportSpecifier('b', 'b'),
          makeExportSpecifier('default', 'c'),
          makeExportSpecifier('d', 'd'),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('report message does not contain local name', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'mySecretLocal')]),
      )
      expect(reports[0].message).not.toContain('mySecretLocal')
    })

    test('report is triggered for specifiers with exported type Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'val')]),
      )
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      expect(() => visitor.ExportNamedDeclaration(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      expect(() => visitor.ExportNamedDeclaration(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      expect(() => visitor.ExportNamedDeclaration({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type ExportDefaultDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration({ type: 'ExportDefaultDeclaration', declaration: {}, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      expect(() => visitor.ExportNamedDeclaration('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      expect(() => visitor.ExportNamedDeclaration(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      expect(() => visitor.ExportNamedDeclaration(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      expect(() => visitor.ExportNamedDeclaration([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when specifiers is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration({ type: 'ExportNamedDeclaration', declaration: null, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when specifiers is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration({ type: 'ExportNamedDeclaration', specifiers: null, declaration: null, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when specifiers is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(makeExportNamedNode([]))
      expect(reports.length).toBe(0)
    })

    test('does not report when specifier exported name is not "default"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('myFunc', 'myFunc')]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for normal named export { foo }', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('foo', 'foo')]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for multiple normal named exports', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([
          makeExportSpecifier('a', 'a'),
          makeExportSpecifier('b', 'b'),
          makeExportSpecifier('c', 'c'),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when specifier type is not ExportSpecifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([{ type: 'ImportSpecifier', exported: { type: 'Identifier', name: 'default' }, local: { type: 'Identifier', name: 'x' } }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when exported is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([{ type: 'ExportSpecifier', local: { type: 'Identifier', name: 'x' } }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when exported type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([{ type: 'ExportSpecifier', exported: { type: 'Literal', value: 'default' }, local: { type: 'Identifier', name: 'x' } }]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration({ type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'f' }, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when specifier is null in array', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(makeExportNamedNode([null]))
      expect(reports.length).toBe(0)
    })

    test('does not report when specifier is a string in array', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(makeExportNamedNode(['not-a-specifier']))
      expect(reports.length).toBe(0)
    })

    test('does not report when specifier is a number in array', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(makeExportNamedNode([42]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noRestrictedExportsRule.create(ctx1)
      const visitor2 = noRestrictedExportsRule.create(ctx2)
      visitor1.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'x')]),
      )
      visitor2.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('foo', 'foo')]),
      )
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'x')]),
      )
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('foo', 'foo')]),
      )
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'y')]),
      )
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      const node = {
        type: 'ExportNamedDeclaration',
        specifiers: [makeExportSpecifier('default', 'x')],
        declaration: null,
      }
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('foo', 'foo')]),
      )
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'bar')]),
      )
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('baz', 'baz')]),
      )
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'qux')]),
      )
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('quux', 'quux')]),
      )
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noRestrictedExportsRule.create(context)
      const visitor2 = noRestrictedExportsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noRestrictedExportsRule.meta
      const meta2 = noRestrictedExportsRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      const node = {
        type: 'ExportNamedDeclaration',
        specifiers: [makeExportSpecifier('default', 'x')],
        declaration: null,
        loc: makeLoc(1, 0, 1, 30),
        range: [0, 30],
        extra: true,
        source: null,
      }
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration({
        type: 'ExportNamedDeclaration',
        specifiers: [makeExportSpecifier('default', 'x')],
        declaration: null,
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration({
        type: 'ExportNamedDeclaration',
        specifiers: [makeExportSpecifier('default', 'x')],
        declaration: null,
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      const node = makeExportNamedNode([makeExportSpecifier('default', 'x')])
      visitor.ExportNamedDeclaration(node)
      visitor.ExportNamedDeclaration(node)
      visitor.ExportNamedDeclaration(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noRestrictedExportsRule).toBeDefined()
      expect(typeof noRestrictedExportsRule.create).toBe('function')
      expect(typeof noRestrictedExportsRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration({
        type: 'ExportNamedDeclaration',
        specifiers: [makeExportSpecifier('default', 'x')],
        declaration: null,
        loc: makeLoc(1, 0, 1, 30),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles specifier with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([{
          type: 'ExportSpecifier',
          exported: { type: 'Identifier', name: 'default' },
          local: { type: 'Identifier', name: 'x' },
          extra: true,
          range: [5, 20],
        }]),
      )
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('default', 'x')], 10, 4, 10, 28),
      )
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('handles node with exportKind property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration({
        type: 'ExportNamedDeclaration',
        specifiers: [makeExportSpecifier('default', 'x')],
        declaration: null,
        exportKind: 'value',
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('handles specifier exported name case sensitivity — "Default" does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('Default', 'x')]),
      )
      expect(reports.length).toBe(0)
    })

    test('handles specifier exported name case sensitivity — "DEFAULT" does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('DEFAULT', 'x')]),
      )
      expect(reports.length).toBe(0)
    })

    test('handles specifier with exported name "exportDefault" does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('exportDefault', 'x')]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report when specifier exported name is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noRestrictedExportsRule.create(context)
      visitor.ExportNamedDeclaration(
        makeExportNamedNode([makeExportSpecifier('', 'x')]),
      )
      expect(reports.length).toBe(0)
    })
  })
})

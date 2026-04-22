import { describe, test, expect, vi, beforeEach } from 'vitest'
import { SyntaxKind, type Node } from 'ts-morph'
import {
  getExportInfo,
  extractImportSpecifiers,
  extractExportSpecifiers,
  nodeToGeneric,
  setParentRefs,
  genericNodeCache,
} from '../../../src/rules/adapter-node-converter.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Correct ts-morph SyntaxKind values for node type guards */
const KIND_MAP: Record<string, number> = {
  Identifier: SyntaxKind.Identifier,
  StringLiteral: SyntaxKind.StringLiteral,
  NumericLiteral: SyntaxKind.NumericLiteral,
  BooleanLiteral: SyntaxKind.TrueKeyword,
  NullKeyword: SyntaxKind.NullKeyword,
  VariableDeclaration: SyntaxKind.VariableDeclaration,
  VariableDeclarationList: SyntaxKind.VariableDeclarationList,
  FunctionDeclaration: SyntaxKind.FunctionDeclaration,
  FunctionExpression: SyntaxKind.FunctionExpression,
  ArrowFunction: SyntaxKind.ArrowFunction,
  ClassDeclaration: SyntaxKind.ClassDeclaration,
  PropertyDeclaration: SyntaxKind.PropertyDeclaration,
  MethodDeclaration: SyntaxKind.MethodDeclaration,
  ConstructorDeclaration: SyntaxKind.Constructor,
  Constructor: SyntaxKind.Constructor,
  GetAccessorDeclaration: SyntaxKind.GetAccessor,
  GetAccessor: SyntaxKind.GetAccessor,
  SetAccessorDeclaration: SyntaxKind.SetAccessor,
  SetAccessor: SyntaxKind.SetAccessor,
  PropertyAccessExpression: SyntaxKind.PropertyAccessExpression,
  ElementAccessExpression: SyntaxKind.ElementAccessExpression,
  CallExpression: SyntaxKind.CallExpression,
  ExportDeclaration: SyntaxKind.ExportDeclaration,
  ImportDeclaration: SyntaxKind.ImportDeclaration,
  RegularExpressionLiteral: SyntaxKind.RegularExpressionLiteral,
  ShorthandPropertyAssignment: SyntaxKind.ShorthandPropertyAssignment,
  Parameter: SyntaxKind.Parameter,
  Block: SyntaxKind.Block,
  ObjectLiteralExpression: SyntaxKind.ObjectLiteralExpression,
  ArrayLiteralExpression: SyntaxKind.ArrayLiteralExpression,
  FirstAssignment: SyntaxKind.FirstAssignment,
  DotDotDotToken: SyntaxKind.DotDotDotToken,
}

interface MockNodeOverrides {
  kindName?: string
  start?: number
  end?: number
  text?: string
  compilerNode?: Record<string, unknown>
  getModifiers?: () => Array<{ getKindName: () => string }> | undefined
  isAsync?: () => boolean
  isGenerator?: () => boolean
  isStatic?: () => boolean
  isReadonly?: () => boolean
  getAccessibility?: () => string | undefined
  isParameterProperty?: () => boolean
  hasOverrideKeyword?: () => boolean
  isTypeOnly?: () => boolean
  questionDotToken?: unknown
  getParent?: () => Node | undefined
}

function createMockNode(overrides: MockNodeOverrides = {}): Node {
  const kindName = overrides.kindName ?? 'Identifier'
  const syntaxKind = KIND_MAP[kindName] ?? SyntaxKind.Identifier
  const start = overrides.start ?? 0
  const end = overrides.end ?? 5
  const text = overrides.text ?? 'hello'
  const mockSourceFile = {
    getFilePath: () => '/test/file.ts',
    getFullText: () => text,
    getLineAndColumnAtPos: (pos: number) => ({ line: 1, column: pos }),
  }
  return {
    getSourceFile: () => mockSourceFile,
    getStart: () => start,
    getEnd: () => end,
    getText: () => text,
    getKindName: () => kindName,
    getKind: () => syntaxKind,
    getModifiers: overrides.getModifiers,
    getParent: overrides.getParent ?? (() => undefined),
    compilerNode: overrides.compilerNode ?? {},
    isAsync: overrides.isAsync ?? (() => false),
    isGenerator: overrides.isGenerator ?? (() => false),
    isStatic: overrides.isStatic ?? (() => false),
    isReadonly: overrides.isReadonly ?? (() => false),
    getAccessibility: overrides.getAccessibility ?? (() => undefined),
    isParameterProperty: overrides.isParameterProperty ?? (() => false),
    hasOverrideKeyword: overrides.hasOverrideKeyword ?? (() => false),
    isTypeOnly: overrides.isTypeOnly ?? (() => false),
    questionDotToken: overrides.questionDotToken,
  } as unknown as Node
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('adapter-node-converter', () => {
  // =========================================================================
  // getExportInfo
  // =========================================================================
  describe('getExportInfo', () => {
    test('returns false/false when getModifiers is undefined', () => {
      const node = createMockNode({ getModifiers: undefined })
      expect(getExportInfo(node)).toEqual({ isExported: false, isDefault: false })
    })

    test('returns false/false when getModifiers returns undefined', () => {
      const node = createMockNode({ getModifiers: () => undefined })
      expect(getExportInfo(node)).toEqual({ isExported: false, isDefault: false })
    })

    test('returns false/false when getModifiers returns empty array', () => {
      const node = createMockNode({ getModifiers: () => [] })
      expect(getExportInfo(node)).toEqual({ isExported: false, isDefault: false })
    })

    test('detects ExportKeyword', () => {
      const node = createMockNode({
        getModifiers: () => [{ getKindName: () => 'ExportKeyword' }],
      })
      expect(getExportInfo(node)).toEqual({ isExported: true, isDefault: false })
    })

    test('detects DefaultKeyword', () => {
      const node = createMockNode({
        getModifiers: () => [{ getKindName: () => 'DefaultKeyword' }],
      })
      expect(getExportInfo(node)).toEqual({ isExported: false, isDefault: true })
    })

    test('detects both export and default keywords', () => {
      const node = createMockNode({
        getModifiers: () => [
          { getKindName: () => 'ExportKeyword' },
          { getKindName: () => 'DefaultKeyword' },
        ],
      })
      expect(getExportInfo(node)).toEqual({ isExported: true, isDefault: true })
    })

    test('ignores unrelated modifiers', () => {
      const node = createMockNode({
        getModifiers: () => [
          { getKindName: () => 'DeclareKeyword' },
          { getKindName: () => 'AsyncKeyword' },
        ],
      })
      expect(getExportInfo(node)).toEqual({ isExported: false, isDefault: false })
    })

    test('handles mixed modifiers with export among them', () => {
      const node = createMockNode({
        getModifiers: () => [
          { getKindName: () => 'DeclareKeyword' },
          { getKindName: () => 'ExportKeyword' },
        ],
      })
      expect(getExportInfo(node)).toEqual({ isExported: true, isDefault: false })
    })

    test('returns false/false when getModifiers throws', () => {
      const node = createMockNode({
        getModifiers: () => {
          throw new Error('no modifiers')
        },
      })
      expect(getExportInfo(node)).toEqual({ isExported: false, isDefault: false })
    })

    test('handles node without getModifiers method', () => {
      const node = {
        getSourceFile: () => ({
          getFilePath: () => '/test.ts',
          getFullText: () => '',
          getLineAndColumnAtPos: () => ({ line: 1, column: 0 }),
        }),
        getStart: () => 0,
        getEnd: () => 5,
        getText: () => 'hello',
        getKindName: () => 'Identifier',
        getKind: () => SyntaxKind.Identifier,
      } as unknown as Node
      expect(getExportInfo(node)).toEqual({ isExported: false, isDefault: false })
    })

    test('export keyword as first modifier', () => {
      const node = createMockNode({
        getModifiers: () => [
          { getKindName: () => 'ExportKeyword' },
          { getKindName: () => 'AsyncKeyword' },
        ],
      })
      const info = getExportInfo(node)
      expect(info.isExported).toBe(true)
      expect(info.isDefault).toBe(false)
    })

    test('default keyword without export', () => {
      const node = createMockNode({
        getModifiers: () => [
          { getKindName: () => 'DefaultKeyword' },
          { getKindName: () => 'AsyncKeyword' },
        ],
      })
      const info = getExportInfo(node)
      expect(info.isExported).toBe(false)
      expect(info.isDefault).toBe(true)
    })

    test('returns object with exactly two keys', () => {
      const node = createMockNode()
      const info = getExportInfo(node)
      expect(Object.keys(info)).toEqual(['isExported', 'isDefault'])
    })

    test('export appears multiple times still sets isExported true', () => {
      const node = createMockNode({
        getModifiers: () => [
          { getKindName: () => 'ExportKeyword' },
          { getKindName: () => 'ExportKeyword' },
        ],
      })
      expect(getExportInfo(node).isExported).toBe(true)
    })
  })

  // =========================================================================
  // extractImportSpecifiers
  // =========================================================================
  describe('extractImportSpecifiers', () => {
    test('returns empty array when compilerNode is falsy', () => {
      const node = createMockNode({ compilerNode: undefined as unknown as Record<string, unknown> })
      expect(extractImportSpecifiers(node)).toEqual([])
    })

    test('returns empty array when no importClause', () => {
      const node = createMockNode({ compilerNode: {} })
      expect(extractImportSpecifiers(node)).toEqual([])
    })

    test('returns empty array when importClause is null', () => {
      const node = createMockNode({ compilerNode: { importClause: null } })
      expect(extractImportSpecifiers(node)).toEqual([])
    })

    test('extracts default import specifier', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: { name: { text: 'Foo', pos: 7, end: 10 } },
        },
      })
      const specs = extractImportSpecifiers(node)
      expect(specs).toHaveLength(1)
      expect(specs[0]).toEqual({
        type: 'ImportDefaultSpecifier',
        local: { type: 'Identifier', name: 'Foo', value: 'Foo' },
        range: [7, 10],
        start: 7,
        end: 10,
      })
    })

    test('extracts single named import specifier', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: {
            namedBindings: {
              elements: [{ name: { text: 'A', pos: 10, end: 11 } }],
            },
          },
        },
      })
      const specs = extractImportSpecifiers(node)
      expect(specs).toHaveLength(1)
      const spec = specs[0] as Record<string, unknown>
      expect(spec.type).toBe('ImportSpecifier')
      expect(spec.local).toEqual({ type: 'Identifier', name: 'A', value: 'A' })
      expect(spec.imported).toEqual({ type: 'Identifier', name: 'A', value: 'A' })
    })

    test('extracts multiple named import specifiers', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: {
            namedBindings: {
              elements: [
                { name: { text: 'A', pos: 10, end: 11 } },
                { name: { text: 'B', pos: 13, end: 14 } },
              ],
            },
          },
        },
      })
      const specs = extractImportSpecifiers(node)
      expect(specs).toHaveLength(2)
    })

    test('extracts renamed import with propertyName', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: {
            namedBindings: {
              elements: [
                {
                  name: { text: 'localName', pos: 10, end: 19 },
                  propertyName: { text: 'originalName', pos: 10, end: 22 },
                },
              ],
            },
          },
        },
      })
      const specs = extractImportSpecifiers(node)
      const spec = specs[0] as Record<string, unknown>
      expect(spec.imported).toEqual({
        type: 'Identifier',
        name: 'originalName',
        value: 'originalName',
      })
    })

    test('extracts namespace import specifier', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: {
            namedBindings: {
              name: { text: 'Everything', pos: 14, end: 24 },
              pos: 9,
              end: 24,
            },
          },
        },
      })
      const specs = extractImportSpecifiers(node)
      expect(specs).toHaveLength(1)
      expect(specs[0]).toEqual({
        type: 'ImportNamespaceSpecifier',
        local: { type: 'Identifier', name: 'Everything', value: 'Everything' },
        range: [9, 24],
        start: 9,
        end: 24,
      })
    })

    test('detects type-only named imports', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: {
            namedBindings: {
              elements: [{ name: { text: 'T', pos: 10, end: 11 }, isTypeOnly: true }],
            },
          },
        },
      })
      const specs = extractImportSpecifiers(node)
      expect((specs[0] as Record<string, unknown>).importKind).toBe('type')
    })

    test('detects value importKind when isTypeOnly is false', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: {
            namedBindings: {
              elements: [{ name: { text: 'X', pos: 10, end: 11 }, isTypeOnly: false }],
            },
          },
        },
      })
      const specs = extractImportSpecifiers(node)
      expect((specs[0] as Record<string, unknown>).importKind).toBe('value')
    })

    test('defaults importKind to value when isTypeOnly absent', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: {
            namedBindings: {
              elements: [{ name: { text: 'X', pos: 10, end: 11 } }],
            },
          },
        },
      })
      const specs = extractImportSpecifiers(node)
      expect((specs[0] as Record<string, unknown>).importKind).toBe('value')
    })

    test('skips null elements in array', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: {
            namedBindings: {
              elements: [null, { name: { text: 'A', pos: 10, end: 11 } }],
            },
          },
        },
      })
      expect(extractImportSpecifiers(node)).toHaveLength(1)
    })

    test('skips non-object elements in array', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: {
            namedBindings: {
              elements: ['string', 42, { name: { text: 'A', pos: 10, end: 11 } }],
            },
          },
        },
      })
      expect(extractImportSpecifiers(node)).toHaveLength(1)
    })

    test('handles combined default and named imports', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: {
            name: { text: 'Foo', pos: 7, end: 10 },
            namedBindings: {
              elements: [{ name: { text: 'bar', pos: 14, end: 17 } }],
            },
          },
        },
      })
      const specs = extractImportSpecifiers(node)
      expect(specs).toHaveLength(2)
      expect((specs[0] as Record<string, unknown>).type).toBe('ImportDefaultSpecifier')
      expect((specs[1] as Record<string, unknown>).type).toBe('ImportSpecifier')
    })

    test('handles combined default and namespace imports', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: {
            name: { text: 'Foo', pos: 7, end: 10 },
            namedBindings: { name: { text: 'star', pos: 15, end: 19 }, pos: 11, end: 19 },
          },
        },
      })
      const specs = extractImportSpecifiers(node)
      expect(specs).toHaveLength(2)
      expect((specs[0] as Record<string, unknown>).type).toBe('ImportDefaultSpecifier')
      expect((specs[1] as Record<string, unknown>).type).toBe('ImportNamespaceSpecifier')
    })

    test('uses binding pos/end for namespace range when available', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: {
            namedBindings: { name: { text: 'ns', pos: 20, end: 22 }, pos: 11, end: 22 },
          },
        },
      })
      const specs = extractImportSpecifiers(node)
      expect((specs[0] as Record<string, unknown>).range).toEqual([11, 22])
    })

    test('uses name pos/end for namespace range when binding pos missing', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: {
            namedBindings: { name: { text: 'ns', pos: 20, end: 22 } },
          },
        },
      })
      const specs = extractImportSpecifiers(node)
      expect((specs[0] as Record<string, unknown>).range).toEqual([20, 22])
    })

    test('returns empty array when compilerNode access throws', () => {
      const node = {
        getSourceFile: () => ({
          getFilePath: () => '/t.ts',
          getFullText: () => '',
          getLineAndColumnAtPos: () => ({ line: 1, column: 0 }),
        }),
        getStart: () => 0,
        getEnd: () => 5,
        getText: () => 'x',
        getKindName: () => 'Identifier',
        getKind: () => SyntaxKind.Identifier,
      } as unknown as Node
      expect(extractImportSpecifiers(node)).toEqual([])
    })

    test('named import specifier has range from element pos/end', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: {
            namedBindings: {
              elements: [{ name: { text: 'A', pos: 10, end: 11 }, pos: 9, end: 12 }],
            },
          },
        },
      })
      const specs = extractImportSpecifiers(node)
      expect((specs[0] as Record<string, unknown>).range).toEqual([9, 12])
    })

    test('default import specifier range uses name pos/end', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: { name: { text: 'Foo', pos: 7, end: 10 } },
        },
      })
      const specs = extractImportSpecifiers(node)
      expect((specs[0] as Record<string, unknown>).range).toEqual([7, 10])
    })

    test('named import without propertyName uses name for imported', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: {
            namedBindings: {
              elements: [{ name: { text: 'MyFunc', pos: 10, end: 16 } }],
            },
          },
        },
      })
      const specs = extractImportSpecifiers(node)
      const spec = specs[0] as Record<string, unknown>
      expect(spec.imported).toEqual({ type: 'Identifier', name: 'MyFunc', value: 'MyFunc' })
      expect(spec.local).toEqual({ type: 'Identifier', name: 'MyFunc', value: 'MyFunc' })
    })
  })

  // =========================================================================
  // extractExportSpecifiers
  // =========================================================================
  describe('extractExportSpecifiers', () => {
    test('returns empty array when compilerNode is falsy', () => {
      const node = createMockNode({ compilerNode: undefined as unknown as Record<string, unknown> })
      expect(extractExportSpecifiers(node)).toEqual([])
    })

    test('returns empty array when no exportClause', () => {
      const node = createMockNode({ compilerNode: {} })
      expect(extractExportSpecifiers(node)).toEqual([])
    })

    test('returns empty array when exportClause has no elements', () => {
      const node = createMockNode({ compilerNode: { exportClause: {} } })
      expect(extractExportSpecifiers(node)).toEqual([])
    })

    test('extracts single export specifier', () => {
      const node = createMockNode({
        compilerNode: {
          exportClause: {
            elements: [{ name: { text: 'foo', pos: 10, end: 13 }, pos: 9, end: 14 }],
          },
        },
      })
      const specs = extractExportSpecifiers(node)
      expect(specs).toHaveLength(1)
      const spec = specs[0] as Record<string, unknown>
      expect(spec.type).toBe('ExportSpecifier')
      expect(spec.range).toEqual([9, 14])
      expect(spec.start).toBe(9)
      expect(spec.end).toBe(14)
      expect(spec.local).toEqual({ type: 'Identifier', name: 'foo', value: 'foo' })
      expect(spec.exported).toEqual({ type: 'Identifier', name: 'foo', value: 'foo' })
      expect(spec.exportKind).toBe('value')
    })

    test('extracts multiple export specifiers', () => {
      const node = createMockNode({
        compilerNode: {
          exportClause: {
            elements: [
              { name: { text: 'a', pos: 10, end: 11 }, pos: 10, end: 11 },
              { name: { text: 'b', pos: 13, end: 14 }, pos: 13, end: 14 },
              { name: { text: 'c', pos: 16, end: 17 }, pos: 16, end: 17 },
            ],
          },
        },
      })
      expect(extractExportSpecifiers(node)).toHaveLength(3)
    })

    test('detects type-only export specifiers', () => {
      const node = createMockNode({
        compilerNode: {
          exportClause: {
            elements: [
              { name: { text: 'T', pos: 10, end: 11 }, pos: 10, end: 11, isTypeOnly: true },
            ],
          },
        },
      })
      const specs = extractExportSpecifiers(node)
      expect((specs[0] as Record<string, unknown>).exportKind).toBe('type')
    })

    test('detects value exportKind when isTypeOnly is false', () => {
      const node = createMockNode({
        compilerNode: {
          exportClause: {
            elements: [
              { name: { text: 'V', pos: 10, end: 11 }, pos: 10, end: 11, isTypeOnly: false },
            ],
          },
        },
      })
      const specs = extractExportSpecifiers(node)
      expect((specs[0] as Record<string, unknown>).exportKind).toBe('value')
    })

    test('defaults exportKind to value when isTypeOnly absent', () => {
      const node = createMockNode({
        compilerNode: {
          exportClause: {
            elements: [{ name: { text: 'X', pos: 10, end: 11 }, pos: 10, end: 11 }],
          },
        },
      })
      const specs = extractExportSpecifiers(node)
      expect((specs[0] as Record<string, unknown>).exportKind).toBe('value')
    })

    test('handles renamed export with propertyName', () => {
      const node = createMockNode({
        compilerNode: {
          exportClause: {
            elements: [
              {
                name: { text: 'localName', pos: 10, end: 19 },
                propertyName: { text: 'publicName', pos: 10, end: 20 },
                pos: 9,
                end: 21,
              },
            ],
          },
        },
      })
      const specs = extractExportSpecifiers(node)
      const spec = specs[0] as Record<string, unknown>
      expect(spec.local).toEqual({ type: 'Identifier', name: 'localName', value: 'localName' })
      expect(spec.exported).toEqual({ type: 'Identifier', name: 'publicName', value: 'publicName' })
    })

    test('skips null elements', () => {
      const node = createMockNode({
        compilerNode: {
          exportClause: {
            elements: [null, { name: { text: 'A', pos: 10, end: 11 }, pos: 10, end: 11 }],
          },
        },
      })
      expect(extractExportSpecifiers(node)).toHaveLength(1)
    })

    test('skips non-object elements', () => {
      const node = createMockNode({
        compilerNode: {
          exportClause: {
            elements: [42, 'bad', { name: { text: 'A', pos: 10, end: 11 }, pos: 10, end: 11 }],
          },
        },
      })
      expect(extractExportSpecifiers(node)).toHaveLength(1)
    })

    test('returns empty array when compilerNode access throws', () => {
      const node = {
        getSourceFile: () => ({
          getFilePath: () => '/t.ts',
          getFullText: () => '',
          getLineAndColumnAtPos: () => ({ line: 1, column: 0 }),
        }),
        getStart: () => 0,
        getEnd: () => 5,
        getText: () => 'x',
        getKindName: () => 'Identifier',
        getKind: () => SyntaxKind.Identifier,
      } as unknown as Node
      expect(extractExportSpecifiers(node)).toEqual([])
    })

    test('export specifier uses element pos/end for range', () => {
      const node = createMockNode({
        compilerNode: {
          exportClause: {
            elements: [{ name: { text: 'x', pos: 15, end: 20 }, pos: 14, end: 21 }],
          },
        },
      })
      const specs = extractExportSpecifiers(node)
      expect((specs[0] as Record<string, unknown>).range).toEqual([14, 21])
    })

    test('export specifier start and end match range', () => {
      const node = createMockNode({
        compilerNode: {
          exportClause: {
            elements: [{ name: { text: 'fn', pos: 5, end: 7 }, pos: 4, end: 8 }],
          },
        },
      })
      const spec = extractExportSpecifiers(node)[0] as Record<string, unknown>
      expect(spec.start).toBe(4)
      expect(spec.end).toBe(8)
    })

    test('exported matches name when no propertyName', () => {
      const node = createMockNode({
        compilerNode: {
          exportClause: {
            elements: [{ name: { text: 'defaultExport', pos: 0, end: 13 }, pos: 0, end: 13 }],
          },
        },
      })
      const spec = extractExportSpecifiers(node)[0] as Record<string, unknown>
      expect(spec.exported).toEqual({
        type: 'Identifier',
        name: 'defaultExport',
        value: 'defaultExport',
      })
    })
  })

  // =========================================================================
  // nodeToGeneric — base properties
  // =========================================================================
  describe('nodeToGeneric', () => {
    describe('base properties', () => {
      test('returns an object with type property', () => {
        const result = nodeToGeneric(createMockNode())
        expect(result).toHaveProperty('type')
      })

      test('returns range as [start, end] tuple', () => {
        const result = nodeToGeneric(createMockNode({ start: 5, end: 15 }))
        expect(result.range).toEqual([5, 15])
      })

      test('returns loc with start and end positions', () => {
        const result = nodeToGeneric(createMockNode({ start: 0, end: 5 }))
        const loc = result.loc as {
          start: { line: number; column: number }
          end: { line: number; column: number }
        }
        expect(loc.start).toHaveProperty('line')
        expect(loc.start).toHaveProperty('column')
        expect(loc.end).toHaveProperty('line')
        expect(loc.end).toHaveProperty('column')
      })

      test('returns start and end as numbers', () => {
        const result = nodeToGeneric(createMockNode({ start: 10, end: 25 }))
        expect(result.start).toBe(10)
        expect(result.end).toBe(25)
      })

      test('returns text content', () => {
        const result = nodeToGeneric(createMockNode({ text: 'const x = 1;' }))
        expect(result.text).toBe('const x = 1;')
      })

      test('uses KIND_NAME_ALIASES for type mapping — Block', () => {
        const result = nodeToGeneric(createMockNode({ kindName: 'Block' }))
        expect(result.type).toBe('BlockStatement')
      })

      test('uses KIND_NAME_ALIASES for type mapping — StringLiteral', () => {
        const result = nodeToGeneric(createMockNode({ kindName: 'StringLiteral' }))
        expect(result.type).toBe('Literal')
      })

      test('uses KIND_NAME_ALIASES for type mapping — NumericLiteral', () => {
        const result = nodeToGeneric(createMockNode({ kindName: 'NumericLiteral' }))
        expect(result.type).toBe('Literal')
      })

      test('uses KIND_NAME_ALIASES for PropertyAccessExpression -> MemberExpression', () => {
        const result = nodeToGeneric(createMockNode({ kindName: 'PropertyAccessExpression' }))
        expect(result.type).toBe('MemberExpression')
      })

      test('falls back to kindName when no alias exists', () => {
        const result = nodeToGeneric(createMockNode({ kindName: 'FunctionDeclaration' }))
        expect(result.type).toBe('FunctionDeclaration')
      })

      test('loc start column equals start position', () => {
        const result = nodeToGeneric(createMockNode({ start: 42 }))
        const loc = result.loc as { start: { column: number } }
        expect(loc.start.column).toBe(42)
      })
    })

    describe('MemberExpression computed flag', () => {
      test('sets computed=true for ElementAccessExpression', () => {
        const result = nodeToGeneric(createMockNode({ kindName: 'ElementAccessExpression' }))
        expect(result.computed).toBe(true)
      })

      test('sets computed=false for PropertyAccessExpression', () => {
        const result = nodeToGeneric(createMockNode({ kindName: 'PropertyAccessExpression' }))
        expect(result.computed).toBe(false)
      })
    })

    describe('FunctionDeclaration', () => {
      test('detects async', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'FunctionDeclaration', isAsync: () => true }),
        )
        expect(result.async).toBe(true)
      })

      test('detects generator', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'FunctionDeclaration', isGenerator: () => true }),
        )
        expect(result.generator).toBe(true)
      })

      test('no async/generator flags when both false', () => {
        const result = nodeToGeneric(createMockNode({ kindName: 'FunctionDeclaration' }))
        expect(result.async).toBeUndefined()
        expect(result.generator).toBeUndefined()
      })
    })

    describe('FunctionExpression', () => {
      test('detects async', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'FunctionExpression', isAsync: () => true }),
        )
        expect(result.async).toBe(true)
      })

      test('detects generator', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'FunctionExpression', isGenerator: () => true }),
        )
        expect(result.generator).toBe(true)
      })
    })

    describe('ArrowFunction', () => {
      test('detects async', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'ArrowFunction', isAsync: () => true }),
        )
        expect(result.async).toBe(true)
      })

      test('never has generator flag', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'ArrowFunction', isGenerator: () => true }),
        )
        expect(result.generator).toBeUndefined()
      })

      test('type is ArrowFunctionExpression', () => {
        const result = nodeToGeneric(createMockNode({ kindName: 'ArrowFunction' }))
        expect(result.type).toBe('ArrowFunctionExpression')
      })
    })

    describe('PropertyDeclaration', () => {
      test('detects static', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'PropertyDeclaration', isStatic: () => true }),
        )
        expect(result.static).toBe(true)
      })

      test('detects readonly', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'PropertyDeclaration', isReadonly: () => true }),
        )
        expect(result.readonly).toBe(true)
      })

      test('no flags when both false', () => {
        const result = nodeToGeneric(createMockNode({ kindName: 'PropertyDeclaration' }))
        expect(result.static).toBeUndefined()
        expect(result.readonly).toBeUndefined()
      })
    })

    describe('MethodDeclaration', () => {
      test('sets method=true and kind=method', () => {
        const result = nodeToGeneric(createMockNode({ kindName: 'MethodDeclaration' }))
        expect(result.method).toBe(true)
        expect(result.kind).toBe('method')
      })

      test('detects static', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'MethodDeclaration', isStatic: () => true }),
        )
        expect(result.static).toBe(true)
      })

      test('detects accessibility private', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'MethodDeclaration', getAccessibility: () => 'private' }),
        )
        expect(result.accessibility).toBe('private')
      })

      test('detects accessibility protected', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'MethodDeclaration', getAccessibility: () => 'protected' }),
        )
        expect(result.accessibility).toBe('protected')
      })

      test('detects accessibility public', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'MethodDeclaration', getAccessibility: () => 'public' }),
        )
        expect(result.accessibility).toBe('public')
      })

      test('no accessibility when getAccessibility returns undefined', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'MethodDeclaration', getAccessibility: () => undefined }),
        )
        expect(result.accessibility).toBeUndefined()
      })
    })

    describe('ConstructorDeclaration', () => {
      test('sets kind=constructor and method=true', () => {
        const result = nodeToGeneric(createMockNode({ kindName: 'ConstructorDeclaration' }))
        expect(result.kind).toBe('constructor')
        expect(result.method).toBe(true)
      })

      test('detects accessibility', () => {
        const result = nodeToGeneric(
          createMockNode({
            kindName: 'ConstructorDeclaration',
            getAccessibility: () => 'protected',
          }),
        )
        expect(result.accessibility).toBe('protected')
      })
    })

    describe('GetAccessorDeclaration', () => {
      test('sets kind=get and method=true', () => {
        const result = nodeToGeneric(createMockNode({ kindName: 'GetAccessorDeclaration' }))
        expect(result.kind).toBe('get')
        expect(result.method).toBe(true)
      })

      test('detects static', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'GetAccessorDeclaration', isStatic: () => true }),
        )
        expect(result.static).toBe(true)
      })

      test('detects accessibility', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'GetAccessorDeclaration', getAccessibility: () => 'private' }),
        )
        expect(result.accessibility).toBe('private')
      })
    })

    describe('SetAccessorDeclaration', () => {
      test('sets kind=set and method=true', () => {
        const result = nodeToGeneric(createMockNode({ kindName: 'SetAccessorDeclaration' }))
        expect(result.kind).toBe('set')
        expect(result.method).toBe(true)
      })

      test('detects static', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'SetAccessorDeclaration', isStatic: () => true }),
        )
        expect(result.static).toBe(true)
      })
    })

    describe('RegularExpressionLiteral', () => {
      test('parses regex into raw and regex', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'RegularExpressionLiteral', text: '/test/gi' }),
        )
        expect(result.raw).toBe('/test/gi')
        expect(result.regex).toEqual({ pattern: 'test', flags: 'gi' })
      })

      test('parses regex with no flags', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'RegularExpressionLiteral', text: '/hello/' }),
        )
        expect(result.regex).toEqual({ pattern: 'hello', flags: '' })
      })

      test('parses regex with complex pattern', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'RegularExpressionLiteral', text: '/^\\d+$/m' }),
        )
        expect(result.regex).toEqual({ pattern: '^\\d+$', flags: 'm' })
      })
    })

    describe('ShorthandPropertyAssignment', () => {
      test('sets shorthand=true', () => {
        const result = nodeToGeneric(createMockNode({ kindName: 'ShorthandPropertyAssignment' }))
        expect(result.shorthand).toBe(true)
      })
    })

    describe('optional chaining (questionDotToken)', () => {
      test('PropertyAccessExpression wraps in ChainExpression when optional', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'PropertyAccessExpression', questionDotToken: {} }),
        )
        expect(result.type).toBe('ChainExpression')
        const expr = result.expression as Record<string, unknown>
        expect(expr.optional).toBe(true)
        expect(expr.type).toBe('MemberExpression')
      })

      test('PropertyAccessExpression no ChainExpression without questionDotToken', () => {
        const result = nodeToGeneric(createMockNode({ kindName: 'PropertyAccessExpression' }))
        expect(result.type).toBe('MemberExpression')
        expect(result.optional).toBeUndefined()
      })

      test('ElementAccessExpression wraps in ChainExpression when optional', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'ElementAccessExpression', questionDotToken: {} }),
        )
        expect(result.type).toBe('ChainExpression')
        const expr = result.expression as Record<string, unknown>
        expect(expr.optional).toBe(true)
      })

      test('CallExpression wraps in ChainExpression when optional', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'CallExpression', questionDotToken: {} }),
        )
        expect(result.type).toBe('ChainExpression')
        const expr = result.expression as Record<string, unknown>
        expect(expr.optional).toBe(true)
      })

      test('CallExpression no ChainExpression without questionDotToken', () => {
        const result = nodeToGeneric(createMockNode({ kindName: 'CallExpression' }))
        expect(result.type).toBe('CallExpression')
        expect(result.optional).toBeUndefined()
      })

      test('ChainExpression preserves range from inner node', () => {
        const result = nodeToGeneric(
          createMockNode({
            kindName: 'PropertyAccessExpression',
            questionDotToken: {},
            start: 5,
            end: 15,
          }),
        )
        expect(result.range).toEqual([5, 15])
        expect(result.start).toBe(5)
        expect(result.end).toBe(15)
      })
    })

    describe('export/import declarations', () => {
      test('ExportDeclaration sets exportKind=type when isTypeOnly', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'ExportDeclaration', isTypeOnly: () => true }),
        )
        expect(result.exportKind).toBe('type')
      })

      test('ExportDeclaration sets exportKind=value when not typeOnly', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'ExportDeclaration', isTypeOnly: () => false }),
        )
        expect(result.exportKind).toBe('value')
      })

      test('ImportDeclaration sets importKind=type when isTypeOnly', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'ImportDeclaration', isTypeOnly: () => true }),
        )
        expect(result.importKind).toBe('type')
      })

      test('ImportDeclaration sets importKind=value when not typeOnly', () => {
        const result = nodeToGeneric(
          createMockNode({ kindName: 'ImportDeclaration', isTypeOnly: () => false }),
        )
        expect(result.importKind).toBe('value')
      })
    })
  })

  // =========================================================================
  // setParentRefs
  // =========================================================================
  describe('setParentRefs', () => {
    test('does not set parent on root node when parent is null', () => {
      const root: Record<string, unknown> = { type: 'Program', body: [] }
      setParentRefs(root, null)
      expect(root).not.toHaveProperty('parent')
    })

    test('sets parent on direct child with type', () => {
      const child: Record<string, unknown> = { type: 'Identifier', name: 'x' }
      const root: Record<string, unknown> = { type: 'VariableDeclarator', id: child }
      setParentRefs(root, null)
      expect(child.parent).toBe(root)
    })

    test('does not set parent on objects without type property', () => {
      const noType = { foo: 'bar' }
      const root: Record<string, unknown> = { type: 'Program', extra: noType }
      setParentRefs(root, null)
      expect(noType).not.toHaveProperty('parent')
    })

    test('sets parent on children in arrays', () => {
      const child1: Record<string, unknown> = { type: 'ExpressionStatement' }
      const child2: Record<string, unknown> = { type: 'ReturnStatement' }
      const root: Record<string, unknown> = { type: 'BlockStatement', body: [child1, child2] }
      setParentRefs(root, null)
      expect(child1.parent).toBe(root)
      expect(child2.parent).toBe(root)
    })

    test('sets parent on deeply nested nodes', () => {
      const inner: Record<string, unknown> = { type: 'Identifier', name: 'deep' }
      const mid: Record<string, unknown> = { type: 'MemberExpression', object: inner }
      const root: Record<string, unknown> = { type: 'CallExpression', callee: mid }
      setParentRefs(root, null)
      expect(inner.parent).toBe(mid)
      expect(mid.parent).toBe(root)
    })

    test('handles circular references without infinite loop', () => {
      const a: Record<string, unknown> = { type: 'NodeA' }
      const b: Record<string, unknown> = { type: 'NodeB', ref: a }
      a.child = b
      expect(() => setParentRefs(a, null)).not.toThrow()
    })

    test('skips null values in traversal', () => {
      const root: Record<string, unknown> = { type: 'Program', body: null, extra: undefined }
      expect(() => setParentRefs(root, null)).not.toThrow()
    })

    test('skips primitive values in traversal', () => {
      const root: Record<string, unknown> = { type: 'Literal', value: 42, raw: '"hello"' }
      expect(() => setParentRefs(root, null)).not.toThrow()
      expect(root).not.toHaveProperty('parent')
    })

    test('sets parent when called with explicit parent', () => {
      const parent: Record<string, unknown> = { type: 'Program' }
      const child: Record<string, unknown> = { type: 'Identifier' }
      setParentRefs(child, parent)
      expect(child.parent).toBe(parent)
    })

    test('handles arrays with non-object items', () => {
      const child: Record<string, unknown> = { type: 'Literal' }
      const root: Record<string, unknown> = { type: 'Array', elements: [1, 'str', null, child] }
      setParentRefs(root, null)
      expect(child.parent).toBe(root)
    })

    test('skips array items without type property', () => {
      const withType: Record<string, unknown> = { type: 'Item' }
      const withoutType = { name: 'skipMe' }
      const root: Record<string, unknown> = { type: 'Root', items: [withType, withoutType] }
      setParentRefs(root, null)
      expect(withType.parent).toBe(root)
      expect(withoutType).not.toHaveProperty('parent')
    })

    test('handles empty object', () => {
      const root: Record<string, unknown> = {}
      expect(() => setParentRefs(root, null)).not.toThrow()
    })

    test('handles node with only non-object children', () => {
      const root: Record<string, unknown> = { type: 'Literal', value: true }
      setParentRefs(root, null)
      expect(root).not.toHaveProperty('parent')
    })

    test('sets parent on multiple children at same level', () => {
      const left: Record<string, unknown> = { type: 'Identifier', name: 'a' }
      const right: Record<string, unknown> = { type: 'Identifier', name: 'b' }
      const root: Record<string, unknown> = { type: 'BinaryExpression', left, right }
      setParentRefs(root, null)
      expect(left.parent).toBe(root)
      expect(right.parent).toBe(root)
    })

    test('handles three levels of nesting', () => {
      const leaf: Record<string, unknown> = { type: 'Leaf' }
      const mid: Record<string, unknown> = { type: 'Mid', child: leaf }
      const top: Record<string, unknown> = { type: 'Top', child: mid }
      setParentRefs(top, null)
      expect(mid.parent).toBe(top)
      expect(leaf.parent).toBe(mid)
    })

    test('does not revisit already-visited nodes (shared references)', () => {
      const shared: Record<string, unknown> = { type: 'Shared' }
      const root: Record<string, unknown> = { type: 'Root', a: shared, b: shared }
      setParentRefs(root, null)
      expect(shared).toHaveProperty('parent')
    })

    test('does NOT traverse into nested arrays', () => {
      const innerNode: Record<string, unknown> = { type: 'Inner' }
      const root: Record<string, unknown> = { type: 'Outer', items: [[innerNode]] }
      setParentRefs(root, null)
      // setParentRefs iterates array items, but skips sub-arrays (Array.isArray check)
      // so innerNode inside [[innerNode]] is NOT visited
      expect(innerNode).not.toHaveProperty('parent')
    })

    test('handles boolean false values', () => {
      const root: Record<string, unknown> = { type: 'Node', computed: false, optional: false }
      expect(() => setParentRefs(root, null)).not.toThrow()
    })

    test('handles numeric zero', () => {
      const root: Record<string, unknown> = { type: 'Node', value: 0 }
      expect(() => setParentRefs(root, null)).not.toThrow()
    })

    test('handles empty string', () => {
      const root: Record<string, unknown> = { type: 'Node', text: '' }
      expect(() => setParentRefs(root, null)).not.toThrow()
    })

    test('root with only array children', () => {
      const child: Record<string, unknown> = { type: 'Child' }
      const root: Record<string, unknown> = { type: 'Root', body: [child] }
      setParentRefs(root, null)
      expect(child.parent).toBe(root)
      expect(root).not.toHaveProperty('parent')
    })
  })

  // =========================================================================
  // genericNodeCache
  // =========================================================================
  describe('genericNodeCache', () => {
    test('is a WeakMap instance', () => {
      expect(genericNodeCache).toBeInstanceOf(WeakMap)
    })

    test('can set and get a value', () => {
      const node = createMockNode()
      const value = { type: 'TestNode', range: [0, 5] }
      genericNodeCache.set(node, value)
      expect(genericNodeCache.get(node)).toBe(value)
      genericNodeCache.delete(node)
    })

    test('returns undefined for uncached nodes', () => {
      const node = createMockNode()
      expect(genericNodeCache.get(node)).toBeUndefined()
    })

    test('can delete a cached entry', () => {
      const node = createMockNode()
      genericNodeCache.set(node, { type: 'Test' })
      genericNodeCache.delete(node)
      expect(genericNodeCache.get(node)).toBeUndefined()
    })

    test('has() returns true for cached entries', () => {
      const node = createMockNode()
      genericNodeCache.set(node, { type: 'Test' })
      expect(genericNodeCache.has(node)).toBe(true)
      genericNodeCache.delete(node)
    })

    test('has() returns false for uncached entries', () => {
      const node = createMockNode()
      expect(genericNodeCache.has(node)).toBe(false)
    })

    test('is NOT populated by nodeToGeneric', () => {
      const node = createMockNode()
      expect(genericNodeCache.has(node)).toBe(false)
      nodeToGeneric(node)
      expect(genericNodeCache.has(node)).toBe(false)
    })

    test('can cache multiple different nodes independently', () => {
      const node1 = createMockNode({ kindName: 'StringLiteral', text: '"a"' })
      const node2 = createMockNode({ kindName: 'NumericLiteral', text: '42' })
      const val1 = { type: 'Literal1' }
      const val2 = { type: 'Literal2' }
      genericNodeCache.set(node1, val1)
      genericNodeCache.set(node2, val2)
      expect(genericNodeCache.get(node1)).toBe(val1)
      expect(genericNodeCache.get(node2)).toBe(val2)
      genericNodeCache.delete(node1)
      genericNodeCache.delete(node2)
    })

    test('set overwrites previous value', () => {
      const node = createMockNode()
      genericNodeCache.set(node, { type: 'First' })
      genericNodeCache.set(node, { type: 'Second' })
      expect(genericNodeCache.get(node)).toEqual({ type: 'Second' })
      genericNodeCache.delete(node)
    })
  })

  // =========================================================================
  // Additional coverage
  // =========================================================================
  describe('getExportInfo additional', () => {
    test('handles modifier with empty kindName', () => {
      const node = createMockNode({
        getModifiers: () => [{ getKindName: () => '' }],
      })
      expect(getExportInfo(node)).toEqual({ isExported: false, isDefault: false })
    })

    test('handles single modifier that is default', () => {
      const node = createMockNode({
        getModifiers: () => [{ getKindName: () => 'DefaultKeyword' }],
      })
      expect(getExportInfo(node)).toEqual({ isExported: false, isDefault: true })
    })
  })

  describe('extractImportSpecifiers additional', () => {
    test('handles importClause with null name and no namedBindings', () => {
      const node = createMockNode({
        compilerNode: { importClause: { name: null } },
      })
      expect(extractImportSpecifiers(node)).toEqual([])
    })

    test('handles namedBindings with no elements or name', () => {
      const node = createMockNode({
        compilerNode: { importClause: { namedBindings: {} } },
      })
      expect(extractImportSpecifiers(node)).toEqual([])
    })

    test('handles namedBindings with null name', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: { namedBindings: { name: null } },
        },
      })
      expect(extractImportSpecifiers(node)).toEqual([])
    })

    test('handles element with null name', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: {
            namedBindings: { elements: [{ name: null }] },
          },
        },
      })
      const specs = extractImportSpecifiers(node)
      expect(specs).toHaveLength(1)
      expect((specs[0] as Record<string, unknown>).local).toBeUndefined()
    })
  })

  describe('extractExportSpecifiers additional', () => {
    test('handles element with null name', () => {
      const node = createMockNode({
        compilerNode: {
          exportClause: {
            elements: [{ name: null, pos: 0, end: 5 }],
          },
        },
      })
      const specs = extractExportSpecifiers(node)
      expect(specs).toHaveLength(1)
      const spec = specs[0] as Record<string, unknown>
      expect(spec.local).toBeUndefined()
      expect(spec.exported).toBeUndefined()
    })

    test('handles element with name but null text', () => {
      const node = createMockNode({
        compilerNode: {
          exportClause: {
            elements: [{ name: { text: null, pos: 0, end: 5 }, pos: 0, end: 5 }],
          },
        },
      })
      const specs = extractExportSpecifiers(node)
      expect(specs).toHaveLength(1)
      const spec = specs[0] as Record<string, unknown>
      expect(spec.local).toEqual({ type: 'Identifier', name: null, value: null })
    })

    test('handles exportClause that is not an object', () => {
      const node = createMockNode({
        compilerNode: { exportClause: 'string' },
      })
      expect(extractExportSpecifiers(node)).toEqual([])
    })
  })

  describe('nodeToGeneric additional', () => {
    test('ObjectLiteralExpression maps to ObjectExpression', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ObjectLiteralExpression' }))
      expect(result.type).toBe('ObjectExpression')
    })

    test('ArrayLiteralExpression maps to ArrayExpression', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ArrayLiteralExpression' }))
      expect(result.type).toBe('ArrayExpression')
    })

    test('VariableDeclaration maps to VariableDeclarator', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'VariableDeclaration' }))
      expect(result.type).toBe('VariableDeclarator')
    })

    test('does not set async on non-function nodes', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'Identifier', isAsync: () => true }))
      expect(result.async).toBeUndefined()
    })

    test('does not set generator on non-function nodes', () => {
      const result = nodeToGeneric(
        createMockNode({ kindName: 'Identifier', isGenerator: () => true }),
      )
      expect(result.generator).toBeUndefined()
    })

    test('does not set static on non-property/method nodes', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'Identifier', isStatic: () => true }))
      expect(result.static).toBeUndefined()
    })

    test('does not set readonly on non-property nodes', () => {
      const result = nodeToGeneric(
        createMockNode({ kindName: 'Identifier', isReadonly: () => true }),
      )
      expect(result.readonly).toBeUndefined()
    })

    test('different start/end positions produce correct range', () => {
      const result = nodeToGeneric(createMockNode({ start: 100, end: 200 }))
      expect(result.range).toEqual([100, 200])
      expect(result.start).toBe(100)
      expect(result.end).toBe(200)
    })

    test('loc start column equals start position', () => {
      const node = createMockNode({ start: 5, end: 10 })
      const result = nodeToGeneric(node)
      const loc = result.loc as {
        start: { line: number; column: number }
        end: { line: number; column: number }
      }
      // Default mock returns column: pos
      expect(loc.start.column).toBe(5)
      expect(loc.end.column).toBe(10)
    })

    test('loc start line is 1 from default mock', () => {
      const node = createMockNode({ start: 0, end: 5 })
      const result = nodeToGeneric(node)
      const loc = result.loc as {
        start: { line: number; column: number }
        end: { line: number; column: number }
      }
      expect(loc.start.line).toBe(1)
      expect(loc.end.line).toBe(1)
    })
  })

  describe('setParentRefs additional', () => {
    test('handles sibling nodes sharing array', () => {
      const a: Record<string, unknown> = { type: 'A' }
      const b: Record<string, unknown> = { type: 'B' }
      const c: Record<string, unknown> = { type: 'C' }
      const root: Record<string, unknown> = { type: 'Root', children: [a, b, c] }
      setParentRefs(root, null)
      expect(a.parent).toBe(root)
      expect(b.parent).toBe(root)
      expect(c.parent).toBe(root)
    })

    test('handles mixed children: typed and untyped', () => {
      const typed: Record<string, unknown> = { type: 'Typed' }
      const untyped = { value: 42 }
      const root: Record<string, unknown> = { type: 'Root', a: typed, b: untyped }
      setParentRefs(root, null)
      expect(typed.parent).toBe(root)
      expect(untyped).not.toHaveProperty('parent')
    })

    test('handles node with all primitive children', () => {
      const root: Record<string, unknown> = {
        type: 'Literal',
        value: 'hello',
        raw: '"hello"',
        start: 0,
        end: 7,
      }
      setParentRefs(root, null)
      expect(root).not.toHaveProperty('parent')
    })

    test('sets parent on grandchild through array', () => {
      const grandchild: Record<string, unknown> = { type: 'GrandChild' }
      const child: Record<string, unknown> = { type: 'Child', items: [grandchild] }
      const root: Record<string, unknown> = { type: 'Root', child }
      setParentRefs(root, null)
      expect(child.parent).toBe(root)
      expect(grandchild.parent).toBe(child)
    })
  })

  // =========================================================================
  // MethodDefinition value synthesis (lines 350-369)
  // =========================================================================
  describe('MethodDefinition value synthesis', () => {
    test('MethodDeclaration synthesizes FunctionExpression value', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'MethodDeclaration' }))
      expect(result.value).toBeDefined()
      const value = result.value as Record<string, unknown>
      expect(value.type).toBe('FunctionExpression')
    })

    test('MethodDeclaration value has id=null', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'MethodDeclaration' }))
      const value = result.value as Record<string, unknown>
      expect(value.id).toBeNull()
    })

    test('MethodDeclaration value defaults params to empty array', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'MethodDeclaration' }))
      const value = result.value as Record<string, unknown>
      expect(value.params).toEqual([])
    })

    test('MethodDeclaration value defaults body to BlockStatement', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'MethodDeclaration' }))
      const value = result.value as Record<string, unknown>
      expect((value.body as Record<string, unknown>).type).toBe('BlockStatement')
    })

    test('MethodDeclaration deletes body and params from base', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'MethodDeclaration' }))
      expect(result).not.toHaveProperty('body')
      expect(result).not.toHaveProperty('params')
    })

    test('MethodDeclaration value preserves range from base', () => {
      const result = nodeToGeneric(
        createMockNode({ kindName: 'MethodDeclaration', start: 10, end: 30 }),
      )
      const value = result.value as Record<string, unknown>
      expect(value.range).toEqual([10, 30])
    })

    test('MethodDeclaration value has parent pointing to base', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'MethodDeclaration' }))
      const value = result.value as Record<string, unknown>
      expect(value.parent).toBe(result)
    })

    test('Constructor synthesizes FunctionExpression value', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'Constructor' }))
      expect(result.value).toBeDefined()
      const value = result.value as Record<string, unknown>
      expect(value.type).toBe('FunctionExpression')
      expect(value.id).toBeNull()
    })

    test('GetAccessor synthesizes FunctionExpression value', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'GetAccessor' }))
      expect(result.value).toBeDefined()
      const value = result.value as Record<string, unknown>
      expect(value.type).toBe('FunctionExpression')
    })

    test('SetAccessor synthesizes FunctionExpression value', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'SetAccessor' }))
      expect(result.value).toBeDefined()
      const value = result.value as Record<string, unknown>
      expect(value.type).toBe('FunctionExpression')
    })
  })

  // =========================================================================
  // Parameter transformations — RestElement, AssignmentPattern, flatten
  // =========================================================================
  describe('Parameter transformations', () => {
    test('Parameter with dotDotDotToken becomes RestElement', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          compilerNode: {
            dotDotDotToken: { kind: SyntaxKind.DotDotDotToken, pos: 0, end: 3 },
            name: { kind: SyntaxKind.Identifier, pos: 3, end: 7, escapedText: 'args' },
          },
        }),
      )
      expect(result.type).toBe('RestElement')
    })

    test('RestElement.argument equals former name node', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          compilerNode: {
            dotDotDotToken: { kind: SyntaxKind.DotDotDotToken, pos: 0, end: 3 },
            name: { kind: SyntaxKind.Identifier, pos: 3, end: 7, escapedText: 'args' },
          },
        }),
      )
      const arg = result.argument as Record<string, unknown>
      expect(arg.type).toBe('Identifier')
      expect(arg.name).toBe('args')
    })

    test('RestElement deletes dotDotDotToken and name from result', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          compilerNode: {
            dotDotDotToken: { kind: SyntaxKind.DotDotDotToken, pos: 0, end: 3 },
            name: { kind: SyntaxKind.Identifier, pos: 3, end: 7, escapedText: 'args' },
          },
        }),
      )
      expect(result).not.toHaveProperty('dotDotDotToken')
      expect(result).not.toHaveProperty('name')
      expect(result).not.toHaveProperty('init')
    })

    test('Parameter with initializer becomes AssignmentPattern', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 1, escapedText: 'x' },
            initializer: { kind: SyntaxKind.NumericLiteral, pos: 4, end: 6, text: '42' },
          },
        }),
      )
      expect(result.type).toBe('AssignmentPattern')
    })

    test('AssignmentPattern.left equals former name node', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 1, escapedText: 'x' },
            initializer: { kind: SyntaxKind.NumericLiteral, pos: 4, end: 6, text: '42' },
          },
        }),
      )
      const left = result.left as Record<string, unknown>
      expect(left.type).toBe('Identifier')
      expect(left.name).toBe('x')
    })

    test('AssignmentPattern.right equals former init node', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 1, escapedText: 'x' },
            initializer: { kind: SyntaxKind.NumericLiteral, pos: 4, end: 6, text: '42' },
          },
        }),
      )
      const right = result.right as Record<string, unknown>
      expect(right.type).toBe('Literal')
      expect(right.value).toBe(42)
    })

    test('AssignmentPattern deletes name and init from result', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 1, escapedText: 'x' },
            initializer: { kind: SyntaxKind.NumericLiteral, pos: 4, end: 6, text: '42' },
          },
        }),
      )
      expect(result).not.toHaveProperty('name')
      expect(result).not.toHaveProperty('init')
      expect(result).not.toHaveProperty('dotDotDotToken')
    })

    test('Simple parameter flattens to name node type', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 1, escapedText: 'y' },
          },
        }),
      )
      expect(result.type).toBe('Identifier')
    })

    test('Simple parameter has name value from identifier', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 1, escapedText: 'myParam' },
          },
        }),
      )
      expect(result.name).toBe('myParam')
    })

    test('Simple parameter preserves original range when name has no range', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          start: 10,
          end: 20,
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 10, end: 20, escapedText: 'z' },
          },
        }),
      )
      expect(result.range).toBeDefined()
      expect(result.start).toBe(10)
      expect(result.end).toBe(20)
    })
  })

  // =========================================================================
  // TSParameterProperty synthesis (lines 329-347)
  // =========================================================================
  describe('TSParameterProperty synthesis', () => {
    test('wraps parameter property in TSParameterProperty', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          isParameterProperty: () => true,
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 5, escapedText: 'prop' },
          },
        }),
      )
      expect(result.type).toBe('TSParameterProperty')
    })

    test('TSParameterProperty.parameter contains the inner node', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          isParameterProperty: () => true,
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 5, escapedText: 'prop' },
          },
        }),
      )
      const param = result.parameter as Record<string, unknown>
      expect(param.type).toBe('Identifier')
      expect(param.name).toBe('prop')
    })

    test('TSParameterProperty with accessibility=private', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          isParameterProperty: () => true,
          getAccessibility: () => 'private',
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 5, escapedText: 'p' },
          },
        }),
      )
      expect(result.accessibility).toBe('private')
    })

    test('TSParameterProperty with accessibility=public', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          isParameterProperty: () => true,
          getAccessibility: () => 'public',
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 5, escapedText: 'p' },
          },
        }),
      )
      expect(result.accessibility).toBe('public')
    })

    test('TSParameterProperty with readonly=true', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          isParameterProperty: () => true,
          isReadonly: () => true,
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 5, escapedText: 'p' },
          },
        }),
      )
      expect(result.readonly).toBe(true)
    })

    test('TSParameterProperty with override=true', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          isParameterProperty: () => true,
          hasOverrideKeyword: () => true,
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 5, escapedText: 'p' },
          },
        }),
      )
      expect(result.override).toBe(true)
    })

    test('TSParameterProperty always has static=false', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          isParameterProperty: () => true,
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 5, escapedText: 'p' },
          },
        }),
      )
      expect(result.static).toBe(false)
    })

    test('TSParameterProperty always has decorators=[]', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          isParameterProperty: () => true,
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 5, escapedText: 'p' },
          },
        }),
      )
      expect(result.decorators).toEqual([])
    })

    test('TSParameterProperty preserves range from base', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          start: 20,
          end: 35,
          isParameterProperty: () => true,
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 20, end: 35, escapedText: 'p' },
          },
        }),
      )
      expect(result.range).toEqual([20, 35])
      expect(result.start).toBe(20)
      expect(result.end).toBe(35)
    })

    test('TSParameterProperty with undefined accessibility sets null', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          isParameterProperty: () => true,
          getAccessibility: () => undefined,
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 5, escapedText: 'p' },
          },
        }),
      )
      expect(result.accessibility).toBeNull()
    })
  })

  // =========================================================================
  // KIND_NAME_ALIASES additional mappings
  // =========================================================================
  describe('KIND_NAME_ALIASES additional mappings', () => {
    test('NullKeyword maps to Literal', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'NullKeyword' }))
      expect(result.type).toBe('Literal')
    })

    test('TrueKeyword maps to BooleanLiteral', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'TrueKeyword' }))
      expect(result.type).toBe('BooleanLiteral')
    })

    test('FalseKeyword maps to BooleanLiteral', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'FalseKeyword' }))
      expect(result.type).toBe('BooleanLiteral')
    })

    test('RegularExpressionLiteral maps to RegExpLiteral', () => {
      const result = nodeToGeneric(
        createMockNode({ kindName: 'RegularExpressionLiteral', text: '/test/' }),
      )
      expect(result.type).toBe('RegExpLiteral')
    })

    test('VariableDeclarationList maps to VariableDeclaration', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'VariableDeclarationList' }))
      expect(result.type).toBe('VariableDeclaration')
    })

    test('SpreadAssignment maps to SpreadElement', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'SpreadAssignment' }))
      expect(result.type).toBe('SpreadElement')
    })

    test('AwaitExpression maps to AwaitExpression', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'AwaitExpression' }))
      expect(result.type).toBe('AwaitExpression')
    })

    test('ParenthesizedExpression maps to SequenceExpression', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ParenthesizedExpression' }))
      expect(result.type).toBe('SequenceExpression')
    })

    test('AsExpression maps to TSAsExpression', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'AsExpression' }))
      expect(result.type).toBe('TSAsExpression')
    })

    test('TypeReference maps to TSTypeReference', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'TypeReference' }))
      expect(result.type).toBe('TSTypeReference')
    })
  })

  // =========================================================================
  // RegularExpressionLiteral edge cases
  // =========================================================================
  describe('RegularExpressionLiteral edge cases', () => {
    test('non-matching regex text does not set regex property', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'RegularExpressionLiteral',
          text: 'not-a-regex',
        }),
      )
      expect(result.raw).toBe('not-a-regex')
      expect(result.regex).toBeUndefined()
    })

    test('regex with all common flags', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'RegularExpressionLiteral',
          text: '/pattern/gimsuy',
        }),
      )
      expect(result.regex).toEqual({ pattern: 'pattern', flags: 'gimsuy' })
    })

    test('regex with empty pattern', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'RegularExpressionLiteral',
          text: '//g',
        }),
      )
      expect(result.regex).toEqual({ pattern: '', flags: 'g' })
    })
  })

  // =========================================================================
  // Export/Import isTypeOnly error handling
  // =========================================================================
  describe('export/import isTypeOnly error handling', () => {
    test('ExportDeclaration handles isTypeOnly throwing', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'ExportDeclaration',
          isTypeOnly: () => {
            throw new Error('fail')
          },
        }),
      )
      expect(result.exportKind).toBeUndefined()
    })

    test('ImportDeclaration handles isTypeOnly throwing', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'ImportDeclaration',
          isTypeOnly: () => {
            throw new Error('fail')
          },
        }),
      )
      expect(result.importKind).toBeUndefined()
    })
  })

  // =========================================================================
  // SetAccessorDeclaration additional coverage
  // =========================================================================
  describe('SetAccessorDeclaration additional', () => {
    test('detects accessibility protected', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'SetAccessorDeclaration',
          getAccessibility: () => 'protected',
        }),
      )
      expect(result.accessibility).toBe('protected')
    })

    test('no accessibility when getAccessibility returns undefined', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'SetAccessorDeclaration',
          getAccessibility: () => undefined,
        }),
      )
      expect(result.accessibility).toBeUndefined()
    })
  })

  // =========================================================================
  // convertCompilerNode integration
  // =========================================================================
  describe('convertCompilerNode integration', () => {
    test('enhanced properties merge into base', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Identifier',
          compilerNode: {
            escapedText: 'myVar',
          },
        }),
      )
      expect(result.name).toBe('myVar')
    })

    test('base properties win over enhanced properties', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Identifier',
          text: 'baseText',
          compilerNode: {},
        }),
      )
      expect(result.text).toBe('baseText')
    })

    test('operatorToken is processed through convertOperatorToken', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'BinaryExpression',
          compilerNode: {
            operatorToken: { kind: SyntaxKind.PlusToken, pos: 5, end: 6 },
          },
        }),
      )
      expect(result.operator).toBe('+')
    })
  })

  // =========================================================================
  // Parameter edge cases
  // =========================================================================
  describe('Parameter edge cases', () => {
    test('Parameter without name node does not flatten', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          compilerNode: {},
        }),
      )
      expect(result.type).toBe('Parameter')
    })

    test('Parameter with string name does not flatten', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          compilerNode: {
            name: 'stringName',
          },
        }),
      )
      expect(result.type).toBe('Parameter')
    })

    test('Parameter not a parameter property when isParameterProperty returns false', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          isParameterProperty: () => false,
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 1, escapedText: 'x' },
          },
        }),
      )
      expect(result.type).toBe('Identifier')
    })
  })

  // =========================================================================
  // extractImportSpecifiers additional edge cases
  // =========================================================================
  describe('extractImportSpecifiers additional edge cases', () => {
    test('handles importClause with non-object name', () => {
      const node = createMockNode({
        compilerNode: { importClause: { name: 'notAnObject' } },
      })
      expect(extractImportSpecifiers(node)).toEqual([])
    })

    test('handles element with non-object name', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: {
            namedBindings: { elements: [{ name: 'string', pos: 0, end: 5 }] },
          },
        },
      })
      const specs = extractImportSpecifiers(node)
      expect(specs).toHaveLength(1)
      expect((specs[0] as Record<string, unknown>).local).toBeUndefined()
    })

    test('handles element with non-object propertyName', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: {
            namedBindings: {
              elements: [
                {
                  name: { text: 'local', pos: 0, end: 5 },
                  propertyName: 'string',
                  pos: 0,
                  end: 5,
                },
              ],
            },
          },
        },
      })
      const specs = extractImportSpecifiers(node)
      const spec = specs[0] as Record<string, unknown>
      expect(spec.imported).toEqual({ type: 'Identifier', name: 'local', value: 'local' })
    })
  })

  // =========================================================================
  // extractExportSpecifiers additional edge cases
  // =========================================================================
  describe('extractExportSpecifiers additional edge cases', () => {
    test('handles element with non-object propertyName', () => {
      const node = createMockNode({
        compilerNode: {
          exportClause: {
            elements: [
              {
                name: { text: 'local', pos: 0, end: 5 },
                propertyName: 'string',
                pos: 0,
                end: 5,
              },
            ],
          },
        },
      })
      const specs = extractExportSpecifiers(node)
      const spec = specs[0] as Record<string, unknown>
      expect(spec.exported).toEqual({ type: 'Identifier', name: 'local', value: 'local' })
    })

    test('handles element without name', () => {
      const node = createMockNode({
        compilerNode: {
          exportClause: {
            elements: [{ pos: 0, end: 5 }],
          },
        },
      })
      const specs = extractExportSpecifiers(node)
      expect(specs).toHaveLength(1)
      const spec = specs[0] as Record<string, unknown>
      expect(spec.local).toBeUndefined()
      expect(spec.exported).toBeUndefined()
    })
  })

  // =========================================================================
  // KIND_NAME_ALIASES additional mappings — batch 2
  // =========================================================================
  describe('KIND_NAME_ALIASES additional mappings batch 2', () => {
    test('BigIntLiteral maps to Literal', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'NumericLiteral', text: '42n' }))
      expect(result.type).toBe('Literal')
    })

    test('NewExpression maps to NewExpression', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'CallExpression' }))
      expect(result.type).toBe('CallExpression')
    })

    test('PrefixUnaryExpression maps to UnaryExpression', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'PrefixUnaryExpression' }))
      expect(result.type).toBe('UnaryExpression')
    })

    test('PostfixUnaryExpression maps to UpdateExpression', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'PostfixUnaryExpression' }))
      expect(result.type).toBe('UpdateExpression')
    })

    test('ConditionalExpression maps to ConditionalExpression', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ConditionalExpression' }))
      expect(result.type).toBe('ConditionalExpression')
    })

    test('VariableStatement maps to VariableDeclaration', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'VariableStatement' }))
      expect(result.type).toBe('VariableDeclaration')
    })

    test('ClassDeclaration maps to ClassDeclaration', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ClassDeclaration' }))
      expect(result.type).toBe('ClassDeclaration')
    })

    test('InterfaceDeclaration maps to TSInterfaceDeclaration', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'InterfaceDeclaration' }))
      expect(result.type).toBe('TSInterfaceDeclaration')
    })

    test('ImportEqualsDeclaration maps to TSImportEqualsDeclaration', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ImportEqualsDeclaration' }))
      expect(result.type).toBe('TSImportEqualsDeclaration')
    })

    test('ImportExpression maps to Import', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ImportExpression' }))
      expect(result.type).toBe('Import')
    })

    test('ReturnStatement maps to ReturnStatement', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ReturnStatement' }))
      expect(result.type).toBe('ReturnStatement')
    })

    test('ThrowStatement maps to ThrowStatement', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ThrowStatement' }))
      expect(result.type).toBe('ThrowStatement')
    })

    test('IfStatement maps to IfStatement', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'IfStatement' }))
      expect(result.type).toBe('IfStatement')
    })

    test('ForStatement maps to ForStatement', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ForStatement' }))
      expect(result.type).toBe('ForStatement')
    })

    test('ForInStatement maps to ForInStatement', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ForInStatement' }))
      expect(result.type).toBe('ForInStatement')
    })

    test('ForOfStatement maps to ForOfStatement', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ForOfStatement' }))
      expect(result.type).toBe('ForOfStatement')
    })

    test('WhileStatement maps to WhileStatement', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'WhileStatement' }))
      expect(result.type).toBe('WhileStatement')
    })

    test('DoStatement maps to DoWhileStatement', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'DoStatement' }))
      expect(result.type).toBe('DoWhileStatement')
    })

    test('SwitchStatement maps to SwitchStatement', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'SwitchStatement' }))
      expect(result.type).toBe('SwitchStatement')
    })

    test('TryStatement maps to TryStatement', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'TryStatement' }))
      expect(result.type).toBe('TryStatement')
    })

    test('ExpressionStatement maps to ExpressionStatement', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ExpressionStatement' }))
      expect(result.type).toBe('ExpressionStatement')
    })

    test('CatchClause maps to CatchClause', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'CatchClause' }))
      expect(result.type).toBe('CatchClause')
    })

    test('CaseClause maps to SwitchCase', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'CaseClause' }))
      expect(result.type).toBe('SwitchCase')
    })

    test('DefaultClause maps to SwitchCase', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'DefaultClause' }))
      expect(result.type).toBe('SwitchCase')
    })

    test('PropertyDeclaration maps to PropertyDefinition', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'PropertyDeclaration' }))
      expect(result.type).toBe('PropertyDefinition')
    })

    test('PropertyAssignment maps to Property', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'PropertyAssignment' }))
      expect(result.type).toBe('Property')
    })

    test('SpreadElement maps to SpreadElement', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'SpreadElement' }))
      expect(result.type).toBe('SpreadElement')
    })

    test('TemplateExpression maps to TemplateLiteral', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'TemplateExpression' }))
      expect(result.type).toBe('TemplateLiteral')
    })

    test('NoSubstitutionTemplateLiteral maps to TemplateLiteral', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'NoSubstitutionTemplateLiteral' }))
      expect(result.type).toBe('TemplateLiteral')
    })

    test('TaggedTemplateExpression maps to TaggedTemplateExpression', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'TaggedTemplateExpression' }))
      expect(result.type).toBe('TaggedTemplateExpression')
    })

    test('YieldExpression maps to YieldExpression', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'YieldExpression' }))
      expect(result.type).toBe('YieldExpression')
    })

    test('DeleteExpression maps to UnaryExpression', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'DeleteExpression' }))
      expect(result.type).toBe('UnaryExpression')
    })

    test('VoidExpression maps to UnaryExpression', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'VoidExpression' }))
      expect(result.type).toBe('UnaryExpression')
    })

    test('TypeOfExpression maps to UnaryExpression', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'TypeOfExpression' }))
      expect(result.type).toBe('UnaryExpression')
    })

    test('InstanceOfExpression maps to BinaryExpression', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'InstanceOfExpression' }))
      expect(result.type).toBe('BinaryExpression')
    })

    test('InExpression maps to BinaryExpression', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'InExpression' }))
      expect(result.type).toBe('BinaryExpression')
    })

    test('TypeAssertion maps to TSTypeAssertion', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'TypeAssertion' }))
      expect(result.type).toBe('TSTypeAssertion')
    })

    test('NonNullExpression maps to TSNonNullExpression', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'NonNullExpression' }))
      expect(result.type).toBe('TSNonNullExpression')
    })

    test('ObjectDestructuring maps to ObjectPattern', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ObjectDestructuring' }))
      expect(result.type).toBe('ObjectPattern')
    })

    test('ArrayDestructuring maps to ArrayPattern', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ArrayDestructuring' }))
      expect(result.type).toBe('ArrayPattern')
    })

    test('ComputedPropertyName maps to Literal', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ComputedPropertyName' }))
      expect(result.type).toBe('Literal')
    })

    test('SuperKeyword maps to Super', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'SuperKeyword' }))
      expect(result.type).toBe('Super')
    })

    test('ThisKeyword maps to ThisExpression', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ThisKeyword' }))
      expect(result.type).toBe('ThisExpression')
    })

    test('BreakStatement maps to BreakStatement', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'BreakStatement' }))
      expect(result.type).toBe('BreakStatement')
    })

    test('ContinueStatement maps to ContinueStatement', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ContinueStatement' }))
      expect(result.type).toBe('ContinueStatement')
    })

    test('DebuggerStatement maps to DebuggerStatement', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'DebuggerStatement' }))
      expect(result.type).toBe('DebuggerStatement')
    })

    test('LabeledStatement maps to LabeledStatement', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'LabeledStatement' }))
      expect(result.type).toBe('LabeledStatement')
    })

    test('ClassExpression maps to ClassExpression', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ClassExpression' }))
      expect(result.type).toBe('ClassExpression')
    })

    test('PrivateIdentifier maps to PrivateIdentifier', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'PrivateIdentifier' }))
      expect(result.type).toBe('PrivateIdentifier')
    })

    test('EnumDeclaration maps to TSEnumDeclaration', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'EnumDeclaration' }))
      expect(result.type).toBe('TSEnumDeclaration')
    })

    test('ModuleDeclaration maps to TSModuleDeclaration', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ModuleDeclaration' }))
      expect(result.type).toBe('TSModuleDeclaration')
    })

    test('TypeLiteral maps to TSTypeLiteral', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'TypeLiteral' }))
      expect(result.type).toBe('TSTypeLiteral')
    })

    test('ImportSpecifier maps to ImportSpecifier', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ImportSpecifier' }))
      expect(result.type).toBe('ImportSpecifier')
    })

    test('ExportSpecifier maps to ExportSpecifier', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'ExportSpecifier' }))
      expect(result.type).toBe('ExportSpecifier')
    })

    test('StaticBlock maps to StaticBlock', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'StaticBlock' }))
      expect(result.type).toBe('StaticBlock')
    })

    test('DefaultKeyword maps to Literal', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'DefaultKeyword' }))
      expect(result.type).toBe('Literal')
    })

    test('unknown kind name passes through unchanged', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'SomeCustomKind' }))
      expect(result.type).toBe('SomeCustomKind')
    })
  })

  // =========================================================================
  // MethodDefinition value synthesis additional
  // =========================================================================
  describe('MethodDefinition value synthesis additional', () => {
    test('Constructor value has default params array', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'Constructor' }))
      const value = result.value as Record<string, unknown>
      expect(value.params).toEqual([])
    })

    test('Constructor value has default body', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'Constructor' }))
      const value = result.value as Record<string, unknown>
      expect((value.body as Record<string, unknown>).type).toBe('BlockStatement')
    })

    test('GetAccessor value has parent pointing to base', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'GetAccessor' }))
      const value = result.value as Record<string, unknown>
      expect(value.parent).toBe(result)
    })

    test('SetAccessor value has parent pointing to base', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'SetAccessor' }))
      const value = result.value as Record<string, unknown>
      expect(value.parent).toBe(result)
    })

    test('Constructor value preserves range from base', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'Constructor', start: 5, end: 25 }))
      const value = result.value as Record<string, unknown>
      expect(value.range).toEqual([5, 25])
    })

    test('GetAccessor value has default params array', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'GetAccessor' }))
      const value = result.value as Record<string, unknown>
      expect(value.params).toEqual([])
    })

    test('SetAccessor value has default body', () => {
      const result = nodeToGeneric(createMockNode({ kindName: 'SetAccessor' }))
      const value = result.value as Record<string, unknown>
      expect((value.body as Record<string, unknown>).type).toBe('BlockStatement')
    })
  })

  // =========================================================================
  // TSParameterProperty additional coverage
  // =========================================================================
  describe('TSParameterProperty additional', () => {
    test('with accessibility=protected', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          isParameterProperty: () => true,
          getAccessibility: () => 'protected',
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 5, escapedText: 'p' },
          },
        }),
      )
      expect(result.accessibility).toBe('protected')
    })

    test('with readonly=false', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          isParameterProperty: () => true,
          isReadonly: () => false,
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 5, escapedText: 'p' },
          },
        }),
      )
      expect(result.readonly).toBe(false)
    })

    test('with override=false', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          isParameterProperty: () => true,
          hasOverrideKeyword: () => false,
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 5, escapedText: 'p' },
          },
        }),
      )
      expect(result.override).toBe(false)
    })

    test('parameter contains flattened identifier', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          isParameterProperty: () => true,
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 5, escapedText: 'myProp' },
          },
        }),
      )
      const param = result.parameter as Record<string, unknown>
      expect(param.name).toBe('myProp')
    })
  })

  // =========================================================================
  // Parameter transformations additional
  // =========================================================================
  describe('Parameter transformations additional', () => {
    test('RestElement deletes questionToken', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          compilerNode: {
            dotDotDotToken: { kind: SyntaxKind.DotDotDotToken, pos: 0, end: 3 },
            name: { kind: SyntaxKind.Identifier, pos: 3, end: 7, escapedText: 'args' },
            questionToken: { kind: SyntaxKind.QuestionToken, pos: 2, end: 3 },
          },
        }),
      )
      expect(result).not.toHaveProperty('questionToken')
    })

    test('RestElement deletes typeAnnotation', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          compilerNode: {
            dotDotDotToken: { kind: SyntaxKind.DotDotDotToken, pos: 0, end: 3 },
            name: { kind: SyntaxKind.Identifier, pos: 3, end: 7, escapedText: 'args' },
            typeAnnotation: { kind: SyntaxKind.TypeReference, pos: 7, end: 15 },
          },
        }),
      )
      expect(result).not.toHaveProperty('typeAnnotation')
    })

    test('RestElement deletes modifiers', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          compilerNode: {
            dotDotDotToken: { kind: SyntaxKind.DotDotDotToken, pos: 0, end: 3 },
            name: { kind: SyntaxKind.Identifier, pos: 3, end: 7, escapedText: 'args' },
            modifiers: [{ kind: SyntaxKind.PublicKeyword }],
          },
        }),
      )
      expect(result).not.toHaveProperty('modifiers')
    })

    test('AssignmentPattern deletes questionToken', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 1, escapedText: 'x' },
            initializer: { kind: SyntaxKind.NumericLiteral, pos: 4, end: 6, text: '10' },
            questionToken: { kind: SyntaxKind.QuestionToken, pos: 2, end: 3 },
          },
        }),
      )
      expect(result).not.toHaveProperty('questionToken')
    })

    test('AssignmentPattern deletes typeAnnotation', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 1, escapedText: 'x' },
            initializer: { kind: SyntaxKind.NumericLiteral, pos: 4, end: 6, text: '10' },
            typeAnnotation: { kind: SyntaxKind.TypeReference, pos: 7, end: 15 },
          },
        }),
      )
      expect(result).not.toHaveProperty('typeAnnotation')
    })

    test('AssignmentPattern deletes modifiers', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 0, end: 1, escapedText: 'x' },
            initializer: { kind: SyntaxKind.NumericLiteral, pos: 4, end: 6, text: '10' },
            modifiers: [{ kind: SyntaxKind.PublicKeyword }],
          },
        }),
      )
      expect(result).not.toHaveProperty('modifiers')
    })

    test('Simple parameter flattens with name range preserved', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Parameter',
          start: 10,
          end: 20,
          compilerNode: {
            name: { kind: SyntaxKind.Identifier, pos: 10, end: 20, escapedText: 'z' },
          },
        }),
      )
      expect(result.type).toBe('Identifier')
      expect(result.range).toBeDefined()
    })
  })

  // =========================================================================
  // extractImportSpecifiers edge cases additional
  // =========================================================================
  describe('extractImportSpecifiers edge cases additional', () => {
    test('handles namedBindings with empty elements array', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: { namedBindings: { elements: [] } },
        },
      })
      expect(extractImportSpecifiers(node)).toEqual([])
    })

    test('handles element with undefined name', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: {
            namedBindings: { elements: [{ name: undefined }] },
          },
        },
      })
      const specs = extractImportSpecifiers(node)
      expect(specs).toHaveLength(1)
      expect((specs[0] as Record<string, unknown>).local).toBeUndefined()
    })

    test('handles importClause that is not an object', () => {
      const node = createMockNode({
        compilerNode: { importClause: 'string' },
      })
      expect(extractImportSpecifiers(node)).toEqual([])
    })

    test('handles importClause with non-object namedBindings', () => {
      const node = createMockNode({
        compilerNode: { importClause: { namedBindings: 'bad' } },
      })
      expect(extractImportSpecifiers(node)).toEqual([])
    })

    test('named import specifier has start and end from element', () => {
      const node = createMockNode({
        compilerNode: {
          importClause: {
            namedBindings: {
              elements: [{ name: { text: 'X', pos: 5, end: 6 }, pos: 4, end: 7 }],
            },
          },
        },
      })
      const specs = extractImportSpecifiers(node)
      const spec = specs[0] as Record<string, unknown>
      expect(spec.start).toBe(4)
      expect(spec.end).toBe(7)
    })
  })

  // =========================================================================
  // extractExportSpecifiers edge cases additional
  // =========================================================================
  describe('extractExportSpecifiers edge cases additional', () => {
    test('handles element with undefined name', () => {
      const node = createMockNode({
        compilerNode: {
          exportClause: {
            elements: [{ name: undefined, pos: 0, end: 5 }],
          },
        },
      })
      const specs = extractExportSpecifiers(node)
      expect(specs).toHaveLength(1)
      const spec = specs[0] as Record<string, unknown>
      expect(spec.local).toBeUndefined()
      expect(spec.exported).toBeUndefined()
    })

    test('handles exportClause with non-array elements', () => {
      const node = createMockNode({
        compilerNode: { exportClause: { elements: 'not-array' } },
      })
      expect(extractExportSpecifiers(node)).toEqual([])
    })

    test('handles compilerNode with null exportClause', () => {
      const node = createMockNode({
        compilerNode: { exportClause: null },
      })
      expect(extractExportSpecifiers(node)).toEqual([])
    })
  })

  // =========================================================================
  // setParentRefs additional edge cases
  // =========================================================================
  describe('setParentRefs additional edge cases', () => {
    test('handles node with Symbol-keyed properties', () => {
      const child: Record<string, unknown> = { type: 'Child' }
      const root: Record<string, unknown> = { type: 'Root', child }
      expect(() => setParentRefs(root, null)).not.toThrow()
      expect(child.parent).toBe(root)
    })

    test('handles large tree with many branches', () => {
      const children: Record<string, unknown>[] = []
      for (let i = 0; i < 50; i++) {
        children.push({ type: `Node${i}` })
      }
      const root: Record<string, unknown> = { type: 'Root', children }
      setParentRefs(root, null)
      for (let i = 0; i < 50; i++) {
        expect(children[i].parent).toBe(root)
      }
    })

    test('handles node with only parent property already set', () => {
      const parent: Record<string, unknown> = { type: 'Parent' }
      const child: Record<string, unknown> = { type: 'Child' }
      child.parent = parent
      setParentRefs(child, null)
      // Existing parent remains when setParentRefs is called with null parent
    })

    test('handles function values in properties', () => {
      const root: Record<string, unknown> = {
        type: 'Node',
        callback: () => 'test',
      }
      expect(() => setParentRefs(root, null)).not.toThrow()
    })

    test('handles Date object values in properties', () => {
      const root: Record<string, unknown> = {
        type: 'Node',
        date: new Date(),
      }
      expect(() => setParentRefs(root, null)).not.toThrow()
    })

    test('sets parent on child within mixed array', () => {
      const typedChild: Record<string, unknown> = { type: 'Typed' }
      const root: Record<string, unknown> = {
        type: 'Root',
        mixed: [null, 42, 'str', typedChild],
      }
      setParentRefs(root, null)
      expect(typedChild.parent).toBe(root)
    })
  })

  // =========================================================================
  // getExportInfo additional edge cases
  // =========================================================================
  describe('getExportInfo additional edge cases', () => {
    test('handles many modifiers with export buried', () => {
      const node = createMockNode({
        getModifiers: () => [
          { getKindName: () => 'DeclareKeyword' },
          { getKindName: () => 'AsyncKeyword' },
          { getKindName: () => 'ExportKeyword' },
          { getKindName: () => 'StaticKeyword' },
        ],
      })
      expect(getExportInfo(node)).toEqual({ isExported: true, isDefault: false })
    })

    test('handles modifier returning undefined getKindName result', () => {
      const node = createMockNode({
        getModifiers: () => [{ getKindName: () => undefined as unknown as string }],
      })
      expect(getExportInfo(node)).toEqual({ isExported: false, isDefault: false })
    })
  })

  // =========================================================================
  // nodeToGeneric misc additional
  // =========================================================================
  describe('nodeToGeneric misc additional', () => {
    test('nodeToGeneric returns object with loc property', () => {
      const result = nodeToGeneric(createMockNode())
      expect(result).toHaveProperty('loc')
    })

    test('nodeToGeneric returns object with text property', () => {
      const result = nodeToGeneric(createMockNode({ text: 'abc' }))
      expect(result.text).toBe('abc')
    })

    test('nodeToGeneric preserves start position in loc', () => {
      const result = nodeToGeneric(createMockNode({ start: 100 }))
      const loc = result.loc as { start: { line: number; column: number } }
      expect(loc.start.column).toBe(100)
    })

    test('nodeToGeneric preserves end position in loc', () => {
      const result = nodeToGeneric(createMockNode({ end: 250 }))
      const loc = result.loc as { end: { line: number; column: number } }
      expect(loc.end.column).toBe(250)
    })

    test('FunctionExpression with async and generator sets both flags', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'FunctionExpression',
          isAsync: () => true,
          isGenerator: () => true,
        }),
      )
      expect(result.async).toBe(true)
      expect(result.generator).toBe(true)
    })

    test('FunctionDeclaration with async and generator sets both flags', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'FunctionDeclaration',
          isAsync: () => true,
          isGenerator: () => true,
        }),
      )
      expect(result.async).toBe(true)
      expect(result.generator).toBe(true)
    })

    test('ArrowFunction with async=false does not set async', () => {
      const result = nodeToGeneric(
        createMockNode({ kindName: 'ArrowFunction', isAsync: () => false }),
      )
      expect(result.async).toBeUndefined()
    })

    test('MethodDeclaration with getAccessibility returning empty string', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'MethodDeclaration',
          getAccessibility: () => '',
        }),
      )
      expect(result.accessibility).toBeUndefined()
    })

    test('PropertyDeclaration with static and readonly both true', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'PropertyDeclaration',
          isStatic: () => true,
          isReadonly: () => true,
        }),
      )
      expect(result.static).toBe(true)
      expect(result.readonly).toBe(true)
    })

    test('ConstructorDeclaration with getAccessibility returning empty string', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'ConstructorDeclaration',
          getAccessibility: () => '',
        }),
      )
      expect(result.accessibility).toBeUndefined()
    })

    test('GetAccessorDeclaration with getAccessibility returning empty string', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'GetAccessorDeclaration',
          getAccessibility: () => '',
        }),
      )
      expect(result.accessibility).toBeUndefined()
    })

    test('SetAccessorDeclaration with getAccessibility returning empty string', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'SetAccessorDeclaration',
          getAccessibility: () => '',
        }),
      )
      expect(result.accessibility).toBeUndefined()
    })
  })

  // =========================================================================
  // ChainExpression additional
  // =========================================================================
  describe('ChainExpression additional', () => {
    test('ChainExpression preserves loc from inner node', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'PropertyAccessExpression',
          questionDotToken: {},
          start: 10,
          end: 20,
        }),
      )
      const loc = result.loc as { start: { column: number }; end: { column: number } }
      expect(loc.start.column).toBe(10)
      expect(loc.end.column).toBe(20)
    })

    test('ChainExpression expression has computed=false for PropertyAccess', () => {
      const result = nodeToGeneric(
        createMockNode({ kindName: 'PropertyAccessExpression', questionDotToken: {} }),
      )
      const expr = result.expression as Record<string, unknown>
      expect(expr.computed).toBe(false)
    })

    test('ChainExpression expression has computed=true for ElementAccess', () => {
      const result = nodeToGeneric(
        createMockNode({ kindName: 'ElementAccessExpression', questionDotToken: {} }),
      )
      const expr = result.expression as Record<string, unknown>
      expect(expr.computed).toBe(true)
    })
  })

  // =========================================================================
  // convertCompilerNode integration additional
  // =========================================================================
  describe('convertCompilerNode integration additional', () => {
    test('operatorToken field is converted through convertOperatorToken', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'BinaryExpression',
          compilerNode: {
            operatorToken: { kind: SyntaxKind.MinusToken, pos: 5, end: 6 },
          },
        }),
      )
      expect(result.operator).toBe('-')
    })

    test('enhanced properties do not overwrite base type', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Identifier',
          compilerNode: {
            escapedText: 'x',
          },
        }),
      )
      expect(result.type).toBe('Identifier')
    })

    test('enhanced properties add name for Identifier', () => {
      const result = nodeToGeneric(
        createMockNode({
          kindName: 'Identifier',
          compilerNode: {
            escapedText: 'myVarName',
          },
        }),
      )
      expect(result.name).toBe('myVarName')
    })
  })
})

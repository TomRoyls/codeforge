import { describe, expect, test, vi } from 'vitest'
import { noTypeAliasSingleUnionRule } from '../../../../src/rules/patterns/no-type-alias-single-union.js'
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
    getSource: () => 'type MyType = "a"',
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

function makeTypeAliasNode(
  typeName: string,
  typeAnnotation: Record<string, unknown>,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'TSTypeAliasDeclaration',
    name: { type: 'Identifier', name: typeName },
    typeAnnotation,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSingleUnionType(singleType: Record<string, unknown>): { type: string; types: Record<string, unknown>[] } {
  return {
    type: 'TSUnionType',
    types: [singleType],
  }
}

// ===== META TESTS (8) =====

describe('no-type-alias-single-union rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noTypeAliasSingleUnionRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noTypeAliasSingleUnionRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noTypeAliasSingleUnionRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noTypeAliasSingleUnionRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noTypeAliasSingleUnionRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning type alias', () => {
      const desc = noTypeAliasSingleUnionRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/type/)
    })

    test('should have correct docs URL', () => {
      expect(noTypeAliasSingleUnionRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-type-alias-single-union',
      )
    })

    test('should have empty schema', () => {
      expect(noTypeAliasSingleUnionRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with TSTypeAliasDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      expect(visitor).toHaveProperty('TSTypeAliasDeclaration')
      expect(typeof visitor.TSTypeAliasDeclaration).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noTypeAliasSingleUnionRule).toBeDefined()
      expect(noTypeAliasSingleUnionRule.meta).toBeDefined()
      expect(noTypeAliasSingleUnionRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS SINGLE-ELEMENT UNION (25) =====

  describe('positive cases — reports single-element union', () => {
    test('reports for single TSLiteralType in union', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } })))
      expect(reports.length).toBe(1)
    })

    test('reports for single TSTypeReference in union', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('RefType', makeSingleUnionType({ type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'string' } })))
      expect(reports.length).toBe(1)
    })

    test('reports for single TSStringKeyword in union', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('StrType', makeSingleUnionType({ type: 'TSStringKeyword' })))
      expect(reports.length).toBe(1)
    })

    test('reports for single TSNumberKeyword in union', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('NumType', makeSingleUnionType({ type: 'TSNumberKeyword' })))
      expect(reports.length).toBe(1)
    })

    test('reports for single TSBooleanKeyword in union', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('BoolType', makeSingleUnionType({ type: 'TSBooleanKeyword' })))
      expect(reports.length).toBe(1)
    })

    test('reports for single TSAnyKeyword in union', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('AnyType', makeSingleUnionType({ type: 'TSAnyKeyword' })))
      expect(reports.length).toBe(1)
    })

    test('reports for single TSNullKeyword in union', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('NullType', makeSingleUnionType({ type: 'TSNullKeyword' })))
      expect(reports.length).toBe(1)
    })

    test('reports for single TSUndefinedKeyword in union', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('UndefType', makeSingleUnionType({ type: 'TSUndefinedKeyword' })))
      expect(reports.length).toBe(1)
    })

    test('reports for single TSVoidKeyword in union', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('VoidType', makeSingleUnionType({ type: 'TSVoidKeyword' })))
      expect(reports.length).toBe(1)
    })

    test('reports for single TSNeverKeyword in union', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('NeverType', makeSingleUnionType({ type: 'TSNeverKeyword' })))
      expect(reports.length).toBe(1)
    })

    test('reports for single TSObjectKeyword in union', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('ObjType', makeSingleUnionType({ type: 'TSObjectKeyword' })))
      expect(reports.length).toBe(1)
    })

    test('reports for type alias named "Status"', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('Status', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'active' } })))
      expect(reports.length).toBe(1)
    })

    test('reports for type alias named "T"', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('T', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 42 } })))
      expect(reports.length).toBe(1)
    })

    test('reports for type alias with numeric literal in union', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('Num', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 100 } })))
      expect(reports.length).toBe(1)
    })

    test('reports for type alias with boolean literal true in union', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('TrueVal', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: true } })))
      expect(reports.length).toBe(1)
    })

    test('reports for type alias with boolean literal false in union', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('FalseVal', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: false } })))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "single-element union"', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } })))
      expect(reports[0].message).toContain('single-element union')
    })

    test('report message mentions "redundant"', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } })))
      expect(reports[0].message.toLowerCase()).toContain('redundant')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } })))
      expect(reports[0].message).toBe('Type alias for a single-element union is redundant.')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('A', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } })))
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('B', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'b' } })))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('A', makeSingleUnionType({ type: 'TSStringKeyword' })))
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('B', makeSingleUnionType({ type: 'TSNumberKeyword' })))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for type alias with template literal type in union', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('TplType', makeSingleUnionType({ type: 'TSTemplateLiteralType', quasis: [], types: [] })))
      expect(reports.length).toBe(1)
    })

    test('reports for type alias with array type in union', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('ArrType', makeSingleUnionType({ type: 'TSArrayType', elementType: { type: 'TSStringKeyword' } })))
      expect(reports.length).toBe(1)
    })

    test('reports for type alias with parenthesized type in union', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('ParenType', makeSingleUnionType({ type: 'TSParenthesizedType', typeAnnotation: { type: 'TSStringKeyword' } })))
      expect(reports.length).toBe(1)
    })

    test('reports for type alias with function type in union', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('FnType', makeSingleUnionType({ type: 'TSFunctionType', parameters: [] })))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } })))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } })))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      const node = makeTypeAliasNode('MyType', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } }))
      visitor.TSTypeAliasDeclaration(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc reflects node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } }), 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } }), 2, 4, 2, 25))
      expect(reports[0].loc?.end.line).toBe(2)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } })))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report message is a non-empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } })))
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('report loc start has line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } })))
      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('report loc end has line and column', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } })))
      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('report loc reflects specific node location at line 10', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } }), 10, 4, 10, 22))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('two reports accumulate with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('A', makeSingleUnionType({ type: 'TSStringKeyword' })))
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('B', makeSingleUnionType({ type: 'TSNumberKeyword' })))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report node has correct type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } })))
      const reportNode = reports[0].node as Record<string, unknown>
      expect(reportNode.type).toBe('TSTypeAliasDeclaration')
    })

    test('report node preserves name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } })))
      const reportNode = reports[0].node as Record<string, unknown>
      const name = reportNode.name as Record<string, unknown>
      expect(name.name).toBe('MyType')
    })

    test('report node preserves typeAnnotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } })))
      const reportNode = reports[0].node as Record<string, unknown>
      const ta = reportNode.typeAnnotation as Record<string, unknown>
      expect(ta.type).toBe('TSUnionType')
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      const node = makeTypeAliasNode('MyType', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } }))
      visitor.TSTypeAliasDeclaration(node)
      visitor.TSTypeAliasDeclaration(node)
      visitor.TSTypeAliasDeclaration(node)
      expect(reports.length).toBe(3)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for multi-element union with two types', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', { type: 'TSUnionType', types: [{ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } }, { type: 'TSLiteralType', literal: { type: 'Literal', value: 'b' } }] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for multi-element union with three types', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', { type: 'TSUnionType', types: [{ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } }, { type: 'TSLiteralType', literal: { type: 'Literal', value: 'b' } }, { type: 'TSLiteralType', literal: { type: 'Literal', value: 'c' } }] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-union type annotation (TSStringKeyword)', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', { type: 'TSStringKeyword' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-union type annotation (TSNumberKeyword)', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', { type: 'TSNumberKeyword' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for TSTypeReference annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', { type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'string' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for TSArrayType annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', { type: 'TSArrayType', elementType: { type: 'TSStringKeyword' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for TSIntersectionType annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('MyType', { type: 'TSIntersectionType', types: [{ type: 'TSStringKeyword' }, { type: 'TSNullKeyword' }] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      expect(() => visitor.TSTypeAliasDeclaration(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      expect(() => visitor.TSTypeAliasDeclaration(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      expect(() => visitor.TSTypeAliasDeclaration({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type (Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      expect(() => visitor.TSTypeAliasDeclaration('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      expect(() => visitor.TSTypeAliasDeclaration(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      expect(() => visitor.TSTypeAliasDeclaration(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report when typeAnnotation is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration({ type: 'TSTypeAliasDeclaration', name: { type: 'Identifier', name: 'T' }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when typeAnnotation is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration({ type: 'TSTypeAliasDeclaration', name: { type: 'Identifier', name: 'T' }, typeAnnotation: null, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when types array has zero elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('EmptyUnion', { type: 'TSUnionType', types: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report when types is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('BadTypes', { type: 'TSUnionType', types: 'not-array' }))
      expect(reports.length).toBe(0)
    })

    test('does not report when types is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('NoTypes', { type: 'TSUnionType' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for five-element union', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('BigUnion', { type: 'TSUnionType', types: [{ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } }, { type: 'TSLiteralType', literal: { type: 'Literal', value: 'b' } }, { type: 'TSLiteralType', literal: { type: 'Literal', value: 'c' } }, { type: 'TSLiteralType', literal: { type: 'Literal', value: 'd' } }, { type: 'TSLiteralType', literal: { type: 'Literal', value: 'e' } }] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noTypeAliasSingleUnionRule.create(ctx1)
      const visitor2 = noTypeAliasSingleUnionRule.create(ctx2)
      visitor1.TSTypeAliasDeclaration(makeTypeAliasNode('A', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } })))
      visitor2.TSTypeAliasDeclaration(makeTypeAliasNode('B', { type: 'TSStringKeyword' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('A', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } })))
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('B', { type: 'TSStringKeyword' }))
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('C', makeSingleUnionType({ type: 'TSNumberKeyword' })))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      const node = { type: 'TSTypeAliasDeclaration', name: { type: 'Identifier', name: 'T' }, typeAnnotation: makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'x' } }) }
      visitor.TSTypeAliasDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      const node = { type: 'TSTypeAliasDeclaration', name: { type: 'Identifier', name: 'T' }, typeAnnotation: makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'x' } }) }
      visitor.TSTypeAliasDeclaration(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('A', { type: 'TSStringKeyword' }))
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('B', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } })))
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('C', { type: 'TSUnionType', types: [{ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } }, { type: 'TSLiteralType', literal: { type: 'Literal', value: 'b' } }] }))
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('D', makeSingleUnionType({ type: 'TSNumberKeyword' })))
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('E', { type: 'TSNumberKeyword' }))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noTypeAliasSingleUnionRule.create(context)
      const visitor2 = noTypeAliasSingleUnionRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noTypeAliasSingleUnionRule.meta
      const meta2 = noTypeAliasSingleUnionRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      const node = {
        type: 'TSTypeAliasDeclaration',
        name: { type: 'Identifier', name: 'T' },
        typeAnnotation: makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } }),
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        declare: false,
      }
      visitor.TSTypeAliasDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration({ type: 'TSTypeAliasDeclaration', name: { type: 'Identifier', name: 'T' }, typeAnnotation: makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } }), loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration({ type: 'TSTypeAliasDeclaration', name: { type: 'Identifier', name: 'T' }, typeAnnotation: makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } }), loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('rule exports are correct', () => {
      expect(noTypeAliasSingleUnionRule).toBeDefined()
      expect(typeof noTypeAliasSingleUnionRule.create).toBe('function')
      expect(typeof noTypeAliasSingleUnionRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration({ type: 'TSTypeAliasDeclaration', name: { type: 'Identifier', name: 'T' }, typeAnnotation: makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } }), loc: makeLoc(1, 0, 1, 20), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('does not report when typeAnnotation is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration({ type: 'TSTypeAliasDeclaration', name: { type: 'Identifier', name: 'T' }, typeAnnotation: 'string', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when typeAnnotation is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration({ type: 'TSTypeAliasDeclaration', name: { type: 'Identifier', name: 'T' }, typeAnnotation: 42, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when typeAnnotation is a boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration({ type: 'TSTypeAliasDeclaration', name: { type: 'Identifier', name: 'T' }, typeAnnotation: true, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('handles typeAnnotation with types as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('T', { type: 'TSUnionType', types: null }))
      expect(reports.length).toBe(0)
    })

    test('handles node with two-element union correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('Status', { type: 'TSUnionType', types: [{ type: 'TSLiteralType', literal: { type: 'Literal', value: 'active' } }, { type: 'TSLiteralType', literal: { type: 'Literal', value: 'inactive' } }] }))
      expect(reports.length).toBe(0)
    })

    test('report loc values for node at line 100', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('T', makeSingleUnionType({ type: 'TSLiteralType', literal: { type: 'Literal', value: 'x' } }), 100, 0, 100, 15))
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(100)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      expect(() => visitor.TSTypeAliasDeclaration([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node with TSTypeOperator annotation', () => {
      const { context, reports } = createMockContext()
      const visitor = noTypeAliasSingleUnionRule.create(context)
      visitor.TSTypeAliasDeclaration(makeTypeAliasNode('Keys', { type: 'TSTypeOperator', operator: 'keyof', typeAnnotation: { type: 'TSTypeReference', typeName: { type: 'Identifier', name: 'Obj' } } }))
      expect(reports.length).toBe(0)
    })
  })
})

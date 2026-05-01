import { describe, expect, test, vi } from 'vitest'
import { noRedundantTypeConstituentsRule } from '../../../../src/rules/patterns/no-redundant-type-constituents.js'
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
    getSource: () => '/src/',
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

function makeUnionNode(
  types: Array<{ type: string; literal?: { type: string; value: unknown } }>,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'TSUnionType',
    types,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-redundant-type-constituents rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noRedundantTypeConstituentsRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noRedundantTypeConstituentsRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noRedundantTypeConstituentsRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noRedundantTypeConstituentsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noRedundantTypeConstituentsRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning redundant', () => {
      const desc = noRedundantTypeConstituentsRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/redundant/)
    })

    test('should have correct docs URL', () => {
      expect(noRedundantTypeConstituentsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-redundant-type-constituents',
      )
    })

    test('should have empty schema', () => {
      expect(noRedundantTypeConstituentsRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with TSUnionType', () => {
      const { context } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      expect(visitor).toHaveProperty('TSUnionType')
      expect(typeof visitor.TSUnionType).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noRedundantTypeConstituentsRule).toBeDefined()
      expect(noRedundantTypeConstituentsRule.meta).toBeDefined()
      expect(noRedundantTypeConstituentsRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS REDUNDANT CONSTITUENTS (25) =====

  describe('positive cases — reports redundant type constituents', () => {
    test('reports duplicate string literal "a" | "a"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports duplicate number literal 1 | 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 1 } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 1 } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports duplicate boolean literal true | true', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: true } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: true } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports duplicate in union of three with repeated last', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'b' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports duplicate in union of three with repeated middle', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'x' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'y' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'y' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports duplicate in large union with same first and last', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'alpha' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'beta' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'gamma' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'delta' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'alpha' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports duplicate with null literal value', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: null } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: null } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports duplicate with number 0 value', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 0 } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 0 } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports duplicate with empty string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: '' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: '' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports duplicate with false boolean value', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: false } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: false } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports only once even with multiple duplicates in same union', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'b' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'b' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports duplicate with negative number value', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: -1 } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: -1 } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports duplicate with TemplateLiteral type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'TemplateLiteral', value: 'hello' } },
        { type: 'TSLiteralType', literal: { type: 'TemplateLiteral', value: 'hello' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports duplicate with BigIntLiteral type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'BigIntLiteral', value: '100n' } },
        { type: 'TSLiteralType', literal: { type: 'BigIntLiteral', value: '100n' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports duplicate with float value', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 3.14 } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 3.14 } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports duplicate with special characters in string', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: '\n\t' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: '\n\t' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports duplicate with emoji string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: '🎉' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: '🎉' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports duplicate in union with mixed literal and non-literal types', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSStringKeyword' },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports duplicate even with non-literal types interspersed', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'foo' } },
        { type: 'TSNumberKeyword' },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'foo' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports duplicate with long string values', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a very long string value here' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a very long string value here' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports duplicate with undefined literal value', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: undefined } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: undefined } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports duplicate with RegExp literal type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'RegExpLiteral', value: '/abc/' } },
        { type: 'TSLiteralType', literal: { type: 'RegExpLiteral', value: '/abc/' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports when first two types are duplicates', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'z' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'z' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'y' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports when all three types are identical', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'same' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'same' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'same' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ]))
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'b' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'b' } },
      ]))
      expect(reports.length).toBe(2)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message is exactly "Redundant type constituent in union."', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ]))
      expect(reports[0].message).toBe('Redundant type constituent in union.')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input TSUnionType node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      const node = makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ])
      visitor.TSUnionType(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc start line is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ], 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('report loc start column is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ], 5, 10, 5, 20))
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end line is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ], 5, 10, 8, 15))
      expect(reports[0].loc?.end.line).toBe(8)
    })

    test('report loc end column is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ], 5, 10, 8, 15))
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('all reports across calls have the same message', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ]))
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 1 } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 1 } },
      ]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ], 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('report message contains "Redundant"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ]))
      expect(reports[0].message).toContain('Redundant')
    })

    test('report message contains "constituent"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ]))
      expect(reports[0].message).toContain('constituent')
    })

    test('report message contains "union"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ]))
      expect(reports[0].message).toContain('union')
    })

    test('second report across calls has independent loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ], 1, 0, 1, 10))
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'b' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'b' } },
      ], 3, 5, 3, 15))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(3)
      expect(reports[1].loc?.start.column).toBe(5)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for different string literals "a" | "b"', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'b' } },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for different number literals 1 | 2', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 1 } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 2 } },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for different boolean values true | false', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: true } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: false } },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for different literal types with same value', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'hello' } },
        { type: 'TSLiteralType', literal: { type: 'TemplateLiteral', value: 'hello' } },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for union with only non-literal types', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSStringKeyword' },
        { type: 'TSNumberKeyword' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType({ types: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      expect(() => visitor.TSUnionType(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      expect(() => visitor.TSUnionType(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      expect(() => visitor.TSUnionType({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      expect(() => visitor.TSUnionType('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      expect(() => visitor.TSUnionType(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for TSIntersectionType node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType({ type: 'TSIntersectionType', types: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for union with fewer than 2 types', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for union with empty types array', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for union with non-array types', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType({ type: 'TSUnionType', types: 'not-array', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when types is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType({ type: 'TSUnionType', types: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when types is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType({ type: 'TSUnionType', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for TSLiteralType without literal property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType' },
        { type: 'TSLiteralType' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for TSLiteralType with non-object literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: 'not-object' },
        { type: 'TSLiteralType', literal: 'not-object' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      expect(() => visitor.TSUnionType(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      expect(() => visitor.TSUnionType([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for distinct three-part literal union', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'b' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'c' } },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noRedundantTypeConstituentsRule.create(ctx1)
      const visitor2 = noRedundantTypeConstituentsRule.create(ctx2)
      visitor1.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ]))
      visitor2.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'b' } },
      ]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ]))
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'b' } },
      ]))
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'x' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'x' } },
      ]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      const node = {
        type: 'TSUnionType',
        types: [
          { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
          { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        ],
      }
      visitor.TSUnionType(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      const node = {
        type: 'TSUnionType',
        types: [
          { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
          { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        ],
      }
      visitor.TSUnionType(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'b' } },
      ]))
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ]))
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSStringKeyword' },
        { type: 'TSNumberKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noRedundantTypeConstituentsRule.create(context)
      const visitor2 = noRedundantTypeConstituentsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noRedundantTypeConstituentsRule.meta
      const meta2 = noRedundantTypeConstituentsRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      const node = {
        type: 'TSUnionType',
        types: [
          { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
          { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        ],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        _parent: {},
      }
      visitor.TSUnionType(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType({
        type: 'TSUnionType',
        types: [
          { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
          { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        ],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType({
        type: 'TSUnionType',
        types: [
          { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
          { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        ],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      const node = makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ])
      visitor.TSUnionType(node)
      visitor.TSUnionType(node)
      visitor.TSUnionType(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noRedundantTypeConstituentsRule).toBeDefined()
      expect(typeof noRedundantTypeConstituentsRule.create).toBe('function')
      expect(typeof noRedundantTypeConstituentsRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType({
        type: 'TSUnionType',
        types: [
          { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
          { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        ],
        loc: makeLoc(1, 0, 1, 5),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ]))
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 1 } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 1 } },
      ]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles null entries in types array', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        null as unknown as { type: string; literal?: { type: string; value: unknown } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('handles non-object entries in types array', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        'not-an-object' as unknown as { type: string; literal?: { type: string; value: unknown } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('does not report when literal property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: null },
        { type: 'TSLiteralType', literal: null },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report when literal property is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: 42 },
        { type: 'TSLiteralType', literal: 42 },
      ]))
      expect(reports.length).toBe(0)
    })

    test('TSLiteralType with null literal is skipped without error', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      expect(() => visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: null },
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'a' } },
      ]))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles TSLiteralType where literal has no value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRedundantTypeConstituentsRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal' } },
        { type: 'TSLiteralType', literal: { type: 'Literal' } },
      ]))
      expect(reports.length).toBe(1)
    })
  })
})

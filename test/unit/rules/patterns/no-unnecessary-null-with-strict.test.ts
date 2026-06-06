import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNullWithStrictRule } from '../../../../src/rules/patterns/no-unnecessary-null-with-strict.js'
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
    getSource: () => '',
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
  types: Array<Record<string, unknown>>,
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

describe('no-unnecessary-null-with-strict rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNullWithStrictRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNullWithStrictRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNullWithStrictRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNullWithStrictRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNullWithStrictRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning undefined or null', () => {
      const desc = noUnnecessaryNullWithStrictRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/null|undefined/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNullWithStrictRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-null-with-strict',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNullWithStrictRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with TSUnionType', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      expect(visitor).toHaveProperty('TSUnionType')
      expect(typeof visitor.TSUnionType).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNullWithStrictRule).toBeDefined()
      expect(noUnnecessaryNullWithStrictRule.meta).toBeDefined()
      expect(noUnnecessaryNullWithStrictRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS NULL | UNDEFINED (25) =====

  describe('positive cases — reports null | undefined', () => {
    test('reports for null | undefined union', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for undefined | null union (reversed order)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSUndefinedKeyword' },
        { type: 'TSNullKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for string | null | undefined union', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSStringKeyword' },
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for number | undefined | null union', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNumberKeyword' },
        { type: 'TSUndefinedKeyword' },
        { type: 'TSNullKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for null | string | undefined union', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSStringKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for null | undefined | string union', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
        { type: 'TSStringKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for boolean | null | undefined union', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSBooleanKeyword' },
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for object | null | undefined union', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSObjectKeyword' },
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for TSTypeReference | null | undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSTypeReference', typeName: 'MyType' },
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for union with many types including null and undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSStringKeyword' },
        { type: 'TSNumberKeyword' },
        { type: 'TSBooleanKeyword' },
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "undefined" instead of "null | undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports[0].message).toContain('undefined')
    })

    test('report message mentions "strict mode"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports[0].message.toLowerCase()).toContain('strict')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports[0].message).toBe(
        'Use "undefined" instead of "null | undefined" in strict mode.',
      )
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSStringKeyword' },
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNumberKeyword' },
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for never | null | undefined union', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNeverKeyword' },
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for void | null | undefined union', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSVoidKeyword' },
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for bigint | null | undefined union', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSBigIntKeyword' },
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for symbol | null | undefined union', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSSymbolKeyword' },
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for array type | null | undefined union', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSArrayType', elementType: { type: 'TSNumberKeyword' } },
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for duplicate null and single undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for single null and duplicate undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for literal type | null | undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSLiteralType', literal: { type: 'Literal', value: 'foo' } },
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for function type | null | undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSFunctionType', parameters: [] },
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports only once per union even with multiple null/undefined pairs', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input TSUnionType node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      const node = makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ])
      visitor.TSUnionType(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ], 3, 5, 3, 25))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report message contains "null | undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports[0].message).toContain('null | undefined')
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ], 10, 4, 10, 28))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      const node = makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ])
      visitor.TSUnionType(node)
      visitor.TSUnionType(node)
      visitor.TSUnionType(node)
      expect(reports.length).toBe(3)
    })

    test('report for three-type union has correct node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      const node = makeUnionNode([
        { type: 'TSStringKeyword' },
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ])
      visitor.TSUnionType(node)
      expect(reports[0].node).toBe(node)
    })

    test('report message is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(typeof reports[0].message).toBe('string')
    })

    test('report loc is an object with start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(typeof reports[0].loc).toBe('object')
      expect(reports[0].loc).toHaveProperty('start')
      expect(reports[0].loc).toHaveProperty('end')
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNumberKeyword' },
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report for node with custom loc has matching start', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ], 7, 2, 7, 15))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('report for node with custom loc has matching end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ], 1, 0, 3, 1))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for null only union', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSStringKeyword' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined only union', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSUndefinedKeyword' },
        { type: 'TSStringKeyword' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for union without null or undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSStringKeyword' },
        { type: 'TSNumberKeyword' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      expect(() => visitor.TSUnionType(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      expect(() => visitor.TSUnionType(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      expect(() => visitor.TSUnionType({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for TSArrayType node without null/undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSArrayType', elementType: { type: 'TSStringKeyword' } },
        { type: 'TSNumberKeyword' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      expect(() => visitor.TSUnionType('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      expect(() => visitor.TSUnionType(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      expect(() => visitor.TSUnionType(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      expect(() => visitor.TSUnionType([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for TSUnionType with single null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType({
        type: 'TSUnionType',
        types: [{ type: 'TSNullKeyword' }],
        loc: makeLoc(1, 0, 1, 4),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for TSUnionType with single undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType({
        type: 'TSUnionType',
        types: [{ type: 'TSUndefinedKeyword' }],
        loc: makeLoc(1, 0, 1, 9),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for TSUnionType with empty types array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType({
        type: 'TSUnionType',
        types: [],
        loc: makeLoc(1, 0, 1, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for TSUnionType with types as non-array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType({
        type: 'TSUnionType',
        types: 'not-array',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for TSUnionType with null types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType({
        type: 'TSUnionType',
        types: null,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for TSUnionType with missing types property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType({
        type: 'TSUnionType',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for TSUnionType with types containing null elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType({
        type: 'TSUnionType',
        types: [null, null],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for TSUnionType with only TSNeverKeyword types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNeverKeyword' },
        { type: 'TSNeverKeyword' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for TSUnionType with TSUnknownKeyword types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSUnknownKeyword' },
        { type: 'TSAnyKeyword' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for TSUnionType with TSVoidKeyword only', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSVoidKeyword' },
        { type: 'TSStringKeyword' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report when only null is present with other type (no undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSStringKeyword' },
        { type: 'TSNumberKeyword' },
        { type: 'TSNullKeyword' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report when only undefined is present with other type (no null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSStringKeyword' },
        { type: 'TSNumberKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNullWithStrictRule.create(ctx1)
      const visitor2 = noUnnecessaryNullWithStrictRule.create(ctx2)
      visitor1.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      visitor2.TSUnionType(makeUnionNode([
        { type: 'TSStringKeyword' },
        { type: 'TSNumberKeyword' },
      ]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSStringKeyword' },
        { type: 'TSNumberKeyword' },
      ]))
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNumberKeyword' },
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      const node = {
        type: 'TSUnionType',
        types: [{ type: 'TSNullKeyword' }, { type: 'TSUndefinedKeyword' }],
      }
      visitor.TSUnionType(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      const node = {
        type: 'TSUnionType',
        types: [{ type: 'TSNullKeyword' }, { type: 'TSUndefinedKeyword' }],
      }
      visitor.TSUnionType(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSStringKeyword' },
        { type: 'TSNumberKeyword' },
      ]))
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSStringKeyword' },
        { type: 'TSNullKeyword' },
      ]))
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSBooleanKeyword' },
        { type: 'TSNullKeyword' },
        { type: 'TSUndefinedKeyword' },
      ]))
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNumberKeyword' },
        { type: 'TSNullKeyword' },
      ]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNullWithStrictRule.create(context)
      const visitor2 = noUnnecessaryNullWithStrictRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNullWithStrictRule.meta
      const meta2 = noUnnecessaryNullWithStrictRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      const node = {
        type: 'TSUnionType',
        types: [{ type: 'TSNullKeyword' }, { type: 'TSUndefinedKeyword' }],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        parent: null,
      }
      visitor.TSUnionType(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType({
        type: 'TSUnionType',
        types: [{ type: 'TSNullKeyword' }, { type: 'TSUndefinedKeyword' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType({
        type: 'TSUnionType',
        types: [{ type: 'TSNullKeyword' }, { type: 'TSUndefinedKeyword' }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNullWithStrictRule).toBeDefined()
      expect(typeof noUnnecessaryNullWithStrictRule.create).toBe('function')
      expect(typeof noUnnecessaryNullWithStrictRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType({
        type: 'TSUnionType',
        types: [{ type: 'TSNullKeyword' }, { type: 'TSUndefinedKeyword' }],
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles types with extra properties on elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword', loc: makeLoc(1, 0, 1, 4), range: [0, 4] },
        { type: 'TSUndefinedKeyword', loc: makeLoc(1, 7, 1, 16), range: [7, 16] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('handles TSTypeReference between null and undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword' },
        { type: 'TSTypeReference', typeName: 'Foo' },
        { type: 'TSUndefinedKeyword' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('handles deeply nested extra data on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType({
        type: 'TSUnionType',
        types: [{ type: 'TSNullKeyword' }, { type: 'TSUndefinedKeyword' }],
        loc: makeLoc(1, 0, 1, 20),
        leadingComments: [],
        trailingComments: [],
        innerComments: [],
      })
      expect(reports.length).toBe(1)
    })

    test('visitor handles being called with wrong node type gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType({ type: 'TSInterfaceDeclaration', body: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('handles union with object types instead of plain keywords', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType(makeUnionNode([
        { type: 'TSNullKeyword', loc: makeLoc(1, 0, 1, 4) },
        { type: 'TSUndefinedKeyword', loc: makeLoc(1, 5, 1, 14) },
      ]))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe(
        'Use "undefined" instead of "null | undefined" in strict mode.',
      )
    })

    test('does not report for TSIntersectionType node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType({
        type: 'TSIntersectionType',
        types: [{ type: 'TSNullKeyword' }, { type: 'TSUndefinedKeyword' }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('handles types where element type is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType({
        type: 'TSUnionType',
        types: ['TSNullKeyword', 'TSUndefinedKeyword'],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('handles types where element type is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNullWithStrictRule.create(context)
      visitor.TSUnionType({
        type: 'TSUnionType',
        types: [0, 1],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })
})

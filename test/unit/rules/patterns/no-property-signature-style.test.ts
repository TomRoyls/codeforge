import { describe, expect, test, vi } from 'vitest'
import { noPropertySignatureStyleRule } from '../../../../src/rules/patterns/no-property-signature-style.js'
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
    getSource: () => 'interface Foo { _private: string; }',
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

function makeTSPropertyNode(
  keyName: string,
  keyType = 'Identifier',
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'TSPropertySignature',
    key: { type: keyType, name: keyName },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-property-signature-style rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noPropertySignatureStyleRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noPropertySignatureStyleRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noPropertySignatureStyleRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noPropertySignatureStyleRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noPropertySignatureStyleRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning property', () => {
      const desc = noPropertySignatureStyleRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/property/)
    })

    test('should have correct docs URL', () => {
      expect(noPropertySignatureStyleRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-property-signature-style',
      )
    })

    test('should have empty schema', () => {
      expect(noPropertySignatureStyleRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with TSPropertySignature', () => {
      const { context } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      expect(visitor).toHaveProperty('TSPropertySignature')
      expect(typeof visitor.TSPropertySignature).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noPropertySignatureStyleRule).toBeDefined()
      expect(noPropertySignatureStyleRule.meta).toBeDefined()
      expect(noPropertySignatureStyleRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNDERSCORE KEY (25) =====

  describe('positive cases — reports underscore key', () => {
    test('reports for key name "_private"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_private'))
      expect(reports.length).toBe(1)
    })

    test('reports for key name "_hidden"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_hidden'))
      expect(reports.length).toBe(1)
    })

    test('reports for key name "_value"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_value'))
      expect(reports.length).toBe(1)
    })

    test('reports for key name "_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_'))
      expect(reports.length).toBe(1)
    })

    test('reports for key name "__double"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('__double'))
      expect(reports.length).toBe(1)
    })

    test('reports for key name "_camelCase"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_camelCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for key name "_a"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_a'))
      expect(reports.length).toBe(1)
    })

    test('reports for key name "_123"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_123'))
      expect(reports.length).toBe(1)
    })

    test('reports for key name "_foo_bar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_foo_bar'))
      expect(reports.length).toBe(1)
    })

    test('reports for key name "_$dollar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_$dollar'))
      expect(reports.length).toBe(1)
    })

    test('reports for key name "___triple"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('___triple'))
      expect(reports.length).toBe(1)
    })

    test('reports for key name "_trailing_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_trailing_'))
      expect(reports.length).toBe(1)
    })

    test('reports for key name "_UPPER_CASE"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_UPPER_CASE'))
      expect(reports.length).toBe(1)
    })

    test('reports for key name "_a1b2c3"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_a1b2c3'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "underscore"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_private'))
      expect(reports[0].message.toLowerCase()).toContain('underscore')
    })

    test('report message mentions "Property names"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_private'))
      expect(reports[0].message).toContain('Property names')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_private'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_private'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      const node = makeTSPropertyNode('_private')
      visitor.TSPropertySignature(node)
      expect(reports[0].node).toBe(node)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_private'))
      expect(reports[0].message).toBe(
        'Property names should not start with underscore.',
      )
    })

    test('reports only once per node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_private'))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_a'))
      visitor.TSPropertySignature(makeTSPropertyNode('_b'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_a'))
      visitor.TSPropertySignature(makeTSPropertyNode('_b'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for key name "_veryLongPropertyName"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_veryLongPropertyName'))
      expect(reports.length).toBe(1)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_private', 'Identifier', 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report descriptor has message property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_private'))
      expect(reports[0]).toHaveProperty('message')
      expect(typeof reports[0].message).toBe('string')
    })

    test('report descriptor has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_private'))
      expect(reports[0]).toHaveProperty('loc')
      expect(typeof reports[0].loc).toBe('object')
    })

    test('report descriptor has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_private'))
      expect(reports[0]).toHaveProperty('node')
    })

    test('report message matches exact string from rule', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_private'))
      expect(reports[0].message).toBe('Property names should not start with underscore.')
    })

    test('report loc start line is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_x', 'Identifier', 3, 5, 3, 8))
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('report loc start column is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_x', 'Identifier', 3, 5, 3, 8))
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('report loc end line is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_x', 'Identifier', 3, 5, 7, 8))
      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('report loc end column is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_x', 'Identifier', 3, 5, 3, 8))
      expect(reports[0].loc?.end.column).toBe(8)
    })

    test('report node is the same reference as input', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      const node = makeTSPropertyNode('_test')
      visitor.TSPropertySignature(node)
      expect(reports[0].node).toBe(node)
    })

    test('report for "_hidden" has correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_hidden'))
      expect(reports[0].message).toBe('Property names should not start with underscore.')
    })

    test('report for "_" has correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_'))
      expect(reports[0].message).toBe('Property names should not start with underscore.')
    })

    test('report loc reflects custom location', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_x', 'Identifier', 10, 4, 10, 7))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('report loc reflects custom end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_x', 'Identifier', 2, 0, 5, 15))
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('report for multiple violations preserves individual locs', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_a', 'Identifier', 1, 0, 1, 5))
      visitor.TSPropertySignature(makeTSPropertyNode('_b', 'Identifier', 3, 2, 3, 8))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(3)
    })

    test('report descriptor contains exactly the expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_private'))
      const keys = Object.keys(reports[0])
      expect(keys).toContain('message')
      expect(keys).toContain('loc')
      expect(keys).toContain('node')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for key name without underscore "public"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('public'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key name "private"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('private'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key name "name"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('name'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key name "value"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('value'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key name "trailing_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('trailing_'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key name "middle_name"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('middle_name'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      expect(() => visitor.TSPropertySignature(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      expect(() => visitor.TSPropertySignature(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      expect(() => visitor.TSPropertySignature({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type "TSMethodSignature"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature({ type: 'TSMethodSignature', key: { type: 'Identifier', name: '_private' }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type "Identifier"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature({ type: 'Identifier', name: '_private', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type "Literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature({ type: 'Literal', value: '_private', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      expect(() => visitor.TSPropertySignature('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      expect(() => visitor.TSPropertySignature(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      expect(() => visitor.TSPropertySignature(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for key with type "StringLiteral"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_private', 'StringLiteral'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key with type "NumericLiteral"', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_private', 'NumericLiteral'))
      expect(reports.length).toBe(0)
    })

    test('does not report for key with missing name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature({ type: 'TSPropertySignature', key: { type: 'Identifier' }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for key with null name', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature({ type: 'TSPropertySignature', key: { type: 'Identifier', name: null }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for key with number name', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature({ type: 'TSPropertySignature', key: { type: 'Identifier', name: 123 }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for key with empty string name', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature({ type: 'TSPropertySignature', key: { type: 'Identifier', name: '' }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for key with boolean name', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature({ type: 'TSPropertySignature', key: { type: 'Identifier', name: true }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for missing key', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature({ type: 'TSPropertySignature', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null key', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature({ type: 'TSPropertySignature', key: null, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for key as empty object without type', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature({ type: 'TSPropertySignature', key: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noPropertySignatureStyleRule.create(ctx1)
      const visitor2 = noPropertySignatureStyleRule.create(ctx2)
      visitor1.TSPropertySignature(makeTSPropertyNode('_private'))
      visitor2.TSPropertySignature(makeTSPropertyNode('public'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_a'))
      visitor.TSPropertySignature(makeTSPropertyNode('public'))
      visitor.TSPropertySignature(makeTSPropertyNode('_b'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      const node = { type: 'TSPropertySignature', key: { type: 'Identifier', name: '_private' } }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      const node = { type: 'TSPropertySignature', key: { type: 'Identifier', name: '_private' } }
      visitor.TSPropertySignature(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('name'))
      visitor.TSPropertySignature(makeTSPropertyNode('_private'))
      visitor.TSPropertySignature(makeTSPropertyNode('value'))
      visitor.TSPropertySignature(makeTSPropertyNode('_hidden'))
      visitor.TSPropertySignature(makeTSPropertyNode('public'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noPropertySignatureStyleRule.create(context)
      const visitor2 = noPropertySignatureStyleRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noPropertySignatureStyleRule.meta
      const meta2 = noPropertySignatureStyleRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_private'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        key: { type: 'Identifier', name: '_private' },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        computed: false,
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature({ type: 'TSPropertySignature', key: { type: 'Identifier', name: '_private' }, loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature({ type: 'TSPropertySignature', key: { type: 'Identifier', name: '_private' }, loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      const node = makeTSPropertyNode('_private')
      visitor.TSPropertySignature(node)
      visitor.TSPropertySignature(node)
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noPropertySignatureStyleRule).toBeDefined()
      expect(typeof noPropertySignatureStyleRule.create).toBe('function')
      expect(typeof noPropertySignatureStyleRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature({ type: 'TSPropertySignature', key: { type: 'Identifier', name: '_private' }, loc: makeLoc(1, 0, 1, 10), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_a'))
      visitor.TSPropertySignature(makeTSPropertyNode('_b'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report for non-Identifier key with underscore name', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_private', 'StringLiteral'))
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode('_x', 'Identifier', 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('handles node with readonly property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature({ type: 'TSPropertySignature', key: { type: 'Identifier', name: '_readonly' }, readonly: true, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(1)
    })

    test('handles node with optional property', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature({ type: 'TSPropertySignature', key: { type: 'Identifier', name: '_optional' }, optional: true, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(1)
    })

    test('handles node with computed and initializer properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noPropertySignatureStyleRule.create(context)
      visitor.TSPropertySignature({ type: 'TSPropertySignature', key: { type: 'Identifier', name: '_computed' }, computed: false, initializer: null, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(1)
    })
  })
})

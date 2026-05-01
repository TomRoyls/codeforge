import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNumericLiteralRule } from '../../../../src/rules/patterns/no-unnecessary-numeric-literal.js'
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

function makeTSPropertyNode(
  keyValue: number,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'TSPropertySignature',
    key: { type: 'Literal', value: keyValue },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-numeric-literal rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNumericLiteralRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNumericLiteralRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNumericLiteralRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNumericLiteralRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNumericLiteralRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning numeric or computed', () => {
      const desc = noUnnecessaryNumericLiteralRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/numeric|computed/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNumericLiteralRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-numeric-literal',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNumericLiteralRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with TSPropertySignature', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      expect(visitor).toHaveProperty('TSPropertySignature')
      expect(typeof visitor.TSPropertySignature).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNumericLiteralRule).toBeDefined()
      expect(noUnnecessaryNumericLiteralRule.meta).toBeDefined()
      expect(noUnnecessaryNumericLiteralRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS NUMERIC LITERAL KEY (25) =====

  describe('positive cases — reports numeric literal key', () => {
    test('reports for numeric key 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(0))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(1))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key 42', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(42))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key -1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(-1))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key 3.14', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(3.14))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key NaN', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(NaN))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key Infinity', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(Infinity))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key -Infinity', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(-Infinity))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key 100', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(100))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key 0.5', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(0.5))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key 999', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(999))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key -99', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(-99))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key 1e3', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(1e3))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key 1.5e-4', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(1.5e-4))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key 123456789', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(123456789))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key -0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(-0))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key 2.718', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(2.718))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key 0.001', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(0.001))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key 255', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(255))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key -3.14', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(-3.14))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key 1e10', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(1e10))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key 7', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(7))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key 2', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(2))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key -1000', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(-1000))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric key 0.0001', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(0.0001))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message contains "Prefer"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(0))
      expect(reports[0].message).toContain('Prefer')
    })

    test('report message contains "computed syntax"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(0))
      expect(reports[0].message).toContain('computed syntax')
    })

    test('report message contains the numeric value 42', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(42))
      expect(reports[0].message).toContain('42')
    })

    test('report message contains the numeric value 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(0))
      expect(reports[0].message).toContain('0')
    })

    test('report message contains "literal key"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(1))
      expect(reports[0].message).toContain('literal key')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(0))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(0))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input TSPropertySignature node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      const node = makeTSPropertyNode(42)
      visitor.TSPropertySignature(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(5, 3, 8, 3, 28))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('report message is exactly as defined in rule source for value 42', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(42))
      expect(reports[0].message).toBe(
        'Prefer a numeric property name computed syntax [42] over literal key.',
      )
    })

    test('report message is exactly as defined for value 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(0))
      expect(reports[0].message).toBe(
        'Prefer a numeric property name computed syntax [0] over literal key.',
      )
    })

    test('report message is exactly as defined for value -1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(-1))
      expect(reports[0].message).toBe(
        'Prefer a numeric property name computed syntax [-1] over literal key.',
      )
    })

    test('report message includes numeric value in brackets', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(99))
      expect(reports[0].message).toContain('[99]')
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(5, 3, 8, 3, 28))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(1))
      visitor.TSPropertySignature(makeTSPropertyNode(2))
      visitor.TSPropertySignature(makeTSPropertyNode(3))
      expect(reports.length).toBe(3)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for string key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: 'name' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Identifier', name: 'prop' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      expect(() => visitor.TSPropertySignature(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      expect(() => visitor.TSPropertySignature(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      expect(() => visitor.TSPropertySignature({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for node with wrong type Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for node with wrong type Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      expect(() => visitor.TSPropertySignature('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      expect(() => visitor.TSPropertySignature(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      expect(() => visitor.TSPropertySignature(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      expect(() => visitor.TSPropertySignature([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for key with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: null },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for key with boolean value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: true },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for key with string value "123"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: '123' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for key that is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: null,
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for key that is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: 'propName',
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for key that is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: 42,
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for missing key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for TSMethodSignature node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({ type: 'TSMethodSignature', key: { type: 'Literal', value: 1 }, params: [], loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for key with undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: undefined },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for key with RegExp value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: /test/ },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for key with object value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: { nested: true } },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNumericLiteralRule.create(ctx1)
      const visitor2 = noUnnecessaryNumericLiteralRule.create(ctx2)
      visitor1.TSPropertySignature(makeTSPropertyNode(1))
      visitor2.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: 'name' },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed inputs', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(1))
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: 'skip' },
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.TSPropertySignature(makeTSPropertyNode(2))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      const node = { type: 'TSPropertySignature', key: { type: 'Literal', value: 5 } }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: 'name' },
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.TSPropertySignature(makeTSPropertyNode(1))
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Identifier', name: 'prop' },
        loc: makeLoc(1, 0, 1, 20),
      })
      visitor.TSPropertySignature(makeTSPropertyNode(2))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNumericLiteralRule.create(context)
      const visitor2 = noUnnecessaryNumericLiteralRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNumericLiteralRule.meta
      const meta2 = noUnnecessaryNumericLiteralRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(1))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      const node = {
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: 10 },
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        computed: false,
      }
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: 3 },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc missing end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: 7 },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      const node = makeTSPropertyNode(42)
      visitor.TSPropertySignature(node)
      visitor.TSPropertySignature(node)
      visitor.TSPropertySignature(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNumericLiteralRule).toBeDefined()
      expect(typeof noUnnecessaryNumericLiteralRule.create).toBe('function')
      expect(typeof noUnnecessaryNumericLiteralRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: 8 },
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('all reports have the same message format for different values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(1))
      visitor.TSPropertySignature(makeTSPropertyNode(99))
      expect(reports[0].message).toContain('Prefer a numeric property name computed syntax')
      expect(reports[1].message).toContain('Prefer a numeric property name computed syntax')
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(10))
      visitor.TSPropertySignature(makeTSPropertyNode(20))
      expect(reports[0].message).toContain('[10]')
      expect(reports[1].message).toContain('[20]')
    })

    test('node without loc reports with location from extractLocation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      const node = { type: 'TSPropertySignature', key: { type: 'Literal', value: 5 } }
      visitor.TSPropertySignature(node)
      expect(reports[0].loc).toBeDefined()
    })

    test('handles TSPropertySignature with typeAnnotation property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: 4 },
        typeAnnotation: { type: 'TSTypeAnnotation', typeAnnotation: { type: 'TSStringKeyword' } },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('handles TSPropertySignature with optional true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: 6 },
        optional: true,
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('handles TSPropertySignature with readonly true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature({
        type: 'TSPropertySignature',
        key: { type: 'Literal', value: 9 },
        readonly: true,
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNumericLiteralRule.create(context)
      visitor.TSPropertySignature(makeTSPropertyNode(11, 10, 4, 10, 30))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(30)
    })
  })
})

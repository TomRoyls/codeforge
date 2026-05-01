import { describe, expect, test, vi } from 'vitest'
import { noUnsafeEnumComparisonRule } from '../../../../src/rules/patterns/no-unsafe-enum-comparison.js'
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
    getSource: () => 'const x = MyEnum === 1;',
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

function makeBinaryNode(
  operator: string,
  left: Record<string, unknown>,
  right: Record<string, unknown>,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 15,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unsafe-enum-comparison rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnsafeEnumComparisonRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnsafeEnumComparisonRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnsafeEnumComparisonRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnsafeEnumComparisonRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnsafeEnumComparisonRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning enum', () => {
      const desc = noUnsafeEnumComparisonRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/enum/)
    })

    test('should have correct docs URL', () => {
      expect(noUnsafeEnumComparisonRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unsafe-enum-comparison',
      )
    })

    test('should have empty schema', () => {
      expect(noUnsafeEnumComparisonRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnsafeEnumComparisonRule).toBeDefined()
      expect(noUnsafeEnumComparisonRule.meta).toBeDefined()
      expect(noUnsafeEnumComparisonRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNSAFE ENUM COMPARISON (25) =====

  describe('positive cases — reports unsafe enum comparison', () => {
    test('reports for Identifier === number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Identifier !== number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Identifier == number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('==', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Identifier != number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!=', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports.length).toBe(1)
    })

    test('reports for number === Identifier (reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Literal', value: 1 }, { type: 'Identifier', name: 'MyEnum' }))
      expect(reports.length).toBe(1)
    })

    test('reports for number !== Identifier (reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', { type: 'Literal', value: 1 }, { type: 'Identifier', name: 'MyEnum' }))
      expect(reports.length).toBe(1)
    })

    test('reports for number == Identifier (reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('==', { type: 'Literal', value: 1 }, { type: 'Identifier', name: 'MyEnum' }))
      expect(reports.length).toBe(1)
    })

    test('reports for number != Identifier (reversed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!=', { type: 'Literal', value: 1 }, { type: 'Identifier', name: 'MyEnum' }))
      expect(reports.length).toBe(1)
    })

    test('reports for enum comparison with 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'Status' }, { type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for enum comparison with negative number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'Status' }, { type: 'Literal', value: -1 }))
      expect(reports.length).toBe(1)
    })

    test('reports for enum comparison with large number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'Status' }, { type: 'Literal', value: 999999 }))
      expect(reports.length).toBe(1)
    })

    test('reports for enum comparison with float', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'Status' }, { type: 'Literal', value: 3.14 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Status === 1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'Status' }, { type: 'Literal', value: 1 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Color !== 2', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!==', { type: 'Identifier', name: 'Color' }, { type: 'Literal', value: 2 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Direction == 3', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('==', { type: 'Identifier', name: 'Direction' }, { type: 'Literal', value: 3 }))
      expect(reports.length).toBe(1)
    })

    test('reports for Mode != 4', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('!=', { type: 'Identifier', name: 'Mode' }, { type: 'Literal', value: 4 }))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'A' }, { type: 'Literal', value: 1 }))
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'B' }, { type: 'Literal', value: 2 }))
      expect(reports.length).toBe(2)
    })

    test('reports for identifier compared to different numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 2 }))
      expect(reports.length).toBe(2)
    })

    test('reports for different identifiers compared to numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'EnumA' }, { type: 'Literal', value: 1 }))
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'EnumB' }, { type: 'Literal', value: 2 }))
      expect(reports.length).toBe(2)
    })

    test('reports for 0 === MyEnum (reversed with zero)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Literal', value: 0 }, { type: 'Identifier', name: 'MyEnum' }))
      expect(reports.length).toBe(1)
    })

    test('reports for -1 === MyEnum (reversed with negative)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Literal', value: -1 }, { type: 'Identifier', name: 'MyEnum' }))
      expect(reports.length).toBe(1)
    })

    test('reports for 3.14 === MyEnum (reversed with float)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Literal', value: 3.14 }, { type: 'Identifier', name: 'MyEnum' }))
      expect(reports.length).toBe(1)
    })

    test('reports for identifier name with underscores', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MY_ENUM_VALUE' }, { type: 'Literal', value: 1 }))
      expect(reports.length).toBe(1)
    })

    test('reports for single-letter identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'x' }, { type: 'Literal', value: 1 }))
      expect(reports.length).toBe(1)
    })

    test('reports for camelCase identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'myEnumValue' }, { type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message contains "Unsafe enum comparison"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports[0].message).toContain('Unsafe enum comparison')
    })

    test('report message mentions "avoid comparing enum values"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports[0].message).toContain('avoid comparing enum values')
    })

    test('report message mentions "numbers"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports[0].message.toLowerCase()).toContain('numbers')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input BinaryExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      const node = makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 })
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }, 5, 10, 5, 25))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports[0].message).toBe(
        'Unsafe enum comparison: avoid comparing enum values directly with numbers.',
      )
    })

    test('report descriptor has message property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports[0]).toHaveProperty('message')
    })

    test('report descriptor has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports[0]).toHaveProperty('loc')
    })

    test('report descriptor has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports[0]).toHaveProperty('node')
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'A' }, { type: 'Literal', value: 1 }))
      visitor.BinaryExpression(makeBinaryNode('!==', { type: 'Identifier', name: 'B' }, { type: 'Literal', value: 2 }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc has start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('report loc start has correct structure', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('report loc end has correct structure', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports[0].loc?.end).toHaveProperty('line')
      expect(reports[0].loc?.end).toHaveProperty('column')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for "+" operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('+', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for "<" operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('<', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ">" operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('>', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for "<=" operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('<=', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ">=" operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('>=', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier === string Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier === boolean Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: true }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier === null Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: null }))
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier === Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'EnumA' }, { type: 'Identifier', name: 'EnumB' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for number === number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-BinaryExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier with Literal value as string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Literal', value: '1' }, { type: 'Identifier', name: 'MyEnum' }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnsafeEnumComparisonRule.create(ctx1)
      const visitor2 = noUnsafeEnumComparisonRule.create(ctx2)
      visitor1.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      visitor2.BinaryExpression(makeBinaryNode('+', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'A' }, { type: 'Literal', value: 1 }))
      visitor.BinaryExpression(makeBinaryNode('+', { type: 'Identifier', name: 'B' }, { type: 'Literal', value: 2 }))
      visitor.BinaryExpression(makeBinaryNode('!==', { type: 'Identifier', name: 'C' }, { type: 'Literal', value: 3 }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      const node = { type: 'BinaryExpression', operator: '===', left: { type: 'Identifier', name: 'MyEnum' }, right: { type: 'Literal', value: 1 } }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node with extra properties still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'MyEnum' },
        right: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 15),
        range: [0, 15],
        extra: true,
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node with empty loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '===', left: { type: 'Identifier', name: 'MyEnum' }, right: { type: 'Literal', value: 1 }, loc: {} })
      expect(reports.length).toBe(1)
    })

    test('node with partial loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '===', left: { type: 'Identifier', name: 'MyEnum' }, right: { type: 'Literal', value: 1 }, loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      const node = makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 })
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnsafeEnumComparisonRule).toBeDefined()
      expect(typeof noUnsafeEnumComparisonRule.create).toBe('function')
      expect(typeof noUnsafeEnumComparisonRule.meta).toBe('object')
    })

    test('node with _parent property still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '===', left: { type: 'Identifier', name: 'MyEnum' }, right: { type: 'Literal', value: 1 }, loc: makeLoc(1, 0, 1, 15), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnsafeEnumComparisonRule.create(context)
      const visitor2 = noUnsafeEnumComparisonRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnsafeEnumComparisonRule.meta
      const meta2 = noUnsafeEnumComparisonRule.meta
      expect(meta1).toBe(meta2)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'A' }, { type: 'Literal', value: 1 }))
      visitor.BinaryExpression(makeBinaryNode('+', { type: 'Identifier', name: 'B' }, { type: 'Literal', value: 2 }))
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'C' }, { type: 'Literal', value: 'x' }))
      visitor.BinaryExpression(makeBinaryNode('!==', { type: 'Literal', value: 0 }, { type: 'Identifier', name: 'D' }))
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }))
      expect(reports.length).toBe(2)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'A' }, { type: 'Literal', value: 1 }))
      visitor.BinaryExpression(makeBinaryNode('!==', { type: 'Literal', value: 2 }, { type: 'Identifier', name: 'B' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles node with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '===', left: { type: 'Identifier', name: 'MyEnum' }, right: { type: 'Literal', value: 1 }, loc: makeLoc(1, 0, 1, 15), range: [0, 15] })
      expect(reports.length).toBe(1)
    })

    test('handles node without operator property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', left: { type: 'Identifier', name: 'MyEnum' }, right: { type: 'Literal', value: 1 }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('handles node with missing left property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '===', right: { type: 'Literal', value: 1 }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('handles node with missing right property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression({ type: 'BinaryExpression', operator: '===', left: { type: 'Identifier', name: 'MyEnum' }, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for regex literal value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: /test/ }))
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Identifier', name: 'MyEnum' }, { type: 'Literal', value: 1 }, 10, 4, 10, 20))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('handles node with both sides as mixed non-matching types', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnsafeEnumComparisonRule.create(context)
      visitor.BinaryExpression(makeBinaryNode('===', { type: 'Literal', value: 'hello' }, { type: 'Literal', value: 42 }))
      expect(reports.length).toBe(0)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryBignumberRule } from '../../../../src/rules/patterns/no-unnecessary-bignumber.js'
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
    getSource: () => 'BigInt(42)',
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

function makeBigIntCall(
  value: number,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'BigInt' },
    arguments: [{ type: 'Literal', value }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-bignumber rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryBignumberRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryBignumberRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryBignumberRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryBignumberRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryBignumberRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning BigInt', () => {
      const desc = noUnnecessaryBignumberRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/bigint/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryBignumberRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-bignumber',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryBignumberRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryBignumberRule).toBeDefined()
      expect(noUnnecessaryBignumberRule.meta).toBeDefined()
      expect(noUnnecessaryBignumberRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY BIGINT (25) =====

  describe('positive cases — reports unnecessary BigInt', () => {
    test('reports for BigInt(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(42))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(0))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(100)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(100))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(3.14)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(3.14))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(1))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(-1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(-1))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(999)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(999))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(0.5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(0.5))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(123456789)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(123456789))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(-99.99)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(-99.99))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(1e6)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(1e6))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(0.001)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(0.001))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(255)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(255))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(-0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(-0))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(7)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(7))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(2.718)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(2.718))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(1000)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(1000))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(-50)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(-50))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(0.1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(0.1))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(500)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(500))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(1.5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(1.5))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(42) with custom location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(42, 5, 10, 5, 20))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(10)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(10))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(33)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(33))
      expect(reports.length).toBe(1)
    })

    test('reports for BigInt(2)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(2))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message contains "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(42))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message contains "BigInt"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(42))
      expect(reports[0].message).toContain('BigInt')
    })

    test('report message contains "numeric literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(42))
      expect(reports[0].message).toContain('numeric literal')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(42))
      expect(reports[0].message).toBe(
        'Unnecessary BigInt() call on a numeric literal.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(42))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(42))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      const node = makeBigIntCall(42)
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc start line is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(42, 3, 5, 3, 15))
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('report loc start column is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(42, 3, 5, 3, 15))
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('report loc end line is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(42, 3, 5, 7, 15))
      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('report loc end column is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(42, 3, 5, 7, 15))
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(42))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(42))
      visitor.CallExpression(makeBigIntCall(100))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(42))
      visitor.CallExpression(makeBigIntCall(0))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report for different numbers produces same message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(42))
      visitor.CallExpression(makeBigIntCall(3.14))
      expect(reports[0].message).toBe('Unnecessary BigInt() call on a numeric literal.')
      expect(reports[1].message).toBe('Unnecessary BigInt() call on a numeric literal.')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for BigInt("42") (string literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Literal', value: '42' }],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-BigInt callee (parseInt)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 8),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Literal', value: 42 }, { type: 'Literal', value: 10 }],
        loc: makeLoc(1, 0, 1, 16),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'Number' }, property: { type: 'Identifier', name: 'parseInt' } },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-CallExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'Identifier',
        name: 'BigInt',
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'Literal',
        value: 42,
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for null literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Literal', value: null }],
        loc: makeLoc(1, 0, 1, 13),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Identifier', name: 'undefined' }],
        loc: makeLoc(1, 0, 1, 18),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: {},
        right: {},
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for NewExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for callee that is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arguments that is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: { type: 'Literal', value: 42 },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for regex literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Literal', value: /abc/ }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryBignumberRule.create(ctx1)
      const visitor2 = noUnnecessaryBignumberRule.create(ctx2)
      visitor1.CallExpression(makeBigIntCall(42))
      visitor2.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Literal', value: '42' }],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(42))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 14),
      })
      visitor.CallExpression(makeBigIntCall(0))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Literal', value: 42 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Literal', value: 42 }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(42))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Literal', value: '42' }],
        loc: makeLoc(1, 0, 1, 12),
      })
      visitor.CallExpression(makeBigIntCall(0))
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Number' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 11),
      })
      visitor.CallExpression(makeBigIntCall(99))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryBignumberRule.create(context)
      const visitor2 = noUnnecessaryBignumberRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryBignumberRule.meta
      const meta2 = noUnnecessaryBignumberRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      const node = makeBigIntCall(42)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryBignumberRule).toBeDefined()
      expect(typeof noUnnecessaryBignumberRule.create).toBe('function')
      expect(typeof noUnnecessaryBignumberRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(42))
      visitor.CallExpression(makeBigIntCall(0))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression(makeBigIntCall(42, 10, 4, 10, 14))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(14)
    })

    test('handles NaN as numeric literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Literal', value: NaN }],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(1)
    })

    test('handles Infinity as numeric literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'Literal', value: Infinity }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when argument type is not Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'TemplateLiteral', quasis: [], expressions: [] }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name differs in case', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'bigint' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for TemplateLiteral argument with number value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBignumberRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'BigInt' },
        arguments: [{ type: 'TemplateLiteral', value: 42, quasis: [], expressions: [] }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })
  })
})

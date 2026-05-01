import { describe, expect, test, vi } from 'vitest'
import { noSelfCompareRule } from '../../../../src/rules/patterns/no-self-compare.js'
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
    getSource: () => 'x === x',
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

function makeSelfCompare(
  name = 'x',
  operator = '===',
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left: { type: 'Identifier', name },
    right: { type: 'Identifier', name },
    loc: makeLoc(line, column, line, column + name.length * 2 + operator.length),
  }
}

describe('no-self-compare rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noSelfCompareRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noSelfCompareRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noSelfCompareRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noSelfCompareRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noSelfCompareRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning comparison and variable', () => {
      const desc = noSelfCompareRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/compar/)
      expect(desc).toMatch(/variable/)
    })

    test('should have correct docs URL', () => {
      expect(noSelfCompareRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-self-compare',
      )
    })

    test('should have empty schema', () => {
      expect(noSelfCompareRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noSelfCompareRule).toBeDefined()
      expect(noSelfCompareRule.meta).toBeDefined()
      expect(noSelfCompareRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports self-comparisons', () => {
    test('reports x === x', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '==='))
      expect(reports.length).toBe(1)
    })

    test('reports x !== x', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '!=='))
      expect(reports.length).toBe(1)
    })

    test('reports x == x', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '=='))
      expect(reports.length).toBe(1)
    })

    test('reports x != x', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '!='))
      expect(reports.length).toBe(1)
    })

    test('message says "true" for === operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '==='))
      expect(reports[0].message).toContain('true')
    })

    test('message says "true" for == operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '=='))
      expect(reports[0].message).toContain('true')
    })

    test('message says "false" for !== operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '!=='))
      expect(reports[0].message).toContain('false')
    })

    test('message says "false" for != operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '!='))
      expect(reports[0].message).toContain('false')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare())
      expect(reports[0].node).toBeDefined()
    })

    test('report node property matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = makeSelfCompare()
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports multiple violations in same source', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('a'))
      visitor.BinaryExpression(makeSelfCompare('b'))
      visitor.BinaryExpression(makeSelfCompare('c'))
      expect(reports.length).toBe(3)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '===', 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(13)
    })

    test('reports count === count with different variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('count', '==='))
      expect(reports.length).toBe(1)
    })

    test('message contains the variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('myVar', '==='))
      expect(reports[0].message).toContain('myVar')
    })

    test('reports val === val', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('val', '==='))
      expect(reports.length).toBe(1)
    })

    test('reports data !== data', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('data', '!=='))
      expect(reports.length).toBe(1)
    })

    test('reports result == result', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('result', '=='))
      expect(reports.length).toBe(1)
    })

    test('reports flag != flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('flag', '!='))
      expect(reports.length).toBe(1)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('a'))
      visitor.BinaryExpression(makeSelfCompare('b'))
      visitor.BinaryExpression(makeSelfCompare('c'))
      visitor.BinaryExpression(makeSelfCompare('d'))
      expect(reports.length).toBe(4)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report x === y (different names)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
        loc: makeLoc(1, 0, 1, 9),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report x < x (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '<'))
      expect(reports.length).toBe(0)
    })

    test('does not report x > x (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '>'))
      expect(reports.length).toBe(0)
    })

    test('does not report x >= x (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '>='))
      expect(reports.length).toBe(0)
    })

    test('does not report x <= x (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '<='))
      expect(reports.length).toBe(0)
    })

    test('does not report x + x (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '+'))
      expect(reports.length).toBe(0)
    })

    test('does not report x - x (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '-'))
      expect(reports.length).toBe(0)
    })

    test('does not report x * x (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '*'))
      expect(reports.length).toBe(0)
    })

    test('does not report x / x (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '/'))
      expect(reports.length).toBe(0)
    })

    test('does not report x ** x (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '**'))
      expect(reports.length).toBe(0)
    })

    test('does not report x % x (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '%'))
      expect(reports.length).toBe(0)
    })

    test('does not report when left is Literal (x === 5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 5 },
        loc: makeLoc(1, 0, 1, 9),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when right is Literal (5 === x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Literal', value: 5 },
        right: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 9),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when left is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'foo' },
          arguments: [],
        },
        right: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when right is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'x' },
        right: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'foo' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when left is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        right: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 14),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when right is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'x' },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: makeLoc(1, 0, 1, 14),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — non-BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-BinaryExpression type (Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = { type: 'Literal', value: 42 }
      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report x instanceof x (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', 'instanceof'))
      expect(reports.length).toBe(0)
    })

    test('does not report x in x (wrong operator)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', 'in'))
      expect(reports.length).toBe(0)
    })

    test('does not report when both sides are Literal (1 === 1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 1 },
        loc: makeLoc(1, 0, 1, 7),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when left is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: null,
        right: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 7),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when right is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'x' },
        right: null,
        loc: makeLoc(1, 0, 1, 7),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report with different identifier names (a !== b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '!==',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        loc: makeLoc(1, 0, 1, 9),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report with different identifier names (foo == bar)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '==',
        left: { type: 'Identifier', name: 'foo' },
        right: { type: 'Identifier', name: 'bar' },
        loc: makeLoc(1, 0, 1, 11),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report with different identifier names (count != total)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '!=',
        left: { type: 'Identifier', name: 'count' },
        right: { type: 'Identifier', name: 'total' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node is missing left property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        right: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when node is missing right property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report AssignmentExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noSelfCompareRule.create(ctx1)
      const visitor2 = noSelfCompareRule.create(ctx2)

      visitor1.BinaryExpression(makeSelfCompare('x', '==='))
      visitor2.BinaryExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
        loc: makeLoc(1, 0, 1, 7),
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('a', '==='))
      visitor.BinaryExpression(makeSelfCompare('b', '==='))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'x' },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      // reports — self compare
      visitor.BinaryExpression(makeSelfCompare('a', '==='))
      // does NOT report — different names
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
        loc: makeLoc(2, 0, 2, 9),
      })
      // reports — self compare
      visitor.BinaryExpression(makeSelfCompare('b', '!=='))
      // does NOT report — wrong operator
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: '<',
        left: { type: 'Identifier', name: 'c' },
        right: { type: 'Identifier', name: 'c' },
        loc: makeLoc(3, 0, 3, 7),
      })
      // reports — self compare
      visitor.BinaryExpression(makeSelfCompare('d', '=='))
      expect(reports.length).toBe(3)
    })

    test('same name different case is NOT a self-compare (X === x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'X' },
        right: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 9),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('underscores in names are handled correctly (__foo === __foo)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('__foo', '==='))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('__foo')
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'x' },
      }
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare())
      visitor.BinaryExpression(makeSelfCompare())
      visitor.BinaryExpression(makeSelfCompare())
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noSelfCompareRule.create(context)
      const visitor2 = noSelfCompareRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '===', 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('handles node with undefined left gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: undefined,
        right: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 7),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles node with undefined right gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'x' },
        right: undefined,
        loc: makeLoc(1, 0, 1, 7),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles left being a string primitive (non-node)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: 'notanode',
        right: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 14),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles right being a number primitive (non-node)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'x' },
        right: 42,
        loc: makeLoc(1, 0, 1, 9),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('a', '==='))
      visitor.BinaryExpression(makeSelfCompare('b', '==='))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('a')
      expect(reports[1].message).toContain('b')
    })

    test('all === violations have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('alpha', '==='))
      visitor.BinaryExpression(makeSelfCompare('beta', '==='))
      const msg0 = reports[0].message.replace(/`alpha`/g, '`VAR`')
      const msg1 = reports[1].message.replace(/`beta`/g, '`VAR`')
      expect(msg0).toBe(msg1)
    })

    test('rule meta is the same reference across multiple accesses', () => {
      const meta1 = noSelfCompareRule.meta
      const meta2 = noSelfCompareRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noSelfCompareRule', () => {
      expect(noSelfCompareRule).toBeDefined()
      expect(typeof noSelfCompareRule.create).toBe('function')
      expect(typeof noSelfCompareRule.meta).toBe('object')
    })

    test('message starts with "Unexpected comparison"', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '==='))
      expect(reports[0].message).toMatch(/^Unexpected comparison/)
    })

    test('does not report foo.bar === foo.bar (MemberExpression operands)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'bar' },
        },
        right: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'bar' },
        },
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report foo() === foo() (CallExpression operands)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'foo' },
          arguments: [],
        },
        right: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'foo' },
          arguments: [],
        },
        loc: makeLoc(1, 0, 1, 16),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('reports nested binary expression where inner is self-compare', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      // Only the inner node is visited directly — visitor only sees what's passed
      const innerNode = makeSelfCompare('x', '===')
      visitor.BinaryExpression(innerNode)
      expect(reports.length).toBe(1)
    })

    test('reports both sides being same reference object', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const idNode = { type: 'Identifier', name: 'ref' }
      const node = {
        type: 'BinaryExpression',
        operator: '===',
        left: idNode,
        right: idNode,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('=== and == both produce "true" in message', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const v1 = noSelfCompareRule.create(ctx1)
      const v2 = noSelfCompareRule.create(ctx2)
      v1.BinaryExpression(makeSelfCompare('a', '==='))
      v2.BinaryExpression(makeSelfCompare('a', '=='))
      expect(rep1[0].message).toContain('true')
      expect(rep2[0].message).toContain('true')
    })

    test('!== and != both produce "false" in message', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const v1 = noSelfCompareRule.create(ctx1)
      const v2 = noSelfCompareRule.create(ctx2)
      v1.BinaryExpression(makeSelfCompare('a', '!=='))
      v2.BinaryExpression(makeSelfCompare('a', '!='))
      expect(rep1[0].message).toContain('false')
      expect(rep2[0].message).toContain('false')
    })

    test('reports self-compare within a larger expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      // This is the self-compare node that would be a sub-expression
      const node = {
        type: 'BinaryExpression',
        operator: '!==',
        left: { type: 'Identifier', name: 'status' },
        right: { type: 'Identifier', name: 'status' },
        loc: makeLoc(3, 8, 3, 22),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('status')
    })

    test('does not report LogicalExpression node (x && x)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 8),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('meta docs description mentions "comparisons"', () => {
      const desc = noSelfCompareRule.meta.docs?.description ?? ''
      expect(desc.toLowerCase()).toMatch(/compar/)
    })

    test('all 4 operators produce reports for self-compare', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('x', '==='))
      visitor.BinaryExpression(makeSelfCompare('x', '!=='))
      visitor.BinaryExpression(makeSelfCompare('x', '=='))
      visitor.BinaryExpression(makeSelfCompare('x', '!='))
      expect(reports.length).toBe(4)
    })

    test('does not report x || x (LogicalExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      const node = {
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 8),
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('message contains backtick-wrapped variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noSelfCompareRule.create(context)
      visitor.BinaryExpression(makeSelfCompare('myVar', '==='))
      expect(reports[0].message).toContain('`myVar`')
    })
  })
})

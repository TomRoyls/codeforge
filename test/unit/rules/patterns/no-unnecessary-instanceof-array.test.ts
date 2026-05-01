import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryInstanceofArrayRule } from '../../../../src/rules/patterns/no-unnecessary-instanceof-array.js'
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
    getSource: () => '[] instanceof Array',
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
  leftElements: unknown[] = [],
  rightName = 'Array',
  operator = 'instanceof',
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 18,
): unknown {
  return {
    type: 'BinaryExpression',
    operator,
    left: { type: 'ArrayExpression', elements: leftElements },
    right: { type: 'Identifier', name: rightName },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-instanceof-array rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryInstanceofArrayRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryInstanceofArrayRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryInstanceofArrayRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryInstanceofArrayRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryInstanceofArrayRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning instanceof', () => {
      const desc = noUnnecessaryInstanceofArrayRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toContain('instanceof')
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryInstanceofArrayRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-instanceof-array',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryInstanceofArrayRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with BinaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      expect(visitor).toHaveProperty('BinaryExpression')
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryInstanceofArrayRule).toBeDefined()
      expect(noUnnecessaryInstanceofArrayRule.meta).toBeDefined()
      expect(noUnnecessaryInstanceofArrayRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY INSTANCEOF (25) =====

  describe('positive cases — reports unnecessary instanceof', () => {
    test('reports for [] instanceof Array (empty array)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([]))
      expect(reports.length).toBe(1)
    })

    test('reports for [1] instanceof Array (single number)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for [1,2,3] instanceof Array (multiple numbers)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([
        { type: 'Literal', value: 1 },
        { type: 'Literal', value: 2 },
        { type: 'Literal', value: 3 },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for ["a","b"] instanceof Array (string elements)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([
        { type: 'Literal', value: 'a' },
        { type: 'Literal', value: 'b' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for [true, false] instanceof Array (booleans)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([
        { type: 'Literal', value: true },
        { type: 'Literal', value: false },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for [null] instanceof Array (null element)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(1)
    })

    test('reports for [1, "a", true] instanceof Array (mixed types)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([
        { type: 'Literal', value: 1 },
        { type: 'Literal', value: 'a' },
        { type: 'Literal', value: true },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for [[]] instanceof Array (nested array)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([
        { type: 'ArrayExpression', elements: [] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for [{}, {}] instanceof Array (object elements)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([
        { type: 'ObjectExpression', properties: [] },
        { type: 'ObjectExpression', properties: [] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for large array [1..10] instanceof Array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      const elements = Array.from({ length: 10 }, (_, i) => ({ type: 'Literal', value: i + 1 }))
      visitor.BinaryExpression(makeBinaryNode(elements))
      expect(reports.length).toBe(1)
    })

    test('reports for ["hello"] instanceof Array (single string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for [0] instanceof Array (zero element)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for [42] instanceof Array (number literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for ["x"] instanceof Array (single char string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([{ type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with function expression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([
        { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for [1, [2, 3]] instanceof Array (nested mixed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([
        { type: 'Literal', value: 1 },
        { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for ["a","b","c","d"] instanceof Array (multiple strings)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([
        { type: 'Literal', value: 'a' },
        { type: 'Literal', value: 'b' },
        { type: 'Literal', value: 'c' },
        { type: 'Literal', value: 'd' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with binary expression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([
        { type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for [["nested"]] instanceof Array (deeply nested)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([
        { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 'nested' }] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with object literal element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([
        { type: 'ObjectExpression', properties: [{ type: 'Property', key: { type: 'Identifier', name: 'a' }, value: { type: 'Literal', value: 1 } }] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with many mixed elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([
        { type: 'Literal', value: 1 },
        { type: 'Literal', value: 'two' },
        { type: 'Literal', value: true },
        { type: 'ArrayExpression', elements: [] },
        { type: 'ObjectExpression', properties: [] },
        { type: 'Literal', value: null },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with identifier element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([
        { type: 'Identifier', name: 'x' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for array with undefined elements slot', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([null, null]))
      expect(reports.length).toBe(1)
    })

    test('reports with loc provided on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([], 'Array', 'instanceof', 3, 5, 3, 23))
      expect(reports.length).toBe(1)
    })

    test('reports with specific loc values preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([], 'Array', 'instanceof', 10, 4, 10, 22))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message contains "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([]))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message contains "instanceof Array"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([]))
      expect(reports[0].message).toContain('instanceof Array')
    })

    test('report message is exact match', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([]))
      expect(reports[0].message).toBe(
        'Unnecessary instanceof Array check on an array literal. It always returns true.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([]))
      expect(reports[0].node).toBeDefined()
    })

    test('report loc values preserved from input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([], 'Array', 'instanceof', 7, 2, 7, 20))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([]))
      visitor.BinaryExpression(makeBinaryNode([{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(2)
    })

    test('consistent messages across multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([]))
      visitor.BinaryExpression(makeBinaryNode([{ type: 'Literal', value: 1 }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('single report per BinaryExpression call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([]))
      expect(reports.length).toBe(1)
    })

    test('multiple violations tracked correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([]))
      visitor.BinaryExpression(makeBinaryNode([{ type: 'Literal', value: 1 }]))
      visitor.BinaryExpression(makeBinaryNode([{ type: 'Literal', value: 'a' }]))
      expect(reports.length).toBe(3)
    })

    test('report node is same reference as input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      const node = makeBinaryNode([])
      visitor.BinaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc start.line preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([], 'Array', 'instanceof', 15, 0, 15, 18))
      expect(reports[0].loc?.start.line).toBe(15)
    })

    test('report loc start.column preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([], 'Array', 'instanceof', 1, 8, 1, 26))
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('report loc end values preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([], 'Array', 'instanceof', 2, 0, 4, 1))
      expect(reports[0].loc?.end.line).toBe(4)
      expect(reports[0].loc?.end.column).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for x instanceof Array (Identifier left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'Array' },
        loc: makeLoc(1, 0, 1, 18),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for [] instanceof Object (wrong right name)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([], 'Object'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [] + Array (wrong operator +)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([], 'Array', '+'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [] - Array (wrong operator -)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([], 'Array', '-'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [] === Array (wrong operator ===)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([], 'Array', '==='))
      expect(reports.length).toBe(0)
    })

    test('does not report for [] == Array (wrong operator ==)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([], 'Array', '=='))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      expect(() => visitor.BinaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      expect(() => visitor.BinaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      expect(() => visitor.BinaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong right type (not Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: { type: 'ArrayExpression', elements: [] },
        right: { type: 'Literal', value: 'Array' },
        loc: makeLoc(1, 0, 1, 18),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong right name (not "Array")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([], 'MyArray'))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong left type (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: { type: 'Identifier', name: 'arr' },
        right: { type: 'Identifier', name: 'Array' },
        loc: makeLoc(1, 0, 1, 18),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when operator property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: { type: 'ArrayExpression', elements: [] },
        right: { type: 'Identifier', name: 'Array' },
        loc: makeLoc(1, 0, 1, 18),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when right property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: { type: 'ArrayExpression', elements: [] },
        loc: makeLoc(1, 0, 1, 18),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when left property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: 'instanceof',
        right: { type: 'Identifier', name: 'Array' },
        loc: makeLoc(1, 0, 1, 18),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for {} instanceof Array (ObjectExpression left)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: { type: 'ObjectExpression', properties: [] },
        right: { type: 'Identifier', name: 'Array' },
        loc: makeLoc(1, 0, 1, 18),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for foo instanceof Array (Identifier left with different name)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: { type: 'Identifier', name: 'foo' },
        right: { type: 'Identifier', name: 'Array' },
        loc: makeLoc(1, 0, 1, 18),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for [] instanceof array (lowercase right name)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([], 'array'))
      expect(reports.length).toBe(0)
    })

    test('does not report when right is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: { type: 'ArrayExpression', elements: [] },
        right: null,
        loc: makeLoc(1, 0, 1, 18),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryInstanceofArrayRule.create(ctx1)
      const visitor2 = noUnnecessaryInstanceofArrayRule.create(ctx2)
      visitor1.BinaryExpression(makeBinaryNode([]))
      visitor2.BinaryExpression({
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'Array' },
        loc: makeLoc(1, 0, 1, 18),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([]))
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'Array' },
        loc: makeLoc(1, 0, 1, 18),
      })
      visitor.BinaryExpression(makeBinaryNode([{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: { type: 'ArrayExpression', elements: [] },
        right: { type: 'Identifier', name: 'Array' },
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: { type: 'ArrayExpression', elements: [] },
        right: { type: 'Identifier', name: 'Array' },
      }
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([]))           // valid trigger
      visitor.BinaryExpression(makeBinaryNode([], 'Object'))  // wrong right
      visitor.BinaryExpression(makeBinaryNode([], 'Array', '+')) // wrong operator
      visitor.BinaryExpression(makeBinaryNode([{ type: 'Literal', value: 1 }])) // valid trigger
      visitor.BinaryExpression(makeBinaryNode([{ type: 'Literal', value: 2 }])) // valid trigger
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryInstanceofArrayRule.create(context)
      const visitor2 = noUnnecessaryInstanceofArrayRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryInstanceofArrayRule.meta
      const meta2 = noUnnecessaryInstanceofArrayRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: { type: 'ArrayExpression', elements: [] },
        right: { type: 'Identifier', name: 'Array' },
        loc: makeLoc(1, 0, 1, 18),
        range: [0, 18],
        extra: true,
      }
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: { type: 'ArrayExpression', elements: [] },
        right: { type: 'Identifier', name: 'Array' },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: { type: 'ArrayExpression', elements: [] },
        right: { type: 'Identifier', name: 'Array' },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      const node = makeBinaryNode([])
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryInstanceofArrayRule).toBeDefined()
      expect(typeof noUnnecessaryInstanceofArrayRule.create).toBe('function')
      expect(typeof noUnnecessaryInstanceofArrayRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: { type: 'ArrayExpression', elements: [] },
        right: { type: 'Identifier', name: 'Array' },
        loc: makeLoc(1, 0, 1, 18),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([]))
      visitor.BinaryExpression(makeBinaryNode([{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('node with loc and extra properties still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: { type: 'ArrayExpression', elements: [], extra: 'data' },
        right: { type: 'Identifier', name: 'Array' },
        loc: makeLoc(1, 0, 1, 18),
        range: [0, 18],
        trailingComments: [],
      })
      expect(reports.length).toBe(1)
    })

    test('does not throw on malformed node with string operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      expect(() => visitor.BinaryExpression({ type: 'BinaryExpression', operator: 123 })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression(makeBinaryNode([], 'Array', 'instanceof', 10, 4, 12, 8))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(12)
      expect(reports[0].loc?.end.column).toBe(8)
    })

    test('handles deeply nested extra properties on left', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: {
          type: 'ArrayExpression',
          elements: [],
          loc: makeLoc(1, 0, 1, 2),
          extra: { parenthesized: true },
        },
        right: { type: 'Identifier', name: 'Array' },
        loc: makeLoc(1, 0, 1, 18),
      })
      expect(reports.length).toBe(1)
    })

    test('handles array node passed as array (primitive-like)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryInstanceofArrayRule.create(context)
      expect(() => visitor.BinaryExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})

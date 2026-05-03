import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMathCeilSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-math-ceil-spread.js'
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
    getSource: () => '[]',
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

function makeMathCeilSpreadNode(
  spreadArg: unknown = { type: 'Identifier', name: 'items' },
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 25,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Math' },
      property: { type: 'Identifier', name: 'ceil' },
    },
    arguments: [{ type: 'SpreadElement', argument: spreadArg }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeCallNode(
  object: unknown,
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 25,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-math-ceil-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMathCeilSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryMathCeilSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryMathCeilSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMathCeilSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryMathCeilSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Math.ceil', () => {
      const desc = noUnnecessaryMathCeilSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/math/)
      expect(desc).toMatch(/ceil/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryMathCeilSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-math-ceil-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMathCeilSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryMathCeilSpreadRule).toBeDefined()
      expect(noUnnecessaryMathCeilSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryMathCeilSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Math.ceil with spread', () => {
    test('reports Math.ceil(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode())
      expect(reports.length).toBe(1)
    })

    test('reports Math.ceil(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode({ type: 'Identifier', name: 'arr' }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.ceil(...[1, 2, 3])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.ceil(...getValues())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getValues' },
        arguments: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.ceil(...obj.values)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'values' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.ceil(...(x ? a : b))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Math.ceil and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode())
      expect(reports[0].message).toMatch(/ceil/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode())
      expect(reports[0].message).toBe(
        'Math.ceil(...items) with spread is unusual. ceil() expects a single number.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      const node = makeMathCeilSpreadNode()
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode({ type: 'Identifier', name: 'x' }, 5, 10, 5, 35))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode())
      visitor.CallExpression(makeMathCeilSpreadNode())
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeMathCeilSpreadNode({ type: 'Identifier', name: 'b' }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports Math.ceil(...nums) with numeric identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode({ type: 'Identifier', name: 'nums' }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.ceil(...args) with args identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode({ type: 'Identifier', name: 'args' }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.ceil(...new Set())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.ceil(...map.values())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'map' },
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.ceil(...template) with template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode({
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.ceil(...fn()) with function call result', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.ceil(...arr.flat())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.ceil(...{a,b}) with object spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode({
        type: 'ObjectExpression',
        properties: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement argument being a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Literal', value: 42 } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement argument being a BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports with SpreadElement argument being an ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode({
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Math.ceil(5) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Math' },
        'ceil',
        [{ type: 'Literal', value: 5 }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(x) — identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Math' },
        'ceil',
        [{ type: 'Identifier', name: 'x' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil() — zero arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Math' },
        'ceil',
        [],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(x, y) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Math' },
        'ceil',
        [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Math' },
        'floor',
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Math' },
        'round',
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.max(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Math' },
        'max',
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.min(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Math' },
        'min',
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.ceil(...items) — non-Math object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'obj' },
        'ceil',
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for calc.ceil(...items) — non-Math object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'calc' },
        'ceil',
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for ceil(...items) — standalone function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'ceil' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'ceil' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed (Math["ceil"](...items))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ceil' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not an Identifier (MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } },
        'ceil',
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not an Identifier (CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'getMath' }, arguments: [] },
        'ceil',
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Ceil" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Math' },
        'Ceil',
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "CEIL" (all caps)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Math' },
        'CEIL',
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "math" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'math' },
        'ceil',
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "MATH" (all caps)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'MATH' },
        'ceil',
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: {},
        right: {},
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {},
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({
        type: 'ReturnStatement',
        argument: null,
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({
        type: 'IfStatement',
        test: {},
        consequent: {},
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: null,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array has a non-SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Math' },
        'ceil',
        [{ type: 'Literal', value: 3.14 }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is "ArrayExpression" not "SpreadElement"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Math' },
        'ceil',
        [{ type: 'ArrayExpression', elements: [] }],
      ))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Math' },
        'ceil',
        [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'val' } }],
      ))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryMathCeilSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryMathCeilSpreadRule.create(ctx2)
      visitor1.CallExpression(makeMathCeilSpreadNode())
      visitor2.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Math' },
        'ceil',
        [{ type: 'Literal', value: 5 }],
      ))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode())
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Math' },
        'ceil',
        [{ type: 'Literal', value: 5 }],
      ))
      visitor.CallExpression(makeMathCeilSpreadNode({ type: 'Identifier', name: 'arr' }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Math' },
        'ceil',
        [{ type: 'Literal', value: 5 }],
      ))
      visitor.CallExpression(makeMathCeilSpreadNode())
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'obj' },
        'ceil',
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      visitor.CallExpression(makeMathCeilSpreadNode({ type: 'Identifier', name: 'nums' }))
      visitor.CallExpression(makeCallNode(
        { type: 'Identifier', name: 'Math' },
        'floor',
        [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      ))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryMathCeilSpreadRule.create(context)
      const visitor2 = noUnnecessaryMathCeilSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryMathCeilSpreadRule.meta
      const meta2 = noUnnecessaryMathCeilSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
        range: [0, 25],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      const node = makeMathCeilSpreadNode()
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryMathCeilSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryMathCeilSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryMathCeilSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ceil' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode({ type: 'Identifier', name: 'x' }, 10, 4, 10, 30))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('handles non-computed member expression (reports)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ceil' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'ceil' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeMathCeilSpreadNode({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles SpreadElement with complex nested argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression(makeMathCeilSpreadNode({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getData' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCeilSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ceil' },
        },
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

  })
})

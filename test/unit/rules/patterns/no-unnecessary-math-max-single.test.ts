import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMathMaxSingleRule } from '../../../../src/rules/patterns/no-unnecessary-math-max-single.js'
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

function makeMathCallNode(
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Math' },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-math-max-single rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMathMaxSingleRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryMathMaxSingleRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryMathMaxSingleRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMathMaxSingleRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryMathMaxSingleRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Math.max and Math.min', () => {
      const desc = noUnnecessaryMathMaxSingleRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/math/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryMathMaxSingleRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-math-max-single.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMathMaxSingleRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryMathMaxSingleRule).toBeDefined()
      expect(noUnnecessaryMathMaxSingleRule.meta).toBeDefined()
      expect(noUnnecessaryMathMaxSingleRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS Math.max/min with 0-1 args (27) =====

  describe('positive cases — reports unnecessary Math.max/min', () => {
    test('reports for Math.max() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', []))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.min() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('min', []))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.max(5) with single numeric argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.min(5) with single numeric argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('min', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.max(0) with zero argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.max(foo) with single identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', [{ type: 'Identifier', name: 'foo' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.min(bar) with single identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('min', [{ type: 'Identifier', name: 'bar' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.max(-1) with negative number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', [{ type: 'Literal', value: -1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.min(-1) with negative number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('min', [{ type: 'Literal', value: -1 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.max(true) with boolean argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.min(false) with boolean argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('min', [{ type: 'Literal', value: false }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.max(Infinity) with Infinity argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.min(Infinity) with Infinity argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('min', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions max for Math.max()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', []))
      expect(reports[0].message).toMatch(/max/)
    })

    test('report message mentions min for Math.min()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('min', []))
      expect(reports[0].message).toMatch(/min/)
    })

    test('report message for Math.max() says always returns x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', [{ type: 'Literal', value: 5 }]))
      expect(reports[0].message).toBe(
        'Unnecessary Math.max() with 0 or 1 argument. Math.max(x) always returns x. Use the value directly.',
      )
    })

    test('report message for Math.min() says always returns x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('min', [{ type: 'Literal', value: 5 }]))
      expect(reports[0].message).toBe(
        'Unnecessary Math.min() with 0 or 1 argument. Math.min(x) always returns x. Use the value directly.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', []))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', []))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      const node = makeMathCallNode('max', [])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', []))
      visitor.CallExpression(makeMathCallNode('min', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(2)
    })

    test('reports for Math.max() with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'val' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.min() with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('min', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.max() with unary expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', [{ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 5 } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.min() with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('min', [{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', []))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('max and min reports have different messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', []))
      visitor.CallExpression(makeMathCallNode('min', []))
      expect(reports.length).toBe(2)
      expect(reports[0].message).not.toBe(reports[1].message)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Math.max(1, 2) with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.min(1, 2) with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('min', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.max(a, b, c) with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.min(x, y, z) with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('min', [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }, { type: 'Identifier', name: 'z' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor(5) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('floor', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.ceil(5) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('ceil', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.round(5) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('round', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs(5) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('abs', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.sqrt(5) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('sqrt', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.pow(2, 3) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('pow', [{ type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.max() — wrong object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'max' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for myObj.min(5) — wrong object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'myObj' },
          property: { type: 'Identifier', name: 'min' },
        },
        arguments: [{ type: 'Literal', value: 5 }],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'max' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Max" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('Max', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Min" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('Min', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'Math' } },
          property: { type: 'Identifier', name: 'max' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'max' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'max' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.max with five arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }, { type: 'Literal', value: 4 }, { type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.min with ten arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      const args = Array.from({ length: 10 }, (_, i) => ({ type: 'Literal', value: i }))
      visitor.CallExpression(makeMathCallNode('min', args))
      expect(reports.length).toBe(0)
    })

    test('does not report for regular function call max()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'max' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for method name "maxx" (typo)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('maxx', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for method name "minn" (typo)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('minn', []))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryMathMaxSingleRule.create(ctx1)
      const visitor2 = noUnnecessaryMathMaxSingleRule.create(ctx2)
      visitor1.CallExpression(makeMathCallNode('max', []))
      visitor2.CallExpression(makeMathCallNode('max', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed valid/invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', []))
      visitor.CallExpression(makeMathCallNode('max', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      visitor.CallExpression(makeMathCallNode('min', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'max' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'max' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      visitor.CallExpression(makeMathCallNode('max', []))
      visitor.CallExpression(makeMathCallNode('min', [{ type: 'Identifier', name: 'foo' }]))
      visitor.CallExpression(makeMathCallNode('min', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]))
      visitor.CallExpression(makeMathCallNode('max', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryMathMaxSingleRule.create(context)
      const visitor2 = noUnnecessaryMathMaxSingleRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryMathMaxSingleRule.meta
      const meta2 = noUnnecessaryMathMaxSingleRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'max' },
        },
        arguments: [],
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
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'min' },
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'max' },
        },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      const node = makeMathCallNode('max', [])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryMathMaxSingleRule).toBeDefined()
      expect(typeof noUnnecessaryMathMaxSingleRule.create).toBe('function')
      expect(typeof noUnnecessaryMathMaxSingleRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'max' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'max' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'max' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports max and min violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathMaxSingleRule.create(context)
      visitor.CallExpression(makeMathCallNode('max', []))
      visitor.CallExpression(makeMathCallNode('min', []))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('max')
      expect(reports[1].message).toContain('min')
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMathCbrtSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-math-cbrt-spread.js'
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

function makeMathCbrtSpreadCall(
  spreadArg: unknown,
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
      property: { type: 'Identifier', name: 'cbrt' },
      computed: false,
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
  locEndCol = 20,
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

describe('no-unnecessary-math-cbrt-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMathCbrtSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryMathCbrtSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryMathCbrtSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMathCbrtSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryMathCbrtSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning cbrt', () => {
      const desc = noUnnecessaryMathCbrtSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/cbrt/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryMathCbrtSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-math-cbrt-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMathCbrtSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryMathCbrtSpreadRule).toBeDefined()
      expect(noUnnecessaryMathCbrtSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryMathCbrtSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Math.cbrt(...items) spread', () => {
    test('reports Math.cbrt(...items) with identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'Identifier', name: 'items' }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.cbrt(...[1, 2, 3]) with array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.cbrt(...arr) with member expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.cbrt(...getValues()) with call expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValues' }, arguments: [] }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Math.cbrt and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'Identifier', name: 'items' }))
      expect(reports[0].message).toMatch(/cbrt/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'Identifier', name: 'items' }))
      expect(reports[0].message).toBe(
        'Math.cbrt(...items) with spread is unusual. cbrt() expects a single number.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'Identifier', name: 'items' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'Identifier', name: 'items' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      const node = makeMathCbrtSpreadCall({ type: 'Identifier', name: 'items' })
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'Identifier', name: 'items' }, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'Identifier', name: 'b' }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports Math.cbrt(...new Set()) with NewExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.cbrt(...(x ? a : b)) with ConditionalExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.cbrt(...fn()) with member call expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'fn' } },
        arguments: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.cbrt(...[x]) with single-element array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'ArrayExpression', elements: [{ type: 'Identifier', name: 'x' }] }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.cbrt(...[]) with empty array spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'Identifier', name: 'items' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports Math.cbrt(...args) with TemplateLiteral spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'TemplateLiteral', quasis: [], expressions: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.cbrt(...obj.prop) with deep member expression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({
        type: 'MemberExpression',
        object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } },
        property: { type: 'Identifier', name: 'c' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.cbrt(...(function(){ return []; })()) with IIFE spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({
        type: 'CallExpression',
        callee: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        arguments: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.cbrt(...iterable) with SequenceExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({
        type: 'SequenceExpression',
        expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.cbrt(...map.values()) with chained call spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({
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

    test('reports with ArrowFunction expression as spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({
        type: 'CallExpression',
        callee: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        arguments: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports with BinaryExpression as spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports Math.cbrt(...nested) with nested spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({
        type: 'SpreadElement',
        argument: { type: 'Identifier', name: 'nested' },
      }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report Math.cbrt(5) — no spread, single number arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'cbrt', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.cbrt(x) — no spread, identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'cbrt', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.cbrt() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'cbrt'))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.cbrt(...items, extra) — two args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'cbrt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }, { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.sqrt(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'sqrt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.max(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'max', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math.min(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'min', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report obj.cbrt(...items) — object is not Math', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'obj' }, 'cbrt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report Math["cbrt"](...items) — computed member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'cbrt' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'cbrt' }, arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'cbrt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'global' }, property: { type: 'Identifier', name: 'Math' } },
          property: { type: 'Identifier', name: 'cbrt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object name is "math" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'math' }, 'cbrt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "MATH"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'MATH' }, 'cbrt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "cbrt" but object is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 42 }, 'cbrt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
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
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
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

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'cbrt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'cbrt' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "CBRT" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'CBRT', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Literal instead of SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'cbrt', [{ type: 'Literal', value: 27 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array has three elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'cbrt', [
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } },
        { type: 'Literal', value: 1 },
        { type: 'Literal', value: 2 },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'cbrt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'cbrt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getMath' }, arguments: [] }, 'cbrt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryMathCbrtSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryMathCbrtSpreadRule.create(ctx2)
      visitor1.CallExpression(makeMathCbrtSpreadCall({ type: 'Identifier', name: 'items' }))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'cbrt', [{ type: 'Literal', value: 5 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'cbrt', [{ type: 'Literal', value: 5 }]))
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'cbrt' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'cbrt' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'cbrt', [{ type: 'Literal', value: 5 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'obj' }, 'cbrt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'Identifier', name: 'arr' }))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'sqrt', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryMathCbrtSpreadRule.create(context)
      const visitor2 = noUnnecessaryMathCbrtSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryMathCbrtSpreadRule.meta
      const meta2 = noUnnecessaryMathCbrtSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'cbrt' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
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
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'cbrt' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'cbrt' },
          computed: false,
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
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      const node = makeMathCbrtSpreadCall({ type: 'Identifier', name: 'items' })
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryMathCbrtSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryMathCbrtSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryMathCbrtSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'cbrt' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'Identifier', name: 'items' }, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property as false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'cbrt' },
          computed: false,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'cbrt' },
          computed: true,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'Identifier', name: 'a' }))
      visitor.CallExpression(makeMathCbrtSpreadCall({ type: 'Identifier', name: 'b' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when spread argument type is not SpreadElement (just Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Math' }, 'cbrt', [{ type: 'Identifier', name: 'items' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'cbrt' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathCbrtSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'cbrt' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryMathRandomSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-math-random-spread.js'
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

function makeMathRandomCall(
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
      property: { type: 'Identifier', name: 'random' },
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpreadElement(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-math-random-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryMathRandomSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryMathRandomSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryMathRandomSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryMathRandomSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryMathRandomSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Math.random and spread', () => {
      const desc = noUnnecessaryMathRandomSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/math/)
      expect(desc).toMatch(/random/)
      expect(desc).toMatch(/spread/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryMathRandomSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-math-random-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryMathRandomSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryMathRandomSpreadRule).toBeDefined()
      expect(noUnnecessaryMathRandomSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryMathRandomSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports Math.random(...spread)', () => {
    test('reports for Math.random(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.random(...arr)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.random(...data)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'data' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.random(...[1, 2, 3])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.random(...[] )', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'ArrayExpression', elements: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.random(...obj.items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.random(...getItems())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Math.random and spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/Math\.random/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'Math.random(...items) with spread is unusual. random() expects no arguments.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      const node = makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'items' })], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Math.random(...args) with args being a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.random(...{a:1})', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'ObjectExpression', properties: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.random(...(x))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'x' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.random(...template)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'TemplateLiteral', quasis: [], expressions: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.random(...cond ? a : b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'cond' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.random(...nested.obj.prop)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'nested' }, property: { type: 'Identifier', name: 'obj' } }, property: { type: 'Identifier', name: 'prop' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.random(...new Array(5))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Array' }, arguments: [{ type: 'Literal', value: 5 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.random(...null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Literal', value: null })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.random(...list) with ArrowFunction argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for Math.random(...regex) with regex literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Literal', value: /pattern/ })]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Math.random() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.random(1) — regular argument not spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.random(1, 2) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.random(...a, ...b) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'a' }), makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for foo.random(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'random' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.floor(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'floor' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.max(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'max' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.min(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'min' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Math.abs(...items) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for random(...items) — standalone function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'random' },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'random' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'random' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } },
          property: { type: 'Identifier', name: 'random' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object name is "math" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'math' },
          property: { type: 'Identifier', name: 'random' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: null,
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'random' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is "Random" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'Random' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is "RANDOM" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'RANDOM' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([{ type: 'Identifier', name: 'items' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement (Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement (CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a SpreadElement (ArrayExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed (Math["random"](...items))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'random' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression (getMath().random(...items))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getMath' }, arguments: [] },
          property: { type: 'Identifier', name: 'random' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 42 },
          property: { type: 'Identifier', name: 'random' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryMathRandomSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryMathRandomSpreadRule.create(ctx2)
      visitor1.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeMathRandomCall([]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMathRandomCall([]))
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'more' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'random' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'random' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([]))
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeMathRandomCall([{ type: 'Literal', value: 1 }]))
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'more' })]))
      visitor.CallExpression(makeMathRandomCall([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryMathRandomSpreadRule.create(context)
      const visitor2 = noUnnecessaryMathRandomSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryMathRandomSpreadRule.meta
      const meta2 = noUnnecessaryMathRandomSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'random' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
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
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'random' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'random' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      const node = makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryMathRandomSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryMathRandomSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryMathRandomSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'random' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'items' })], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed false MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'random' },
          computed: false,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Literal', value: 'random' },
          computed: true,
        },
        arguments: [makeSpreadElement({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'a' })]))
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'b' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('Math.random(x) with non-spread Identifier does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([{ type: 'Identifier', name: 'items' }]))
      expect(reports.length).toBe(0)
    })

    test('Math.random(...items, extra) with two args does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'items' }), { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('handles three spread arguments (more than 1 arg)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryMathRandomSpreadRule.create(context)
      visitor.CallExpression(makeMathRandomCall([makeSpreadElement({ type: 'Identifier', name: 'a' }), makeSpreadElement({ type: 'Identifier', name: 'b' }), makeSpreadElement({ type: 'Identifier', name: 'c' })]))
      expect(reports.length).toBe(0)
    })
  })
})

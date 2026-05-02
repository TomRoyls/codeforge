import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayEveryBoolean } from '../../../../src/rules/patterns/no-unnecessary-array-every-boolean.js'
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

function makeArrowFn(paramName: string, body: unknown): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [{ type: 'Identifier', name: paramName }],
    body,
  }
}

function makeBooleanLiteral(value: boolean): unknown {
  return { type: 'BooleanLiteral', value }
}

function makeFuncExpr(paramName: string, body: unknown): unknown {
  return {
    type: 'FunctionExpression',
    id: null,
    params: [{ type: 'Identifier', name: paramName }],
    body,
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-every-boolean rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayEveryBoolean.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayEveryBoolean.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayEveryBoolean.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayEveryBoolean.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayEveryBoolean.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning every', () => {
      const desc = noUnnecessaryArrayEveryBoolean.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/every/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayEveryBoolean.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-every-boolean.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayEveryBoolean.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayEveryBoolean).toBeDefined()
      expect(noUnnecessaryArrayEveryBoolean.meta).toBeDefined()
      expect(noUnnecessaryArrayEveryBoolean.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary every(() => true)', () => {
    test('reports for arr.every(x => true) with Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.every(_ => true) with underscore param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('_', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.every(item => true) with descriptive param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('item', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(1)
    })

    test('reports for [].every(x => true) with ArrayExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(1)
    })

    test('reports for getArr().every(x => true) with CallExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.arr.every(x => true) with MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(1)
    })

    test('reports for FunctionExpression with 1 param and expression body BooleanLiteral true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeFuncExpr('x', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "every"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(reports[0].message).toMatch(/every/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(reports[0].message).toBe(
        'Array.prototype.every(() => true) always returns true. Remove the call or use the array directly.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc start values preserved from input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values preserved from input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))], 3, 0, 3, 25))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'every', [makeArrowFn('_', makeBooleanLiteral(true))]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports with specific location line values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.end.line).toBe(10)
    })

    test('reports with specific location column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))], 1, 7, 1, 32))
      expect(reports[0].loc?.start.column).toBe(7)
      expect(reports[0].loc?.end.column).toBe(32)
    })

    test('reports with loc spanning multiple lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))], 2, 0, 4, 15))
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.end.line).toBe(4)
    })

    test('reports for arr.every(el => true) with 2-letter param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('el', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(1)
    })

    test('reports with ThisExpression as callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(1)
    })

    test('reports with NewExpression as callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.every($el => true) with dollar sign param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('$el', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.every(_item => true) with underscore-prefixed param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('_item', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.every(element => true) with long param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('element', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.every(val => true) with common param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('val', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(1)
    })

    test('reports with non-empty ArrayExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.every(() => true) — 0 params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [{ type: 'ArrowFunctionExpression', params: [], body: makeBooleanLiteral(true) }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.every((x, y) => true) — 2 params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }], body: makeBooleanLiteral(true) }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.every((x, y, z) => true) — 3 params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }, { type: 'Identifier', name: 'z' }], body: makeBooleanLiteral(true) }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.every(x => false) — returns false', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', makeBooleanLiteral(false))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.every(x => { return true }) — block body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: makeBooleanLiteral(true) }] } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.every(x => x > 0) — actual condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', { type: 'BinaryExpression', operator: '>', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 0 } })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.every(x => 1) — number literal body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', { type: 'Literal', value: 1 })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.every(x => "true") — string literal body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', { type: 'Literal', value: 'true' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.every(x => null) — null literal body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', { type: 'Literal', value: null })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.every(Boolean) — Identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [{ type: 'Identifier', name: 'Boolean' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.every(callback) — Identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [{ type: 'Identifier', name: 'callback' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.some(x => true) — wrong method "some"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(x => true) — wrong method "filter"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(x => true) — wrong method "map"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.forEach(x => true) — wrong method "forEach"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.reduce(x => true) — wrong method "reduce"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduce', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find(x => true) — wrong method "find"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.every() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.every(fn, ctx) — 2 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true)), { type: 'Identifier', name: 'ctx' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr["every"](x => true) — computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'every' },
          computed: true,
        },
        arguments: [makeArrowFn('x', makeBooleanLiteral(true))],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeArrowFn('x', makeBooleanLiteral(true))], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'every' },
        },
        arguments: [makeArrowFn('x', makeBooleanLiteral(true))],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Every" (case-sensitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'Every', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression with block body returning true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [{
        type: 'FunctionExpression',
        id: null,
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: makeBooleanLiteral(true) }] },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression with 0 params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [{
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: makeBooleanLiteral(true),
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression with 2 params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [{
        type: 'FunctionExpression',
        id: null,
        params: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'i' }],
        body: makeBooleanLiteral(true),
      }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayEveryBoolean.create(ctx1)
      const visitor2 = noUnnecessaryArrayEveryBoolean.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFn('x', makeBooleanLiteral(true))]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFn('x', makeBooleanLiteral(true))]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('_', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [makeArrowFn('x', makeBooleanLiteral(true))],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [makeArrowFn('x', makeBooleanLiteral(true))],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFn('x', makeBooleanLiteral(true))]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', makeBooleanLiteral(false))]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('_', makeBooleanLiteral(true))]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayEveryBoolean.create(context)
      const visitor2 = noUnnecessaryArrayEveryBoolean.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayEveryBoolean.meta
      const meta2 = noUnnecessaryArrayEveryBoolean.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [makeArrowFn('x', makeBooleanLiteral(true))],
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
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [makeArrowFn('x', makeBooleanLiteral(true))],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [makeArrowFn('x', makeBooleanLiteral(true))],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayEveryBoolean).toBeDefined()
      expect(typeof noUnnecessaryArrayEveryBoolean.create).toBe('function')
      expect(typeof noUnnecessaryArrayEveryBoolean.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [makeArrowFn('x', makeBooleanLiteral(true))],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles non-computed member expression (reports)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'every' },
          computed: false,
        },
        arguments: [makeArrowFn('x', makeBooleanLiteral(true))],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'every' },
          computed: true,
        },
        arguments: [makeArrowFn('x', makeBooleanLiteral(true))],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayEveryBoolean.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr1' }, 'every', [makeArrowFn('x', makeBooleanLiteral(true))]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr2' }, 'every', [makeArrowFn('_', makeBooleanLiteral(true))]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

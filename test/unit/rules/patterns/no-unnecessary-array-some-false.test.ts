import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArraySomeFalse } from '../../../../src/rules/patterns/no-unnecessary-array-some-false.js'
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

function makeArrowFalse(paramName = 'x'): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [{ type: 'Identifier', name: paramName }],
    body: { type: 'BooleanLiteral', value: false },
  }
}

function makeFuncExprFalse(paramName = 'x'): unknown {
  return {
    type: 'FunctionExpression',
    id: null,
    params: [{ type: 'Identifier', name: paramName }],
    body: { type: 'BooleanLiteral', value: false },
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-some-false rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArraySomeFalse.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArraySomeFalse.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArraySomeFalse.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArraySomeFalse.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArraySomeFalse.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning "some"', () => {
      const desc = noUnnecessaryArraySomeFalse.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/some/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArraySomeFalse.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-some-false.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArraySomeFalse.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArraySomeFalse).toBeDefined()
      expect(noUnnecessaryArraySomeFalse.meta).toBeDefined()
      expect(noUnnecessaryArraySomeFalse.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary some(() => false)', () => {
    test('reports arr.some(x => false) — basic arrow', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse('x')]))
      expect(reports.length).toBe(1)
    })

    test('reports arr.some(_ => false) — underscore param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse('_')]))
      expect(reports.length).toBe(1)
    })

    test('reports arr.some(item => false) — param named item', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse('item')]))
      expect(reports.length).toBe(1)
    })

    test('reports arr.some(element => false) — param named element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse('element')]))
      expect(reports.length).toBe(1)
    })

    test('reports with FunctionExpression (non-block body)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeFuncExprFalse('x')]))
      expect(reports.length).toBe(1)
    })

    test('reports with Identifier callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'myArray' }, 'some', [makeArrowFalse()]))
      expect(reports.length).toBe(1)
    })

    test('reports with MemberExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } },
          'some',
          [makeArrowFalse()],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with ArrayExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }, 'some', [makeArrowFalse()]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with CallExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] },
          'some',
          [makeArrowFalse()],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('report message mentions "some"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()]))
      expect(reports[0].message).toMatch(/some/)
    })

    test('report message is exact match from rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()]))
      expect(reports[0].message).toBe(
        'Array.prototype.some(() => false) always returns false. Remove the call.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches input node reference', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc start values preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()], 5, 10, 5, 40))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'list' }, 'some', [makeArrowFalse()]))
      expect(reports.length).toBe(2)
    })

    test('all accumulated reports have same message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'list' }, 'some', [makeArrowFalse()]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has message, loc, and node properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node without loc — still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
        },
        arguments: [makeArrowFalse()],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles computed: false member expression — reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
        },
        arguments: [makeArrowFalse()],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with extra properties — reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
        },
        arguments: [makeArrowFalse()],
        loc: makeLoc(1, 0, 1, 25),
        range: [0, 25],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with _parent property — reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
        },
        arguments: [makeArrowFalse()],
        loc: makeLoc(1, 0, 1, 25),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc — reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
        },
        arguments: [makeArrowFalse()],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end) — reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
        },
        arguments: [makeArrowFalse()],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('reports with ThisExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'some', [makeArrowFalse()]))
      expect(reports.length).toBe(1)
    })

    test('reports with ObjectExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(
        makeCallNode({ type: 'ObjectExpression', properties: [] }, 'some', [makeArrowFalse()]),
      )
      expect(reports.length).toBe(1)
    })

    test('reports with FunctionExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(
        makeCallNode(
          { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
          'some',
          [makeArrowFalse()],
        ),
      )
      expect(reports.length).toBe(1)
    })

    test('separate create() calls — positive one reports correctly', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArraySomeFalse.create(ctx1)
      const visitor2 = noUnnecessaryArraySomeFalse.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFalse()]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor with mixed calls — only arrow-false reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BooleanLiteral', value: true },
      }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()]))
      expect(reports.length).toBe(2)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for () => true — returns true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BooleanLiteral', value: true },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for x => x > 0 — actual condition', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BinaryExpression', operator: '>', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 0 } },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for () => { return false } — BlockStatement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: { type: 'BooleanLiteral', value: false } }] },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .every(() => false) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFalse()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .filter(() => false) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', [makeArrowFalse()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .map(() => false) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeArrowFalse()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .find(() => false) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', [makeArrowFalse()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .reduce(() => false) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduce', [makeArrowFalse()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for .forEach(() => false) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [makeArrowFalse()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.some() — no args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.some(Boolean) — Identifier arg not function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [{ type: 'Identifier', name: 'Boolean' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.some(() => false, extra) — 2 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse(), { type: 'Identifier', name: 'thisArg' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for () => 0 — NumericLiteral body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'Literal', value: 0 },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for () => null — NullLiteral body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'NullLiteral' },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for () => "false" — StringLiteral body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'Literal', value: 'false' },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for () => undefined — Identifier body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'Identifier', name: 'undefined' },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is Identifier (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'some' },
        arguments: [makeArrowFalse()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [makeArrowFalse()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        arguments: [makeArrowFalse()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is Literal (not Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'some' },
        },
        arguments: [makeArrowFalse()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Some" — case sensitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'Some', [makeArrowFalse()]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "somee" — typo', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'somee', [makeArrowFalse()]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for computed: true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
        },
        arguments: [makeArrowFalse()],
        loc: makeLoc(1, 0, 1, 25),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [makeArrowFalse()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [makeArrowFalse()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for 0 params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [{
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BooleanLiteral', value: false },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 2 params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'i' }],
        body: { type: 'BooleanLiteral', value: false },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 3 params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'i' }, { type: 'Identifier', name: 'arr' }],
        body: { type: 'BooleanLiteral', value: false },
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when body is Identifier (not BooleanLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'Identifier', name: 'x' },
      }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArraySomeFalse.create(ctx1)
      const visitor2 = noUnnecessaryArraySomeFalse.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', [makeArrowFalse()]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('create returns new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArraySomeFalse.create(context)
      const visitor2 = noUnnecessaryArraySomeFalse.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArraySomeFalse.meta
      const meta2 = noUnnecessaryArraySomeFalse.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArraySomeFalse).toBeDefined()
      expect(typeof noUnnecessaryArraySomeFalse.create).toBe('function')
      expect(typeof noUnnecessaryArraySomeFalse.meta).toBe('object')
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      // valid — different method
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFalse()]))
      // invalid — should report
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()]))
      // valid — returns true
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BooleanLiteral', value: true },
      }]))
      // invalid — should report
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()]))
      // valid — no args
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', []))
      expect(reports.length).toBe(2)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'list' }, 'some', [makeArrowFalse()]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
        },
        arguments: [makeArrowFalse()],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'some' },
          computed: true,
        },
        arguments: [makeArrowFalse()],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()], 10, 4, 10, 35))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('visitor accumulates correctly across many calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      // 3 reports
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [makeArrowFalse()]))
      // 2 non-reports
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', [makeArrowFalse()]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', []))
      expect(reports.length).toBe(3)
    })

    test('does not report for function with 0 params and block body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [{
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: { type: 'BooleanLiteral', value: false } }] },
      }]))
      expect(reports.length).toBe(0)
    })

    test('handles node with range property — still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
        },
        arguments: [makeArrowFalse()],
        loc: makeLoc(1, 0, 1, 25),
        range: [0, 25],
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when arguments is missing on CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when body type is Literal with value false instead of BooleanLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArraySomeFalse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', [{
        type: 'ArrowFunctionExpression',
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'Literal', value: false },
      }]))
      expect(reports.length).toBe(0)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayFindIndexLiteral } from '../../../../src/rules/patterns/no-unnecessary-array-find-index-literal.js'
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
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeId(name: string): unknown {
  return { type: 'Identifier', name }
}

function makeArrowFindIndex(paramName: string, body: unknown): unknown {
  return {
    type: 'ArrowFunctionExpression',
    params: [makeId(paramName)],
    body,
  }
}

function makeFuncExprFindIndex(paramName: string, body: unknown): unknown {
  return {
    type: 'FunctionExpression',
    id: null,
    params: [makeId(paramName)],
    body,
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-find-index-literal rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayFindIndexLiteral.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayFindIndexLiteral.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayFindIndexLiteral.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayFindIndexLiteral.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayFindIndexLiteral.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning findIndex', () => {
      const desc = noUnnecessaryArrayFindIndexLiteral.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/findindex/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayFindIndexLiteral.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-find-index-literal.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayFindIndexLiteral.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayFindIndexLiteral).toBeDefined()
      expect(noUnnecessaryArrayFindIndexLiteral.meta).toBeDefined()
      expect(noUnnecessaryArrayFindIndexLiteral.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary findIndex', () => {
    test('reports for arr.findIndex(x => x === 5) — numeric literal, param on left', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.findIndex(x => 5 === x) — numeric literal, param on right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Literal', value: 5 },
        right: makeId('x'),
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.findIndex(x => x === "hello") — string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 'hello' },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.findIndex(x => "hello" === x) — string literal, reversed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Literal', value: 'hello' },
        right: makeId('x'),
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.findIndex(x => x == 42) — loose equality', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '==',
        left: makeId('x'),
        right: { type: 'Literal', value: 42 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.findIndex(x => 0 == x) — loose equality, reversed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '==',
        left: { type: 'Literal', value: 0 },
        right: makeId('x'),
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.findIndex(item => item === "test") — different param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('item', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('item'),
        right: { type: 'Literal', value: 'test' },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.findIndex(el => "world" === el) — yet another param name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('el', {
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Literal', value: 'world' },
        right: makeId('el'),
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })

    test('reports with block body: arr.findIndex(x => { return x === 5 })', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BlockStatement',
        body: [{
          type: 'ReturnStatement',
          argument: {
            type: 'BinaryExpression',
            operator: '===',
            left: makeId('x'),
            right: { type: 'Literal', value: 5 },
          },
        }],
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })

    test('reports with block body reversed: arr.findIndex(x => { return 5 === x })', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BlockStatement',
        body: [{
          type: 'ReturnStatement',
          argument: {
            type: 'BinaryExpression',
            operator: '===',
            left: { type: 'Literal', value: 5 },
            right: makeId('x'),
          },
        }],
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })

    test('reports with block body string literal: arr.findIndex(x => { return x === "hi" })', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BlockStatement',
        body: [{
          type: 'ReturnStatement',
          argument: {
            type: 'BinaryExpression',
            operator: '===',
            left: makeId('x'),
            right: { type: 'Literal', value: 'hi' },
          },
        }],
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })

    test('reports with block body loose equality: arr.findIndex(x => { return x == 10 })', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BlockStatement',
        body: [{
          type: 'ReturnStatement',
          argument: {
            type: 'BinaryExpression',
            operator: '==',
            left: makeId('x'),
            right: { type: 'Literal', value: 10 },
          },
        }],
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })

    test('reports with FunctionExpression: arr.findIndex(function(x) { return x === 5 })', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeFuncExprFindIndex('x', {
        type: 'BlockStatement',
        body: [{
          type: 'ReturnStatement',
          argument: {
            type: 'BinaryExpression',
            operator: '===',
            left: makeId('x'),
            right: { type: 'Literal', value: 5 },
          },
        }],
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })

    test('reports with FunctionExpression expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = {
        type: 'FunctionExpression',
        id: null,
        params: [makeId('x')],
        body: {
          type: 'BinaryExpression',
          operator: '===',
          left: makeId('x'),
          right: { type: 'Literal', value: 3 },
        },
      }
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions findIndex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports[0].message).toMatch(/findIndex/)
    })

    test('report message mentions indexOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports[0].message).toMatch(/indexOf/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports[0].message).toBe(
        'Array.prototype.findIndex() with a literal comparison can be replaced with indexOf().',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      const node = makeCallNode(makeId('arr'), 'findIndex', [arg])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg1 = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      const arg2 = makeArrowFindIndex('y', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('y'),
        right: { type: 'Literal', value: 'hello' },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg1]))
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg2]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg1 = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      const arg2 = makeArrowFindIndex('y', {
        type: 'BinaryExpression',
        operator: '==',
        left: { type: 'Literal', value: 'test' },
        right: makeId('y'),
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg1]))
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg2]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for arr.findIndex(x => x === 0) — zero numeric literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 0 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.findIndex(x => x === "") — empty string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: '' },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.findIndex(x => x === -1) — negative numeric literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: -1 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.findIndex(e => e == "long string here") — loose equality with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('e', {
        type: 'BinaryExpression',
        operator: '==',
        left: makeId('e'),
        right: { type: 'Literal', value: 'long string here' },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for arr.findIndex(x => x === 3.14) — float numeric literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 3.14 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.findIndex(v => v === "a") — single char string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('v', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('v'),
        right: { type: 'Literal', value: 'a' },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.findIndex(x => x === y) — variable, not literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: makeId('y'),
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(x => x > 5) — not === or ==', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '>',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(x => x !== 5) — not === or ==', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '!==',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(x => x != 5) — not === or == with !=', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '!=',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.indexOf(5) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      visitor.CallExpression(makeCallNode(makeId('arr'), 'indexOf', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex((x, i) => x === 5) — two params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [makeId('x'), makeId('i')],
        body: {
          type: 'BinaryExpression',
          operator: '===',
          left: makeId('x'),
          right: { type: 'Literal', value: 5 },
        },
      }
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(() => x === 5) — zero params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: {
          type: 'BinaryExpression',
          operator: '===',
          left: makeId('x'),
          right: { type: 'Literal', value: 5 },
        },
      }
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(x => x === true) — BooleanLiteral, not Numeric/String', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'BooleanLiteral', value: true },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(x => x === null) — NullLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'NullLiteral' },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(x => x === undefined) — Identifier "undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: makeId('undefined'),
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(x => { return x === 5; console.log(x) }) — block with 2 statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BlockStatement',
        body: [
          {
            type: 'ReturnStatement',
            argument: {
              type: 'BinaryExpression',
              operator: '===',
              left: makeId('x'),
              right: { type: 'Literal', value: 5 },
            },
          },
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: makeId('console'),
              arguments: [],
            },
          },
        ],
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(x => x === x) — both sides are param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: makeId('x'),
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(x => y === 5) — neither side matches param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('y'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report when param is not Identifier (destructuring)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = {
        type: 'ArrowFunctionExpression',
        params: [{ type: 'ObjectPattern', properties: [] }],
        body: {
          type: 'BinaryExpression',
          operator: '===',
          left: makeId('x'),
          right: { type: 'Literal', value: 5 },
        },
      }
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a function (string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [{ type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a function (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [makeId('fn')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(x => x === 5, y) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg, makeId('y')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(x => x === 5) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'map', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(x => x === 5) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'filter', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find(x => x === 5) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'find', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeId('arr'),
          property: { type: 'Identifier', name: 'findIndex' },
          computed: true,
        },
        arguments: [arg],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeId('arr'),
          property: { type: 'Literal', value: 'findIndex' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(x => x + 1) — body is not BinaryExpression with ===', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '+',
        left: makeId('x'),
        right: { type: 'Literal', value: 1 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for block body with no return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BlockStatement',
        body: [{
          type: 'ExpressionStatement',
          expression: {
            type: 'BinaryExpression',
            operator: '===',
            left: makeId('x'),
            right: { type: 'Literal', value: 5 },
          },
        }],
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for block body with return but no argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BlockStatement',
        body: [{
          type: 'ReturnStatement',
          argument: null,
        }],
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(x => x === obj.prop) — MemberExpression right side', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: {
          type: 'MemberExpression',
          object: makeId('obj'),
          property: makeId('prop'),
        },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(x => x === arr2[0]) — no literal on right', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: {
          type: 'MemberExpression',
          object: makeId('arr2'),
          property: { type: 'Literal', value: 0 },
          computed: true,
        },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(x => x >= 5) — greater-than-or-equal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '>=',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(x => x < 5) — less-than', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '<',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.findIndex(x => x <= 5) — less-than-or-equal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '<=',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "findindex" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findindex', [arg]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayFindIndexLiteral.create(ctx1)
      const visitor2 = noUnnecessaryArrayFindIndexLiteral.create(ctx2)
      const arg1 = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      const arg2 = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '>',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor1.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg1]))
      visitor2.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg2]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed valid/invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const validArg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '>',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      const invalidArg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [invalidArg]))
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [validArg]))
      visitor.CallExpression(makeCallNode(makeId('arr'), 'map', [invalidArg]))
      expect(reports.length).toBe(1)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeId('arr'),
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [arg],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeId('arr'),
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [arg],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const invalidArg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      const validArg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '>',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [validArg]))
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [invalidArg]))
      visitor.CallExpression(makeCallNode(makeId('arr'), 'map', [invalidArg]))
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [invalidArg]))
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [validArg]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayFindIndexLiteral.create(context)
      const visitor2 = noUnnecessaryArrayFindIndexLiteral.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayFindIndexLiteral.meta
      const meta2 = noUnnecessaryArrayFindIndexLiteral.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeId('arr'),
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [arg],
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
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeId('arr'),
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [arg],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeId('arr'),
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [arg],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      const node = makeCallNode(makeId('arr'), 'findIndex', [arg])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayFindIndexLiteral).toBeDefined()
      expect(typeof noUnnecessaryArrayFindIndexLiteral.create).toBe('function')
      expect(typeof noUnnecessaryArrayFindIndexLiteral.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeId('arr'),
          property: { type: 'Identifier', name: 'findIndex' },
          computed: false,
        },
        arguments: [arg],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg1 = makeArrowFindIndex('x', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('x'),
        right: { type: 'Literal', value: 5 },
      })
      const arg2 = makeArrowFindIndex('y', {
        type: 'BinaryExpression',
        operator: '===',
        left: makeId('y'),
        right: { type: 'Literal', value: 'hello' },
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg1]))
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg2]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports with block body loose equality reversed: arr.findIndex(x => { return "test" == x })', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFindIndexLiteral.create(context)
      const arg = makeArrowFindIndex('x', {
        type: 'BlockStatement',
        body: [{
          type: 'ReturnStatement',
          argument: {
            type: 'BinaryExpression',
            operator: '==',
            left: { type: 'Literal', value: 'test' },
            right: makeId('x'),
          },
        }],
      })
      visitor.CallExpression(makeCallNode(makeId('arr'), 'findIndex', [arg]))
      expect(reports.length).toBe(1)
    })
  })
})

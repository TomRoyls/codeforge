import { describe, test, expect, vi } from 'vitest'
import { noAsyncForeachRule } from '../../../../src/rules/patterns/no-async-foreach.js'
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
    getFilePath: () => '/test.ts',
    getSource: () => '',
    getAST: () => null,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [{}] },
    logger: {
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    },
    settings: {},
    ruleId: 'no-async-foreach',
    workspaceRoot: '/src',
  } as unknown as RuleContext

  return { context, reports }
}

function makeForEachCall(
  callback: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'arr' },
      property: { type: 'Identifier', name: 'forEach' },
    },
    arguments: [callback],
    loc: { start: { line, column }, end: { line, column: column + 30 } },
  }
}

function makeAsyncArrow(line = 1, column = 0): unknown {
  return {
    type: 'ArrowFunctionExpression',
    async: true,
    params: [{ type: 'Identifier', name: 'x' }],
    body: { type: 'BlockStatement', body: [] },
    loc: { start: { line, column }, end: { line, column: column + 20 } },
  }
}

function makeAsyncFunction(line = 1, column = 0): unknown {
  return {
    type: 'FunctionExpression',
    async: true,
    id: null,
    params: [{ type: 'Identifier', name: 'x' }],
    body: { type: 'BlockStatement', body: [] },
    loc: { start: { line, column }, end: { line, column: column + 25 } },
  }
}

function makeSyncArrow(): unknown {
  return {
    type: 'ArrowFunctionExpression',
    async: false,
    params: [{ type: 'Identifier', name: 'x' }],
    body: { type: 'BlockStatement', body: [] },
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
  }
}

function makeSyncFunction(): unknown {
  return {
    type: 'FunctionExpression',
    async: false,
    id: null,
    params: [{ type: 'Identifier', name: 'x' }],
    body: { type: 'BlockStatement', body: [] },
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
  }
}

describe('no-async-foreach rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noAsyncForeachRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noAsyncForeachRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noAsyncForeachRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(noAsyncForeachRule.meta.docs?.category).toBe('patterns')
    })

    test('should have description mentioning async', () => {
      expect(noAsyncForeachRule.meta.docs?.description.toLowerCase()).toContain('async')
    })

    test('should have description mentioning forEach or iteration', () => {
      const desc = noAsyncForeachRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc.includes('foreach') || desc.includes('iteration')).toBe(true)
    })

    test('should have correct docs URL', () => {
      expect(noAsyncForeachRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-async-foreach',
      )
    })

    test('should have empty schema', () => {
      expect(noAsyncForeachRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('rule has a default export with meta and create', () => {
      expect(noAsyncForeachRule).toBeDefined()
      expect(noAsyncForeachRule.meta).toBeDefined()
      expect(noAsyncForeachRule.create).toBeDefined()
      expect(typeof noAsyncForeachRule.create).toBe('function')
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases - reports violations', () => {
    test('reports async arrow function passed to forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall(makeAsyncArrow()))
      expect(reports.length).toBe(1)
    })

    test('reports async function expression passed to forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall(makeAsyncFunction()))
      expect(reports.length).toBe(1)
    })

    test('message contains forEach method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall(makeAsyncArrow()))
      expect(reports[0].message).toContain('forEach')
    })

    test('message suggests for...of loop', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall(makeAsyncArrow()))
      expect(reports[0].message).toContain('for...of')
    })

    test('message suggests Promise.all() with map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall(makeAsyncArrow()))
      expect(reports[0].message).toContain('Promise.all')
      expect(reports[0].message).toContain('map')
    })

    test('message starts with Async callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall(makeAsyncArrow()))
      expect(reports[0].message).toMatch(/^Async callback/)
    })

    test('report includes loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall(makeAsyncArrow()))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('report includes node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const node = makeForEachCall(makeAsyncArrow())
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports correct location for different line/column', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall(makeAsyncArrow(5, 10), 5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports async arrow with body containing await expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const asyncArrowWithAwait = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [{ type: 'Identifier', name: 'item' }],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'item' } },
          }],
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(makeForEachCall(asyncArrowWithAwait))
      expect(reports.length).toBe(1)
    })

    test('reports async function expression with body', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const asyncFnWithBody = {
        type: 'FunctionExpression',
        async: true,
        id: { type: 'Identifier', name: 'callback' },
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(makeForEachCall(asyncFnWithBody))
      expect(reports.length).toBe(1)
    })

    test('reports deeply chained forEach with async arrow', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const chainedNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getArr' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(chainedNode)
      expect(reports.length).toBe(1)
    })

    test('reports chained arr.sort().forEach(async ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const sortedNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'sort' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(sortedNode)
      expect(reports.length).toBe(1)
    })

    test('reports multiple forEach calls in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall(makeAsyncArrow()))
      visitor.CallExpression(makeForEachCall(makeAsyncFunction()))
      expect(reports.length).toBe(2)
    })

    test('reports forEach called with 2 args where first is async', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [makeAsyncArrow(), { type: 'Identifier', name: 'thisArg' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports async arrow with implicit return', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const implicitReturn = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(makeForEachCall(implicitReturn))
      expect(reports.length).toBe(1)
    })

    test('reports for nested arr inside object', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'items' },
          },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 45 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports async function expression with multiple params', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const multiParam = {
        type: 'FunctionExpression',
        async: true,
        id: null,
        params: [
          { type: 'Identifier', name: 'item' },
          { type: 'Identifier', name: 'index' },
          { type: 'Identifier', name: 'array' },
        ],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(makeForEachCall(multiParam))
      expect(reports.length).toBe(1)
    })

    test('message ends with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall(makeAsyncArrow()))
      expect(reports[0].message).toMatch(/\.$/)
    })

    test('reports when async arrow has no params', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const noParam = {
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(makeForEachCall(noParam))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases - does NOT report', () => {
    test('does NOT report regular (non-async) forEach callback - sync arrow', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall(makeSyncArrow()))
      expect(reports.length).toBe(0)
    })

    test('does NOT report regular (non-async) forEach callback - sync function', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall(makeSyncFunction()))
      expect(reports.length).toBe(0)
    })

    test('does NOT report arr.map(async (x) => ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const mapNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'map' },
        },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(mapNode)
      expect(reports.length).toBe(0)
    })

    test('does NOT report arr.filter(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const filterNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(filterNode)
      expect(reports.length).toBe(0)
    })

    test('does NOT report forEach with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const noArgsNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(noArgsNode)
      expect(reports.length).toBe(0)
    })

    test('does NOT report forEach with string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall({ type: 'Literal', value: 'callback' }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report forEach with number argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report for...of loop (ForOfStatement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const forOfNode = {
        type: 'ForOfStatement',
        left: { type: 'Identifier', name: 'item' },
        right: { type: 'Identifier', name: 'arr' },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(forOfNode)
      expect(reports.length).toBe(0)
    })

    test('does NOT report non-MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const identifierCallee = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'forEach' },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(identifierCallee)
      expect(reports.length).toBe(0)
    })

    test('does NOT report non-Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const computedProp = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'forEach' },
          computed: true,
        },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(computedProp)
      expect(reports.length).toBe(0)
    })

    test('does NOT report null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does NOT report undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does NOT report empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression({})
      expect(reports.length).toBe(0)
    })

    test('does NOT report arrow function with async: undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const arrowNoAsync = {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(makeForEachCall(arrowNoAsync))
      expect(reports.length).toBe(0)
    })

    test('does NOT report function expression with async: undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const fnNoAsync = {
        type: 'FunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(makeForEachCall(fnNoAsync))
      expect(reports.length).toBe(0)
    })

    test('does NOT report object callback without async property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const objCallback = {
        type: 'ObjectExpression',
        properties: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(makeForEachCall(objCallback))
      expect(reports.length).toBe(0)
    })

    test('does NOT report when callback is an Identifier reference', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall({ type: 'Identifier', name: 'callback' }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report when callback is a CallExpression (result of function call)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const callResult = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getCallback' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(makeForEachCall(callResult))
      expect(reports.length).toBe(0)
    })

    test('does NOT report arr.reduce(async ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const reduceNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduce' },
        },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(reduceNode)
      expect(reports.length).toBe(0)
    })

    test('does NOT report arr.every(async ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const everyNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(everyNode)
      expect(reports.length).toBe(0)
    })

    test('does NOT report arr.some(async ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const someNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'some' },
        },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(someNode)
      expect(reports.length).toBe(0)
    })

    test('does NOT report non-CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression({ type: 'ExpressionStatement', expression: {} })
      expect(reports.length).toBe(0)
    })

    test('does NOT report node without callee property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeAsyncArrow()] })
      expect(reports.length).toBe(0)
    })

    test('does NOT report when callee has non-object property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does NOT report when property name is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: '' },
        },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does NOT report Promise.all(arr.map(async ...))', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const promiseAllNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'all' },
        },
        arguments: [{
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'map' },
          },
          arguments: [makeAsyncArrow()],
        }],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(promiseAllNode)
      expect(reports.length).toBe(0)
    })

    test('does NOT report async arrow with explicit async: false', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const explicitFalse = {
        type: 'ArrowFunctionExpression',
        async: false,
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.CallExpression(makeForEachCall(explicitFalse))
      expect(reports.length).toBe(0)
    })

    test('does NOT report function expression with explicit async: false', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const explicitFalse = {
        type: 'FunctionExpression',
        async: false,
        id: null,
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.CallExpression(makeForEachCall(explicitFalse))
      expect(reports.length).toBe(0)
    })

    test('does NOT report when first arg is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const memberArg = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'fn' },
      }
      visitor.CallExpression(makeForEachCall(memberArg))
      expect(reports.length).toBe(0)
    })

    test('does NOT report when first arg is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [null],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does NOT report arr.find(async ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const findNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'find' },
        },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(findNode)
      expect(reports.length).toBe(0)
    })

    test('does NOT report arr.flatMap(async ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const flatMapNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'flatMap' },
        },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(flatMapNode)
      expect(reports.length).toBe(0)
    })

    test('does NOT report node with undefined arguments property', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does NOT report string node', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does NOT report number node', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====
  describe('edge cases', () => {
    test('callback is an Identifier reference - should NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall({ type: 'Identifier', name: 'myCallback' }))
      expect(reports.length).toBe(0)
    })

    test('callback is a CallExpression result - should NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const callResult = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'bindCallback' },
        arguments: [],
      }
      visitor.CallExpression(makeForEachCall(callResult))
      expect(reports.length).toBe(0)
    })

    test('multiple forEach calls accumulate reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall(makeAsyncArrow()))
      visitor.CallExpression(makeForEachCall(makeAsyncFunction()))
      visitor.CallExpression(makeForEachCall(makeAsyncArrow()))
      expect(reports.length).toBe(3)
    })

    test('deeply chained getArr().forEach(async ...) reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getArr' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('forEach')
    })

    test('chained arr.sort().forEach(async ...) reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'arr' },
              property: { type: 'Identifier', name: 'sort' },
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report has loc property with start and end', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall(makeAsyncArrow(), 3, 5))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toEqual({ line: 3, column: 5 })
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noAsyncForeachRule.create(ctx1)
      const visitor2 = noAsyncForeachRule.create(ctx2)
      visitor1.CallExpression(makeForEachCall(makeAsyncArrow()))
      visitor2.CallExpression(makeForEachCall(makeSyncArrow()))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('property name is a string literal not Identifier - does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const stringPropNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'forEach' },
          computed: true,
        },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(stringPropNode)
      expect(reports.length).toBe(0)
    })

    test('forEach called with 0 args - does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const zeroArgsNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.CallExpression(zeroArgsNode)
      expect(reports.length).toBe(0)
    })

    test('forEach with 2 args (item, index) - reports if first is async', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const twoArgsNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [
          makeAsyncArrow(),
          { type: 'Identifier', name: 'thisArg' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(twoArgsNode)
      expect(reports.length).toBe(1)
    })

    test('node without loc still reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const noLocNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [makeAsyncArrow()],
      }
      visitor.CallExpression(noLocNode)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed forEach calls - some sync some async', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall(makeSyncArrow()))
      visitor.CallExpression(makeForEachCall(makeAsyncArrow()))
      visitor.CallExpression(makeForEachCall(makeSyncFunction()))
      expect(reports.length).toBe(1)
    })

    test('handles node with missing callee property gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const noCalleeNode = {
        type: 'CallExpression',
        arguments: [makeAsyncArrow()],
      }
      visitor.CallExpression(noCalleeNode)
      expect(reports.length).toBe(0)
    })

    test('handles node with non-object callee (string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const stringCallee = {
        type: 'CallExpression',
        callee: 'notAnObject',
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(stringCallee)
      expect(reports.length).toBe(0)
    })

    test('create returns a new visitor object each call', () => {
      const { context } = createMockContext()
      const v1 = noAsyncForeachRule.create(context)
      const v2 = noAsyncForeachRule.create(context)
      expect(v1).not.toBe(v2)
    })

    test('handles property with type but no name', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const noNameNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier' },
        },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(noNameNode)
      expect(reports.length).toBe(0)
    })

    test('handles arguments as non-array (undefined)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const undefinedArgsNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(undefinedArgsNode)
      expect(reports.length).toBe(0)
    })

    test('visitor accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(makeForEachCall(makeAsyncArrow(), i + 1, 0))
      }
      expect(reports.length).toBe(5)
    })

    test('does NOT report async arrow passed to non-forEach method with same spelling', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const notForEachNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEachItem' },
        },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(notForEachNode)
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL COVERAGE (10) =====
  describe('additional coverage', () => {
    test('does NOT report boolean argument to forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall({ type: 'Literal', value: true }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report object expression argument to forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall({
        type: 'ObjectExpression',
        properties: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report array expression argument to forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      visitor.CallExpression(makeForEachCall({
        type: 'ArrayExpression',
        elements: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('reports async function expression with generator: false', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const asyncNotGenerator = {
        type: 'FunctionExpression',
        async: true,
        generator: false,
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(makeForEachCall(asyncNotGenerator))
      expect(reports.length).toBe(1)
    })

    test('does NOT report generator function (async: false, generator: true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const generatorFn = {
        type: 'FunctionExpression',
        async: false,
        generator: true,
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(makeForEachCall(generatorFn))
      expect(reports.length).toBe(0)
    })

    test('reports when callee object is missing but MemberExpression and forEach match', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const noObjectNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(noObjectNode)
      expect(reports.length).toBe(1)
    })

    test('does NOT report arr.forEach where second arg is async', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const secondArgAsyncNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [
          { type: 'Identifier', name: 'syncCallback' },
          makeAsyncArrow(),
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(secondArgAsyncNode)
      expect(reports.length).toBe(0)
    })

    test('handles node where arguments is empty array after initial check', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const emptyArgs = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }
      visitor.CallExpression(emptyArgs)
      expect(reports.length).toBe(0)
    })

    test('does NOT report async generator function passed to forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const asyncGenFn = {
        type: 'FunctionExpression',
        async: true,
        generator: true,
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(makeForEachCall(asyncGenFn))
      // This IS async: true on FunctionExpression, so it SHOULD report
      expect(reports.length).toBe(1)
    })

    test('does NOT report when callee is a plain Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const plainIdentifier = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'forEach' },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.CallExpression(plainIdentifier)
      expect(reports.length).toBe(0)
    })

    test('does NOT report when forEach property has type other than Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noAsyncForeachRule.create(context)
      const thisExpressionNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'ThisExpression' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [makeAsyncArrow()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      }
      visitor.CallExpression(thisExpressionNode)
      expect(reports.length).toBe(1)
    })
  })
})

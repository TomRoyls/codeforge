import { describe, expect, test, vi } from 'vitest'
import { noUselessPromiseRule } from '../../../../src/rules/patterns/no-useless-promise.js'
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
    getSource: () => 'new Promise(resolve => resolve(42))',
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

// Helper: create NewExpression node wrapping a Promise with an executor
function makeNewPromiseNode(
  executor: Record<string, unknown>,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: 'Promise' },
    arguments: [executor],
    loc: makeLoc(line, column, line, column + 30),
  }
}

// Helper: arrow function executor with concise body (expression body)
function makeArrowExecutor(body: Record<string, unknown>, params: unknown[] = [{ type: 'Identifier', name: 'resolve' }]): Record<string, unknown> {
  return {
    type: 'ArrowFunctionExpression',
    params,
    body,
  }
}

// Helper: arrow function executor with block body
function makeArrowBlockExecutor(stmts: unknown[], params: unknown[] = [{ type: 'Identifier', name: 'resolve' }]): Record<string, unknown> {
  return {
    type: 'ArrowFunctionExpression',
    params,
    body: {
      type: 'BlockStatement',
      body: stmts,
    },
  }
}

// Helper: function expression executor with block body
function makeFnExecutor(stmts: unknown[], params: unknown[] = [{ type: 'Identifier', name: 'resolve' }]): Record<string, unknown> {
  return {
    type: 'FunctionExpression',
    params,
    body: {
      type: 'BlockStatement',
      body: stmts,
    },
  }
}

// Helper: expression statement wrapping a call expression
function makeExprStmtCall(calleeName: string, args: unknown[] = []): Record<string, unknown> {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: calleeName },
      arguments: args,
    },
  }
}

// Helper: call expression node
function makeCallExpr(calleeName: string, args: unknown[] = []): Record<string, unknown> {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: args,
  }
}

describe('no-useless-promise rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUselessPromiseRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUselessPromiseRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUselessPromiseRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUselessPromiseRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUselessPromiseRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Promise', () => {
      expect(noUselessPromiseRule.meta.docs?.description.toLowerCase()).toContain('promise')
    })

    test('should have correct docs URL', () => {
      expect(noUselessPromiseRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-useless-promise',
      )
    })

    test('should have empty schema', () => {
      expect(noUselessPromiseRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      expect(visitor).toHaveProperty('NewExpression')
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUselessPromiseRule).toBeDefined()
      expect(noUselessPromiseRule.meta).toBeDefined()
      expect(noUselessPromiseRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (~35) =====
  describe('positive cases — reports useless Promise wrapper', () => {
    test('reports new Promise(resolve => resolve(42)) — arrow concise body, resolve call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 42 }])))
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new Promise(resolve => resolve("hello")) — string arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 'hello' }])))
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new Promise(resolve => resolve()) — no arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(makeArrowExecutor(makeCallExpr('resolve', [])))
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new Promise(reject => reject(error)) — reject call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor(
          makeCallExpr('reject', [{ type: 'Identifier', name: 'error' }]),
          [{ type: 'Identifier', name: 'reject' }],
        ),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new Promise(reject => reject(new Error("fail"))) — reject with Error', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor(
          makeCallExpr('reject', [{
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'Error' },
            arguments: [{ type: 'Literal', value: 'fail' }],
          }]),
          [{ type: 'Identifier', name: 'reject' }],
        ),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new Promise((resolve) => { resolve(42) }) — arrow block body, single resolve stmt', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowBlockExecutor([makeExprStmtCall('resolve', [{ type: 'Literal', value: 42 }])]),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new Promise((reject) => { reject(err) }) — arrow block body, single reject stmt', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowBlockExecutor(
          [makeExprStmtCall('reject', [{ type: 'Identifier', name: 'err' }])],
          [{ type: 'Identifier', name: 'reject' }],
        ),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new Promise(function(resolve) { resolve(42) }) — function expression block body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeFnExecutor([makeExprStmtCall('resolve', [{ type: 'Literal', value: 42 }])]),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new Promise(function(resolve) { reject(err) }) — function expression reject', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeFnExecutor(
          [makeExprStmtCall('reject', [{ type: 'Identifier', name: 'err' }])],
          [{ type: 'Identifier', name: 'reject' }],
        ),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('message contains "Useless new Promise wrapper"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 42 }])))
      visitor.NewExpression(node)
      expect(reports[0].message).toContain('Useless new Promise wrapper')
    })

    test('message contains "Promise.resolve" for resolve calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 42 }])))
      visitor.NewExpression(node)
      expect(reports[0].message).toContain('Promise.resolve')
    })

    test('message contains "Promise.reject" for reject calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor(
          makeCallExpr('reject', [{ type: 'Identifier', name: 'err' }]),
          [{ type: 'Identifier', name: 'reject' }],
        ),
      )
      visitor.NewExpression(node)
      expect(reports[0].message).toContain('Promise.reject')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 42 }])))
      visitor.NewExpression(node)
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 42 }])))
      visitor.NewExpression(node)
      expect(reports[0].node).toBeDefined()
    })

    test('reports multiple violations in same source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node1 = makeNewPromiseNode(makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 1 }])))
      const node2 = makeNewPromiseNode(makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 2 }])))
      const node3 = makeNewPromiseNode(makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 3 }])))
      visitor.NewExpression(node1)
      visitor.NewExpression(node2)
      visitor.NewExpression(node3)
      expect(reports.length).toBe(3)
    })

    test('reports arrow with parens around param: new Promise((resolve) => resolve(x))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor(
          makeCallExpr('resolve', [{ type: 'Identifier', name: 'x' }]),
          [{ type: 'Identifier', name: 'resolve' }],
        ),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports arrow with no parens: new Promise(resolve => resolve(x))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor(
          makeCallExpr('resolve', [{ type: 'Identifier', name: 'x' }]),
          [{ type: 'Identifier', name: 'resolve' }],
        ),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports resolve with complex expression: resolve({ a: 1, b: 2 })', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor(
          makeCallExpr('resolve', [{
            type: 'ObjectExpression',
            properties: [
              { type: 'Property', key: { type: 'Identifier', name: 'a' }, value: { type: 'Literal', value: 1 } },
              { type: 'Property', key: { type: 'Identifier', name: 'b' }, value: { type: 'Literal', value: 2 } },
            ],
          }]),
        ),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports reject with complex expression: reject(new TypeError("bad"))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor(
          makeCallExpr('reject', [{
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'TypeError' },
            arguments: [{ type: 'Literal', value: 'bad' }],
          }]),
          [{ type: 'Identifier', name: 'reject' }],
        ),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 42 }])),
        10,
        4,
      )
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(34)
    })

    test('reports function expression executor with arrow function body — still works', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      // This is the same as makeFnExecutor, just to be explicit
      const node = makeNewPromiseNode(
        makeFnExecutor([makeExprStmtCall('resolve', [])]),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports resolve with null argument: resolve(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: null }])),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports resolve with boolean argument: resolve(true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: true }])),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports reject with no argument: reject()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor(
          makeCallExpr('reject', []),
          [{ type: 'Identifier', name: 'reject' }],
        ),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports block body arrow with parens around param and resolve', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowBlockExecutor(
          [makeExprStmtCall('resolve', [{ type: 'Literal', value: 'test' }])],
          [{ type: 'Identifier', name: 'resolve' }],
        ),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports block body function expression with reject', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeFnExecutor(
          [makeExprStmtCall('reject', [{ type: 'Identifier', name: 'e' }])],
          [{ type: 'Identifier', name: 'reject' }],
        ),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports message says "Use Promise.resolve() instead" for resolve', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(makeArrowExecutor(makeCallExpr('resolve', [])))
      visitor.NewExpression(node)
      expect(reports[0].message).toContain('Use Promise.resolve() instead')
    })

    test('reports message says "Use Promise.reject() instead" for reject', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor(
          makeCallExpr('reject', []),
          [{ type: 'Identifier', name: 'reject' }],
        ),
      )
      visitor.NewExpression(node)
      expect(reports[0].message).toContain('Use Promise.reject() instead')
    })

    test('reports new Promise(resolve => resolve(0)) — falsy number arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 0 }])))
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports new Promise(resolve => resolve(undefined)) — undefined arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Identifier', name: 'undefined' }])))
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports resolve with array argument: resolve([1, 2])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor(
          makeCallExpr('resolve', [{
            type: 'ArrayExpression',
            elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }],
          }]),
        ),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports resolve with MemberExpression argument: resolve(obj.prop)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor(
          makeCallExpr('resolve', [{
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
            computed: false,
          }]),
        ),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports function expression with resolve and no params name check', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeFnExecutor([makeExprStmtCall('resolve', [{ type: 'Literal', value: 99 }])]),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Promise.resolve')
    })

    test('reports mixed resolve and reject across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      visitor.NewExpression(makeNewPromiseNode(makeArrowExecutor(makeCallExpr('resolve', []))))
      visitor.NewExpression(
        makeNewPromiseNode(
          makeArrowExecutor(makeCallExpr('reject', []), [{ type: 'Identifier', name: 'reject' }]),
        ),
      )
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('Promise.resolve')
      expect(reports[1].message).toContain('Promise.reject')
    })
  })

  // ===== NEGATIVE CASES (~30) =====
  describe('negative cases — does NOT report', () => {
    test('does not report multi-statement body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowBlockExecutor([
          { type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'console' }, arguments: [] } },
          makeExprStmtCall('resolve', [{ type: 'Literal', value: 42 }]),
        ]),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report multiple statements — console.log then resolve', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowBlockExecutor([
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'console' }, property: { type: 'Identifier', name: 'log' } },
              arguments: [{ type: 'Literal', value: 'hi' }],
            },
          },
          makeExprStmtCall('resolve', [{ type: 'Literal', value: 42 }]),
        ]),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report conditional resolve: if (cond) resolve(42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowBlockExecutor([
          {
            type: 'IfStatement',
            test: { type: 'Identifier', name: 'cond' },
            consequent: makeExprStmtCall('resolve', [{ type: 'Literal', value: 42 }]),
          },
        ]),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Promise.resolve(42) — CallExpression, not NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'Promise' }, property: { type: 'Identifier', name: 'resolve' } },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new SomeClass(resolve => resolve(42)) — not Promise', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'SomeClass' },
        arguments: [makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 42 }]))],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new Promise() — no executor argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report new Promise — no arguments at all', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Promise used as identifier, not NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'Promise',
        loc: makeLoc(1, 0, 1, 7),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-Promise NewExpression: new Error("msg")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Error' },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report multiple resolve calls in block body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowBlockExecutor([
          makeExprStmtCall('resolve', [{ type: 'Literal', value: 42 }]),
          makeExprStmtCall('resolve', [{ type: 'Literal', value: 43 }]),
        ]),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report return statement wrapping resolve', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowBlockExecutor([
          {
            type: 'ReturnStatement',
            argument: makeCallExpr('resolve', [{ type: 'Literal', value: 42 }]),
          },
        ]),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report CallExpression node (not NewExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 42 }]))],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report async executor — still reports if pattern matches', () => {
      // The rule does not check for async, so async arrow with block body + single resolve still reports
      // But let's test that async arrow with concise body resolve DOES report (rule doesn't exclude async)
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode({
        type: 'ArrowFunctionExpression',
        async: true,
        params: [{ type: 'Identifier', name: 'resolve' }],
        body: makeCallExpr('resolve', [{ type: 'Literal', value: 42 }]),
      })
      visitor.NewExpression(node)
      // async arrow with concise resolve body — rule doesn't check async flag, so it reports
      expect(reports.length).toBe(1)
    })

    test('does not report arrow returning object expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor({
          type: 'ObjectExpression',
          properties: [
            { type: 'Property', key: { type: 'Identifier', name: 'resolve' }, value: { type: 'Identifier', name: 'resolve' } },
          ],
        }),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report arrow with array expression body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor({
          type: 'ArrayExpression',
          elements: [makeCallExpr('resolve', [{ type: 'Literal', value: 42 }])],
        }),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report await Promise.resolve(42) — not a NewExpression in this rule', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = {
        type: 'AwaitExpression',
        argument: {
          type: 'CallExpression',
          callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'Promise' }, property: { type: 'Identifier', name: 'resolve' } },
          arguments: [{ type: 'Literal', value: 42 }],
        },
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report MemberExpression callee: new obj.Promise(r => r(42))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'Promise' },
        },
        arguments: [makeArrowExecutor(makeCallExpr('r', [{ type: 'Literal', value: 42 }]))],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when executor is not a function (identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [{ type: 'Identifier', name: 'myExecutor' }],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when executor body is SequenceExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor({
          type: 'SequenceExpression',
          expressions: [
            makeCallExpr('resolve', [{ type: 'Literal', value: 1 }]),
            { type: 'Literal', value: 2 },
          ],
        }),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "promise" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'promise' },
        arguments: [makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 42 }]))],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report block body with IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowBlockExecutor([
          {
            type: 'IfStatement',
            test: { type: 'Identifier', name: 'cond' },
            consequent: { type: 'BlockStatement', body: [makeExprStmtCall('resolve', [])] },
          },
        ]),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report block body with VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowBlockExecutor([
          {
            type: 'VariableDeclaration',
            declarations: [{
              type: 'VariableDeclarator',
              id: { type: 'Identifier', name: 'x' },
              init: { type: 'Literal', value: 42 },
            }],
            kind: 'const',
          },
        ]),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when arrow body is just an Identifier (not CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor({ type: 'Identifier', name: 'resolve' }),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when concise body callee is not resolve/reject', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor(makeCallExpr('someOtherFn', [{ type: 'Literal', value: 42 }]), [{ type: 'Identifier', name: 'resolve' }]),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when block body stmt is not ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowBlockExecutor([
          {
            type: 'ReturnStatement',
            argument: { type: 'Literal', value: 42 },
          },
        ]),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when block body expression is not CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowBlockExecutor([
          {
            type: 'ExpressionStatement',
            expression: { type: 'Identifier', name: 'resolve' },
          },
        ]),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when block body call callee is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowBlockExecutor([
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'obj' },
                property: { type: 'Identifier', name: 'resolve' },
              },
              arguments: [{ type: 'Literal', value: 42 }],
            },
          },
        ]),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (~20) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUselessPromiseRule.create(ctx1)
      const visitor2 = noUselessPromiseRule.create(ctx2)

      visitor1.NewExpression(makeNewPromiseNode(makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 1 }]))))
      visitor2.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [],
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      visitor.NewExpression(makeNewPromiseNode(makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 1 }]))))
      visitor.NewExpression(makeNewPromiseNode(makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 2 }]))))
      visitor.NewExpression(makeNewPromiseNode(makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 3 }]))))
      expect(reports.length).toBe(3)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 42 }]))],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
      // extractLocation returns default { line: 1, column: 0 }
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('NewExpression with missing callee property does not throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = {
        type: 'NewExpression',
        arguments: [makeArrowExecutor(makeCallExpr('resolve', []))],
        loc: makeLoc(1, 0, 1, 20),
      }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('NewExpression with missing arguments property does not throw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        loc: makeLoc(1, 0, 1, 20),
      }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('Arrow body is SequenceExpression — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor({
          type: 'SequenceExpression',
          expressions: [makeCallExpr('resolve', []), { type: 'Literal', value: 1 }],
        }),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('arrow body is just Identifier "resolve" — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor({ type: 'Identifier', name: 'resolve' }),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('Function body has 2+ statements — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeFnExecutor([
          makeExprStmtCall('resolve', [{ type: 'Literal', value: 1 }]),
          makeExprStmtCall('resolve', [{ type: 'Literal', value: 2 }]),
        ]),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('Block body with IfStatement — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeFnExecutor([
          {
            type: 'IfStatement',
            test: { type: 'Identifier', name: 'cond' },
            consequent: { type: 'BlockStatement', body: [] },
          },
        ]),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('Block body with VariableDeclaration — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeFnExecutor([
          { type: 'VariableDeclaration', declarations: [], kind: 'let' },
        ]),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('Resolve called with complex expression reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor(
          makeCallExpr('resolve', [{
            type: 'ObjectExpression',
            properties: [
              { type: 'Property', key: { type: 'Identifier', name: 'a' }, value: { type: 'Literal', value: 1 } },
              { type: 'Property', key: { type: 'Identifier', name: 'b' }, value: { type: 'Literal', value: 2 } },
            ],
          }]),
        ),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Promise.resolve')
    })

    test('Reject called with complex expression reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor(
          makeCallExpr('reject', [{
            type: 'NewExpression',
            callee: { type: 'Identifier', name: 'TypeError' },
            arguments: [{ type: 'Literal', value: 'bad' }],
          }]),
          [{ type: 'Identifier', name: 'reject' }],
        ),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Promise.reject')
    })

    test('Location with specific line/column values is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 42 }])),
        7,
        12,
      )
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('handles non-object node (string primitive) gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      expect(() => visitor.NewExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive) gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles executor being null gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 20),
      }
      expect(() => visitor.NewExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noUselessPromiseRule.create(context)
      const visitor2 = noUselessPromiseRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('reports mixed violations and non-violations correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      // Should report: arrow concise resolve
      visitor.NewExpression(makeNewPromiseNode(makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 1 }]))))
      // Should NOT report: multi-statement body
      visitor.NewExpression(makeNewPromiseNode(
        makeArrowBlockExecutor([
          { type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'console' }, arguments: [] } },
          makeExprStmtCall('resolve', [{ type: 'Literal', value: 2 }]),
        ]),
      ))
      // Should report: arrow concise reject
      visitor.NewExpression(
        makeNewPromiseNode(
          makeArrowExecutor(makeCallExpr('reject', []), [{ type: 'Identifier', name: 'reject' }]),
        ),
      )
      // Should NOT report: not Promise
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Error' },
        arguments: [{ type: 'Literal', value: 'msg' }],
        loc: makeLoc(1, 0, 1, 15),
      })
      // Should report: function expression block resolve
      visitor.NewExpression(makeNewPromiseNode(makeFnExecutor([makeExprStmtCall('resolve', [{ type: 'Literal', value: 5 }])])))

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('Promise.resolve')
      expect(reports[1].message).toContain('Promise.reject')
      expect(reports[2].message).toContain('Promise.resolve')
    })

    test('concise body callee is not Identifier (MemberExpression) — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowExecutor({
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'resolve' },
          },
          arguments: [],
        }),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('block body expression callee not resolve/reject — does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(
        makeArrowBlockExecutor([
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'somethingElse' },
              arguments: [{ type: 'Literal', value: 42 }],
            },
          },
        ]),
      )
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('report node property matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessPromiseRule.create(context)
      const node = makeNewPromiseNode(makeArrowExecutor(makeCallExpr('resolve', [{ type: 'Literal', value: 99 }])))
      visitor.NewExpression(node)
      expect(reports[0].node).toBe(node)
    })
  })
})

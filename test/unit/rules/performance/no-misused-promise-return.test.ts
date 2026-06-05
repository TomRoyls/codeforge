import { describe, expect, test, vi } from 'vitest'
import { noMisusedPromiseReturnRule } from '../../../../src/rules/performance/no-misused-promise-return.js'
import type { RuleContext, ReportDescriptor } from '../../../../src/plugins/types.js'

interface TestReport {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
}

function createMockContext(): { context: RuleContext; reports: TestReport[] } {
  const reports: TestReport[] = []

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
    getSource: () => 'async function foo() { return new Promise(() => {}); }',
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

function makePromiseNewExpr(loc?: ReturnType<typeof makeLoc>): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: 'Promise' },
    arguments: [],
    loc: loc ?? makeLoc(2, 11, 2, 30),
  }
}

function makeReturnWithNewPromise(parent: unknown, argLoc?: ReturnType<typeof makeLoc>): unknown {
  return {
    type: 'ReturnStatement',
    argument: makePromiseNewExpr(argLoc),
    parent: parent,
    loc: makeLoc(2, 2, 2, 31),
  }
}

function makeAsyncFunctionDecl(loc?: ReturnType<typeof makeLoc>): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'foo' },
    async: true,
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: loc ?? makeLoc(1, 0, 3, 1),
  }
}

function makeAsyncArrowFunction(loc?: ReturnType<typeof makeLoc>): unknown {
  return {
    type: 'ArrowFunctionExpression',
    async: true,
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: loc ?? makeLoc(1, 0, 3, 1),
  }
}

function makeAsyncFunctionExpr(loc?: ReturnType<typeof makeLoc>): unknown {
  return {
    type: 'FunctionExpression',
    id: null,
    async: true,
    params: [],
    body: { type: 'BlockStatement', body: [] },
    loc: loc ?? makeLoc(1, 0, 3, 1),
  }
}

describe('no-misused-promise-return rule', () => {

  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noMisusedPromiseReturnRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noMisusedPromiseReturnRule.meta.severity).toBe('warn')
    })

    test('should have correct category "performance"', () => {
      expect(noMisusedPromiseReturnRule.meta.docs?.category).toBe('performance')
    })

    test('should not be recommended', () => {
      expect(noMisusedPromiseReturnRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noMisusedPromiseReturnRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Promise and async', () => {
      const desc = noMisusedPromiseReturnRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/promise/)
      expect(desc).toMatch(/async/)
    })

    test('should have correct docs URL', () => {
      expect(noMisusedPromiseReturnRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-misused-promise-return',
      )
    })

    test('should have empty schema', () => {
      expect(noMisusedPromiseReturnRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with ReturnStatement', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      expect(visitor).toHaveProperty('ReturnStatement')
      expect(typeof visitor.ReturnStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noMisusedPromiseReturnRule).toBeDefined()
      expect(noMisusedPromiseReturnRule.meta).toBeDefined()
      expect(noMisusedPromiseReturnRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — ASYNC FUNCTION DECLARATION (7) =====
  describe('positive cases — async FunctionDeclaration', () => {
    test('reports return new Promise in async FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports.length).toBe(1)
    })

    test('report message is exact match', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports[0].message).toBe(
        'Avoid returning a new Promise from an async function. The function already returns a Promise.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports[0].node).toBeDefined()
    })

    test('report loc matches argument node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      const argLoc = makeLoc(5, 11, 5, 30)
      visitor.ReturnStatement(makeReturnWithNewPromise(parent, argLoc))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(11)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('report node is the NewExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      const reportedNode = reports[0].node as { type?: string; callee?: { name?: string } }
      expect(reportedNode.type).toBe('NewExpression')
      expect(reportedNode.callee?.name).toBe('Promise')
    })

    test('message contains "async function"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports[0].message.toLowerCase()).toContain('async function')
    })
  })

  // ===== POSITIVE CASES — ASYNC ARROW FUNCTION (4) =====
  describe('positive cases — async ArrowFunctionExpression', () => {
    test('reports return new Promise in async ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncArrowFunction()
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports.length).toBe(1)
    })

    test('report message is correct for ArrowFunctionExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncArrowFunction()
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports[0].message).toBe(
        'Avoid returning a new Promise from an async function. The function already returns a Promise.',
      )
    })

    test('report loc is correct for ArrowFunctionExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncArrowFunction()
      const argLoc = makeLoc(3, 8, 3, 25)
      visitor.ReturnStatement(makeReturnWithNewPromise(parent, argLoc))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('report node is the NewExpression for ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncArrowFunction()
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      const reportedNode = reports[0].node as { type?: string }
      expect(reportedNode.type).toBe('NewExpression')
    })
  })

  // ===== POSITIVE CASES — ASYNC FUNCTION EXPRESSION (4) =====
  describe('positive cases — async FunctionExpression', () => {
    test('reports return new Promise in async FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionExpr()
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports.length).toBe(1)
    })

    test('report message is correct for FunctionExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionExpr()
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports[0].message).toBe(
        'Avoid returning a new Promise from an async function. The function already returns a Promise.',
      )
    })

    test('report loc is correct for FunctionExpression parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionExpr()
      const argLoc = makeLoc(4, 5, 4, 20)
      visitor.ReturnStatement(makeReturnWithNewPromise(parent, argLoc))
      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('report node is the NewExpression for FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionExpr()
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      const reportedNode = reports[0].node as { type?: string }
      expect(reportedNode.type).toBe('NewExpression')
    })
  })

  // ===== NEGATIVE CASES — NO ARGUMENT / WRONG ARGUMENT (10) =====
  describe('negative cases — no argument or wrong argument', () => {
    test('bare return NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: null,
        parent: parent,
        loc: makeLoc(2, 2, 2, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('return undefined argument NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        parent: parent,
        loc: makeLoc(2, 2, 2, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('return Identifier NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'value' },
        parent: parent,
        loc: makeLoc(2, 2, 2, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('return CallExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        parent: parent,
        loc: makeLoc(2, 2, 2, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('return Literal NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Literal', value: 42 },
        parent: parent,
        loc: makeLoc(2, 2, 2, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('return MemberExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        parent: parent,
        loc: makeLoc(2, 2, 2, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('return BinaryExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        parent: parent,
        loc: makeLoc(2, 2, 2, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('return ConditionalExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'x' },
          consequent: { type: 'Literal', value: 'a' },
          alternate: { type: 'Literal', value: 'b' },
        },
        parent: parent,
        loc: makeLoc(2, 2, 2, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('return ArrayExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'ArrayExpression', elements: [] },
        parent: parent,
        loc: makeLoc(2, 2, 2, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('return ObjectExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'ObjectExpression', properties: [] },
        parent: parent,
        loc: makeLoc(2, 2, 2, 15),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — WRONG CALLEE (6) =====
  describe('negative cases — wrong callee', () => {
    test('new MyClass NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'MyClass' },
          arguments: [],
        },
        parent: parent,
        loc: makeLoc(2, 2, 2, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('new Error NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Error' },
          arguments: [],
        },
        parent: parent,
        loc: makeLoc(2, 2, 2, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('new Map NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Map' },
          arguments: [],
        },
        parent: parent,
        loc: makeLoc(2, 2, 2, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('new promise (lowercase) NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'promise' },
          arguments: [],
        },
        parent: parent,
        loc: makeLoc(2, 2, 2, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('NewExpression with MemberExpression callee NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'NewExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'window' },
            property: { type: 'Identifier', name: 'Promise' },
          },
          arguments: [],
        },
        parent: parent,
        loc: makeLoc(2, 2, 2, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('NewExpression with no callee NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'NewExpression', arguments: [] },
        parent: parent,
        loc: makeLoc(2, 2, 2, 20),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — NON-ASYNC PARENT (6) =====
  describe('negative cases — non-async parent', () => {
    test('sync FunctionDeclaration NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        async: false,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 3, 1),
      }
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports.length).toBe(0)
    })

    test('sync ArrowFunctionExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = {
        type: 'ArrowFunctionExpression',
        async: false,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 3, 1),
      }
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports.length).toBe(0)
    })

    test('sync FunctionExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = {
        type: 'FunctionExpression',
        id: null,
        async: false,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 3, 1),
      }
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports.length).toBe(0)
    })

    test('FunctionDeclaration without async property NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 3, 1),
      }
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports.length).toBe(0)
    })

    test('BlockStatement parent NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = {
        type: 'BlockStatement',
        body: [],
        loc: makeLoc(1, 0, 3, 1),
      }
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports.length).toBe(0)
    })

    test('IfStatement parent NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = {
        type: 'IfStatement',
        test: null,
        consequent: null,
        loc: makeLoc(1, 0, 3, 1),
      }
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — NO PARENT (3) =====
  describe('negative cases — no parent', () => {
    test('no parent property NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: makePromiseNewExpr(),
        loc: makeLoc(2, 2, 2, 31),
      })
      expect(reports.length).toBe(0)
    })

    test('parent is null NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: makePromiseNewExpr(),
        parent: null,
        loc: makeLoc(2, 2, 2, 31),
      })
      expect(reports.length).toBe(0)
    })

    test('parent is undefined NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: makePromiseNewExpr(),
        parent: undefined,
        loc: makeLoc(2, 2, 2, 31),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — NULL/UNDEFINED/INVALID NODES (7) =====
  describe('negative cases — invalid nodes', () => {
    test('null node handled gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      expect(() => visitor.ReturnStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('undefined node handled gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      expect(() => visitor.ReturnStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('empty object NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      visitor.ReturnStatement({})
      expect(reports.length).toBe(0)
    })

    test('wrong node type ExpressionStatement NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      visitor.ReturnStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 42 },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('wrong node type IfStatement NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      visitor.ReturnStatement({
        type: 'IfStatement',
        test: null,
        consequent: null,
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('wrong node type VariableDeclaration NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      visitor.ReturnStatement({
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'let',
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('string node NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      expect(() => visitor.ReturnStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — VISITOR PROPERTIES (3) =====
  describe('negative cases — visitor properties', () => {
    test('FunctionDeclaration visitor NOT in visitor', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      expect(visitor).not.toHaveProperty('FunctionDeclaration')
    })

    test('IfStatement visitor NOT in visitor', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      expect(visitor).not.toHaveProperty('IfStatement')
    })

    test('ForStatement visitor NOT in visitor', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      expect(visitor).not.toHaveProperty('ForStatement')
    })
  })

  // ===== EDGE CASES (14) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noMisusedPromiseReturnRule.create(ctx1)
      const visitor2 = noMisusedPromiseReturnRule.create(ctx2)

      const parent1 = makeAsyncFunctionDecl()
      visitor1.ReturnStatement(makeReturnWithNewPromise(parent1))
      visitor2.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'value' },
        _parent: makeAsyncFunctionDecl(),
      })

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('accumulation across multiple ReturnStatements', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports.length).toBe(3)
    })

    test('node without loc on argument still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Promise' },
          arguments: [],
        },
        parent: parent,
      })
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noMisusedPromiseReturnRule.create(context)
      const visitor2 = noMisusedPromiseReturnRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const asyncParent = makeAsyncFunctionDecl()
      visitor.ReturnStatement(makeReturnWithNewPromise(asyncParent))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'x' },
        _parent: asyncParent,
      })
      visitor.ReturnStatement(makeReturnWithNewPromise(asyncParent))
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        _parent: asyncParent,
      })
      expect(reports.length).toBe(2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports.length).toBe(3)
    })

    test('all reports have same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent1 = makeAsyncFunctionDecl()
      const parent2 = makeAsyncArrowFunction()
      const parent3 = makeAsyncFunctionExpr()
      visitor.ReturnStatement(makeReturnWithNewPromise(parent1))
      visitor.ReturnStatement(makeReturnWithNewPromise(parent2))
      visitor.ReturnStatement(makeReturnWithNewPromise(parent3))
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('reports with default location when argument has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Promise' },
          arguments: [],
        },
        parent: parent,
      })
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('parent with params still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        async: true,
        params: [{ type: 'Identifier', name: 'x' }],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 3, 1),
      }
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports.length).toBe(1)
    })

    test('parent with generator flag still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        async: true,
        generator: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 3, 1),
      }
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports.length).toBe(1)
    })

    test('parent with null id still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = {
        type: 'FunctionDeclaration',
        id: null,
        async: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 3, 1),
      }
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports.length).toBe(1)
    })

    test('reports two violations with identical messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('meta is same reference across accesses', () => {
      const meta1 = noMisusedPromiseReturnRule.meta
      const meta2 = noMisusedPromiseReturnRule.meta
      expect(meta1).toBe(meta2)
    })

    test('multiple calls with same node report each time', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      const node = makeReturnWithNewPromise(parent)
      visitor.ReturnStatement(node)
      visitor.ReturnStatement(node)
      expect(reports.length).toBe(2)
    })
  })

  // ===== ADDITIONAL COVERAGE (14) =====
  describe('additional coverage', () => {
    test('rule name is exported as noMisusedPromiseReturnRule', () => {
      expect(noMisusedPromiseReturnRule).toBeDefined()
      expect(typeof noMisusedPromiseReturnRule.create).toBe('function')
      expect(typeof noMisusedPromiseReturnRule.meta).toBe('object')
    })

    test('handles node with missing argument property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      visitor.ReturnStatement({ type: 'ReturnStatement', loc: makeLoc(1, 0, 3, 1) })
      expect(reports.length).toBe(0)
    })

    test('return ArrowFunctionExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'ArrowFunctionExpression',
          params: [],
          body: { type: 'Identifier', name: 'x' },
        },
        parent: parent,
        loc: makeLoc(2, 2, 2, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('return UnaryExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'UnaryExpression',
          operator: '-',
          argument: { type: 'Identifier', name: 'x' },
        },
        parent: parent,
        loc: makeLoc(2, 2, 2, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('return LogicalExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        parent: parent,
        loc: makeLoc(2, 2, 2, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('return TemplateLiteral NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: { type: 'TemplateLiteral', quasis: [], expressions: [] },
        parent: parent,
        loc: makeLoc(2, 2, 2, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('return UpdateExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'x' },
          prefix: false,
        },
        parent: parent,
        loc: makeLoc(2, 2, 2, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('new Promise with arguments array still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Promise' },
          arguments: [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }],
          loc: makeLoc(2, 11, 2, 35),
        },
        parent: parent,
        loc: makeLoc(2, 2, 2, 36),
      })
      expect(reports.length).toBe(1)
    })

    test('does NOT report for ExpressionStatement visitor absence', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      expect(visitor).not.toHaveProperty('ExpressionStatement')
    })

    test('does NOT report for WhileStatement visitor absence', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      expect(visitor).not.toHaveProperty('WhileStatement')
    })

    test('does NOT report for SwitchStatement visitor absence', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      expect(visitor).not.toHaveProperty('SwitchStatement')
    })

    test('does NOT report for VariableDeclaration visitor absence', () => {
      const { context } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      expect(visitor).not.toHaveProperty('VariableDeclaration')
    })

    test('message contains "Promise"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports[0].message).toContain('Promise')
    })

    test('message contains "async"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports[0].message.toLowerCase()).toContain('async')
    })

    test('parent without id property still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = {
        type: 'FunctionDeclaration',
        async: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 3, 1),
      }
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports.length).toBe(1)
    })

    test('FunctionExpression with named id still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = {
        type: 'FunctionExpression',
        id: { type: 'Identifier', name: 'myFunc' },
        async: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 3, 1),
      }
      visitor.ReturnStatement(makeReturnWithNewPromise(parent))
      expect(reports.length).toBe(1)
    })

    test('return AwaitExpression NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'AwaitExpression',
          argument: { type: 'Identifier', name: 'x' },
        },
        parent: parent,
        loc: makeLoc(2, 2, 2, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('NewExpression with null callee NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: {
          type: 'NewExpression',
          callee: null,
          arguments: [],
        },
        parent: parent,
        loc: makeLoc(2, 2, 2, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('argument is number NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: 42,
        parent: parent,
        loc: makeLoc(2, 2, 2, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('argument is string NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      const parent = makeAsyncFunctionDecl()
      visitor.ReturnStatement({
        type: 'ReturnStatement',
        argument: 'not a node',
        parent: parent,
        loc: makeLoc(2, 2, 2, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('mixed positive across all parent types reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisusedPromiseReturnRule.create(context)
      visitor.ReturnStatement(makeReturnWithNewPromise(makeAsyncFunctionDecl()))
      visitor.ReturnStatement(makeReturnWithNewPromise(makeAsyncArrowFunction()))
      visitor.ReturnStatement(makeReturnWithNewPromise(makeAsyncFunctionExpr()))
      expect(reports.length).toBe(3)
    })
  })
})

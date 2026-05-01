import { describe, expect, test, vi } from 'vitest'
import { noImplicitReturnInTestRule } from '../../../../src/rules/testing/no-implicit-return-in-test.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  node?: unknown
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  filePath = '/src/file.test.ts',
  source = "test('x', () => expect(a).toBe(b));",
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({ message: descriptor.message, node: descriptor.node, loc: descriptor.loc })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [{}] },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    workspaceRoot: '/src',
  } as unknown as RuleContext
  return { context, reports }
}

function createExpectCallExpr(matcher = 'toBe'): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'expect' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      },
      property: { type: 'Identifier', name: matcher },
    },
    arguments: [{ type: 'Literal', value: 1 }],
  }
}

function createChainedExpectCallExpr(): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'x' }],
          },
          property: { type: 'Identifier', name: 'not' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: 'toBe' },
    },
    arguments: [{ type: 'Literal', value: 1 }],
  }
}

function createRejectsExpectCallExpr(): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'expect' },
            arguments: [{ type: 'Identifier', name: 'promise' }],
          },
          property: { type: 'Identifier', name: 'rejects' },
        },
        arguments: [],
      },
      property: { type: 'Identifier', name: 'toThrow' },
    },
    arguments: [],
  }
}

function createConciseArrowTest(funcName: string, expectChain: unknown, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: funcName },
    arguments: [
      { type: 'StringLiteral', value: 'test name' },
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: expectChain,
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 40 } },
  }
}

function createBlockArrowTest(funcName: string, bodyItems: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: funcName },
    arguments: [
      { type: 'StringLiteral', value: 'test name' },
      {
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: bodyItems },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

function createNonExpectCallExpr(): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'someFunc' },
    arguments: [],
  }
}

function createNonExpectMemberCallExpr(): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'someFunc' },
        arguments: [{ type: 'Identifier', name: 'x' }],
      },
      property: { type: 'Identifier', name: 'method' },
    },
    arguments: [],
  }
}

function createFunctionExprTest(funcName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: funcName },
    arguments: [
      { type: 'StringLiteral', value: 'test name' },
      {
        type: 'FunctionExpression',
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{
            type: 'ExpressionStatement',
            expression: createExpectCallExpr(),
          }],
        },
      },
    ],
    loc: { start: { line, column }, end: { line, column: column + 50 } },
  }
}

describe('no-implicit-return-in-test rule', () => {
  describe('concise arrow test() with expect - reports', () => {
    test('reports test() with concise arrow returning expect().toBe()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr('toBe')))
      expect(reports.length).toBe(1)
    })

    test('reports test() with concise arrow returning expect().toEqual()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr('toEqual')))
      expect(reports.length).toBe(1)
    })

    test('reports test() with concise arrow returning expect().toBeTruthy()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr('toBeTruthy')))
      expect(reports.length).toBe(1)
    })

    test('reports test() with concise arrow returning expect().toHaveBeenCalledWith()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr('toHaveBeenCalledWith')))
      expect(reports.length).toBe(1)
    })

    test('reports test() with concise arrow returning expect().toContain()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr('toContain')))
      expect(reports.length).toBe(1)
    })

    test('reports test() with concise arrow returning expect().toBeDefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr('toBeDefined')))
      expect(reports.length).toBe(1)
    })

    test('reports test() with concise arrow returning expect().toBeNull()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr('toBeNull')))
      expect(reports.length).toBe(1)
    })

    test('reports test() with concise arrow returning expect().toBeUndefined()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr('toBeUndefined')))
      expect(reports.length).toBe(1)
    })

    test('does not report test() with chained expect().not.toBe()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createChainedExpectCallExpr()))
      expect(reports.length).toBe(0)
    })

    test('does not report test() with chained expect().rejects.toThrow()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createRejectsExpectCallExpr()))
      expect(reports.length).toBe(0)
    })
  })

  describe('concise arrow it() with expect - reports', () => {
    test('reports it() with concise arrow returning expect().toBe()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('it', createExpectCallExpr('toBe')))
      expect(reports.length).toBe(1)
    })

    test('reports it() with concise arrow returning expect().toEqual()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('it', createExpectCallExpr('toEqual')))
      expect(reports.length).toBe(1)
    })

    test('reports it() with concise arrow returning expect().toBeTruthy()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('it', createExpectCallExpr('toBeTruthy')))
      expect(reports.length).toBe(1)
    })

    test('reports it() with concise arrow returning expect().toBeFalsy()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('it', createExpectCallExpr('toBeFalsy')))
      expect(reports.length).toBe(1)
    })

    test('reports it() with concise arrow returning expect().toContain()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('it', createExpectCallExpr('toContain')))
      expect(reports.length).toBe(1)
    })

    test('reports it() with concise arrow returning expect().toContainEqual()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('it', createExpectCallExpr('toContainEqual')))
      expect(reports.length).toBe(1)
    })

    test('reports it() with concise arrow returning expect().toHaveLength()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('it', createExpectCallExpr('toHaveLength')))
      expect(reports.length).toBe(1)
    })

    test('reports it() with concise arrow returning expect().toThrow()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('it', createExpectCallExpr('toThrow')))
      expect(reports.length).toBe(1)
    })

    test('reports it() with concise arrow returning expect().toBeInstanceOf()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('it', createExpectCallExpr('toBeInstanceOf')))
      expect(reports.length).toBe(1)
    })

    test('reports it() with concise arrow returning expect().toMatch()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('it', createExpectCallExpr('toMatch')))
      expect(reports.length).toBe(1)
    })
  })

  describe('block body test/it with expect - no report', () => {
    test('does not report test() with block body arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createBlockArrowTest('test', [{
        type: 'ExpressionStatement',
        expression: createExpectCallExpr(),
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report it() with block body arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createBlockArrowTest('it', [{
        type: 'ExpressionStatement',
        expression: createExpectCallExpr(),
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report test() with empty block body', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createBlockArrowTest('test', []))
      expect(reports.length).toBe(0)
    })

    test('does not report it() with empty block body', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createBlockArrowTest('it', []))
      expect(reports.length).toBe(0)
    })

    test('does not report test() with block body containing multiple statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createBlockArrowTest('test', [
        { type: 'ExpressionStatement', expression: createExpectCallExpr('toBe') },
        { type: 'ExpressionStatement', expression: createExpectCallExpr('toEqual') },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report it() with block body containing multiple statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createBlockArrowTest('it', [
        { type: 'ExpressionStatement', expression: createExpectCallExpr('toBe') },
        { type: 'ExpressionStatement', expression: createExpectCallExpr('toEqual') },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report test() with block body arrow returning a variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createBlockArrowTest('test', [{
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'const',
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report it() with block body containing return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createBlockArrowTest('it', [{
        type: 'ReturnStatement',
        argument: createExpectCallExpr(),
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report test() with block body arrow and complex expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createBlockArrowTest('test', [{
        type: 'ExpressionStatement',
        expression: createChainedExpectCallExpr(),
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report it() with block body arrow and toHaveBeenCalledWith', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createBlockArrowTest('it', [{
        type: 'ExpressionStatement',
        expression: createExpectCallExpr('toHaveBeenCalledWith'),
      }]))
      expect(reports.length).toBe(0)
    })
  })

  describe('FunctionExpression test/it - no report', () => {
    test('does not report test() with function expression callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createFunctionExprTest('test'))
      expect(reports.length).toBe(0)
    })

    test('does not report it() with function expression callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createFunctionExprTest('it'))
      expect(reports.length).toBe(0)
    })

    test('does not report test() with anonymous function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'StringLiteral', value: 'test name' },
          {
            type: 'FunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report it() with function expression containing expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'StringLiteral', value: 'test name' },
          {
            type: 'FunctionExpression',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [{
                type: 'ExpressionStatement',
                expression: createExpectCallExpr('toBe'),
              }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report test() with named function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'StringLiteral', value: 'test name' },
          {
            type: 'FunctionExpression',
            id: { type: 'Identifier', name: 'myTestFn' },
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report it() with named function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'StringLiteral', value: 'test name' },
          {
            type: 'FunctionExpression',
            id: { type: 'Identifier', name: 'myItFn' },
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report test() with async function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'StringLiteral', value: 'test name' },
          {
            type: 'FunctionExpression',
            async: true,
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report it() with function expression with parameters', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'it' },
        arguments: [
          { type: 'StringLiteral', value: 'test name' },
          {
            type: 'FunctionExpression',
            params: [{ type: 'Identifier', name: 'done' }],
            body: { type: 'BlockStatement', body: [] },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('non-expect concise arrow - no report', () => {
    test('does not report test() with concise arrow returning someFunc()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createNonExpectCallExpr()))
      expect(reports.length).toBe(0)
    })

    test('does not report it() with concise arrow returning someFunc()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('it', createNonExpectCallExpr()))
      expect(reports.length).toBe(0)
    })

    test('does not report test() with concise arrow returning someFunc().method()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createNonExpectMemberCallExpr()))
      expect(reports.length).toBe(0)
    })

    test('does not report it() with concise arrow returning someFunc().method()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('it', createNonExpectMemberCallExpr()))
      expect(reports.length).toBe(0)
    })

    test('does not report test() with concise arrow returning a plain Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const idBody = { type: 'Identifier', name: 'someVar' }
      visitor.CallExpression(createConciseArrowTest('test', idBody))
      expect(reports.length).toBe(0)
    })

    test('does not report it() with concise arrow returning a plain Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const idBody = { type: 'Identifier', name: 'someVar' }
      visitor.CallExpression(createConciseArrowTest('it', idBody))
      expect(reports.length).toBe(0)
    })

    test('does not report test() with concise arrow returning a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const literalBody = { type: 'Literal', value: 42 }
      visitor.CallExpression(createConciseArrowTest('test', literalBody))
      expect(reports.length).toBe(0)
    })

    test('does not report it() with concise arrow returning a Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const literalBody = { type: 'Literal', value: 42 }
      visitor.CallExpression(createConciseArrowTest('it', literalBody))
      expect(reports.length).toBe(0)
    })
  })

  describe('non-test functions - no report', () => {
    test('does not report describe() with concise arrow returning expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('describe', createExpectCallExpr()))
      expect(reports.length).toBe(0)
    })

    test('does not report beforeEach() with concise arrow returning expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('beforeEach', createExpectCallExpr()))
      expect(reports.length).toBe(0)
    })

    test('does not report afterEach() with concise arrow returning expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('afterEach', createExpectCallExpr()))
      expect(reports.length).toBe(0)
    })

    test('does not report beforeAll() with concise arrow returning expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('beforeAll', createExpectCallExpr()))
      expect(reports.length).toBe(0)
    })

    test('does not report afterAll() with concise arrow returning expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('afterAll', createExpectCallExpr()))
      expect(reports.length).toBe(0)
    })

    test('does not report customFunction() with concise arrow returning expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('myCustomFn', createExpectCallExpr()))
      expect(reports.length).toBe(0)
    })
  })

  describe('different expect matchers', () => {
    test('reports expect().toBe()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr('toBe')))
      expect(reports.length).toBe(1)
    })

    test('reports expect().toEqual()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr('toEqual')))
      expect(reports.length).toBe(1)
    })

    test('reports expect().toStrictEqual()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr('toStrictEqual')))
      expect(reports.length).toBe(1)
    })

    test('reports expect().toMatchSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr('toMatchSnapshot')))
      expect(reports.length).toBe(1)
    })

    test('reports expect().toMatchInlineSnapshot()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr('toMatchInlineSnapshot')))
      expect(reports.length).toBe(1)
    })

    test('reports expect().toHaveBeenCalledWith()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr('toHaveBeenCalledWith')))
      expect(reports.length).toBe(1)
    })

    test('reports expect().toHaveBeenLastCalledWith()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr('toHaveBeenLastCalledWith')))
      expect(reports.length).toBe(1)
    })

    test('reports expect().toHaveBeenNthCalledWith()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr('toHaveBeenNthCalledWith')))
      expect(reports.length).toBe(1)
    })
  })

  describe('error message format', () => {
    test('message contains "Arrow function test"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr()))
      expect(reports[0].message).toContain('Arrow function test')
    })

    test('message contains "implicitly returns"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr()))
      expect(reports[0].message).toContain('implicitly returns')
    })

    test('message contains "expect()"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr()))
      expect(reports[0].message).toContain('expect()')
    })

    test('message contains "Wrap the body in braces"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr()))
      expect(reports[0].message).toContain('Wrap the body in braces')
    })

    test('message is exactly the expected format for test()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr()))
      expect(reports[0].message).toBe(
        'Arrow function test implicitly returns an expect() expression. Wrap the body in braces to avoid returning the assertion.',
      )
    })

    test('message is exactly the expected format for it()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('it', createExpectCallExpr()))
      expect(reports[0].message).toBe(
        'Arrow function test implicitly returns an expect() expression. Wrap the body in braces to avoid returning the assertion.',
      )
    })

    test('report includes loc with start and end positions', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr(), 5, 10))
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report includes the original node', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const node = createConciseArrowTest('test', createExpectCallExpr())
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })
  })

  describe('edge cases', () => {
    test('handles null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('handles undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('handles string node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles numeric node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles node with non-object callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'StringLiteral', value: 'test name' },
          'string callback',
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles node with null callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'StringLiteral', value: 'test name' },
          null,
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles arrow function with null body', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'StringLiteral', value: 'test name' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: null,
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles arrow function with undefined body', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'StringLiteral', value: 'test name' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when body callee is an Identifier (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'StringLiteral', value: 'test name' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'expect' },
              arguments: [{ type: 'Identifier', name: 'x' }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('different positions', () => {
    test('reports test at line 1, column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr(), 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports test at line 10, column 5', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr(), 10, 5))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports it at line 100, column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('it', createExpectCallExpr(), 100, 0))
      expect(reports[0].loc?.start.line).toBe(100)
    })

    test('reports test at line 1, column 50', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr(), 1, 50))
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('reports it at line 42, column 8', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('it', createExpectCallExpr(), 42, 8))
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('reports test at line 0, column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr(), 0, 0))
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports end location correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr(), 3, 4))
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('reports multiple violations at different positions independently', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr(), 1, 0))
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr(), 5, 0))
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr(), 10, 0))
      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
    })
  })

  describe('mixed valid/invalid patterns', () => {
    test('reports only the invalid test among mixed patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr()))
      visitor.CallExpression(createBlockArrowTest('test', [{
        type: 'ExpressionStatement',
        expression: createExpectCallExpr(),
      }]))
      expect(reports.length).toBe(1)
    })

    test('reports both it() and test() concise arrows', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      visitor.CallExpression(createConciseArrowTest('test', createExpectCallExpr()))
      visitor.CallExpression(createConciseArrowTest('it', createExpectCallExpr()))
      expect(reports.length).toBe(2)
    })

    test('reports test.only() with concise arrow returning expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'test' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'StringLiteral', value: 'test name' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: createExpectCallExpr(),
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report describe.only with concise arrow returning expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'describe' },
          property: { type: 'Identifier', name: 'only' },
        },
        arguments: [
          { type: 'StringLiteral', value: 'suite name' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: createExpectCallExpr(),
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('reports when callback is the last argument among multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'StringLiteral', value: 'test name' },
          { type: 'Literal', value: 5000 },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: createExpectCallExpr(),
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report when FunctionExpression is the last of multiple arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'StringLiteral', value: 'test name' },
          { type: 'Literal', value: 5000 },
          {
            type: 'FunctionExpression',
            params: [],
            body: {
              type: 'BlockStatement',
              body: [{
                type: 'ExpressionStatement',
                expression: createExpectCallExpr(),
              }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 50 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('visitor is created fresh each time', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noImplicitReturnInTestRule.create(ctx1)
      const visitor2 = noImplicitReturnInTestRule.create(ctx2)
      visitor1.CallExpression(createConciseArrowTest('test', createExpectCallExpr()))
      visitor2.CallExpression(createConciseArrowTest('test', createExpectCallExpr()))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(1)
    })

    test('does not report when body callee is MemberExpression but object is not CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'StringLiteral', value: 'test name' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'obj' },
                property: { type: 'Identifier', name: 'method' },
              },
              arguments: [],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when inner callee name is not expect', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitReturnInTestRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [
          { type: 'StringLiteral', value: 'test name' },
          {
            type: 'ArrowFunctionExpression',
            params: [],
            body: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'CallExpression',
                  callee: { type: 'Identifier', name: 'assert' },
                  arguments: [{ type: 'Identifier', name: 'x' }],
                },
                property: { type: 'Identifier', name: 'equal' },
              },
              arguments: [{ type: 'Literal', value: 1 }],
            },
          },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 40 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })
})

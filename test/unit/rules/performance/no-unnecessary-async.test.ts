import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryAsyncRule } from '../../../../src/rules/performance/no-unnecessary-async.js'
import type { ReportDescriptor } from '../../../../src/plugins/types.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []
  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push(descriptor)
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => 'async function foo() { return 42; }',
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

function makeAsyncFunctionDecl(body: unknown, loc = makeLoc(1, 0, 5, 1)): unknown {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'foo' },
    async: true,
    params: [],
    body,
    loc,
  }
}

function makeAsyncArrow(body: unknown, loc = makeLoc(1, 0, 3, 1)): unknown {
  return {
    type: 'ArrowFunctionExpression',
    async: true,
    params: [],
    body,
    loc,
  }
}

describe('no-unnecessary-async rule', () => {

  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('has correct type "suggestion"', () => {
      expect(noUnnecessaryAsyncRule.meta.type).toBe('suggestion')
    })

    test('has severity "warn"', () => {
      expect(noUnnecessaryAsyncRule.meta.severity).toBe('warn')
    })

    test('has correct category "performance"', () => {
      expect(noUnnecessaryAsyncRule.meta.docs?.category).toBe('performance')
    })

    test('is not recommended', () => {
      expect(noUnnecessaryAsyncRule.meta.docs?.recommended).toBe(false)
    })

    test('has a description', () => {
      expect(noUnnecessaryAsyncRule.meta.docs?.description).toBeTruthy()
    })

    test('has description mentioning async and await', () => {
      const desc = noUnnecessaryAsyncRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/async/)
      expect(desc).toMatch(/await/)
    })

    test('has correct docs URL', () => {
      expect(noUnnecessaryAsyncRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-async',
      )
    })

    test('has empty schema', () => {
      expect(noUnnecessaryAsyncRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (4) =====
  describe('structure', () => {
    test('create() returns visitor with FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })

    test('create() returns visitor with ArrowFunctionExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      expect(visitor).toHaveProperty('ArrowFunctionExpression')
      expect(typeof visitor.ArrowFunctionExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryAsyncRule).toBeDefined()
      expect(noUnnecessaryAsyncRule.meta).toBeDefined()
      expect(noUnnecessaryAsyncRule.create).toBeDefined()
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const v1 = noUnnecessaryAsyncRule.create(context)
      const v2 = noUnnecessaryAsyncRule.create(context)
      expect(v1).not.toBe(v2)
    })
  })

  // ===== FUNCTIONDECLARATION POSITIVE CASES (14) =====
  describe('FunctionDeclaration positive cases — reports', () => {
    test('async function with empty block body reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({ type: 'BlockStatement', body: [] }))
      expect(reports.length).toBe(1)
    })

    test('async function with return literal reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
      }))
      expect(reports.length).toBe(1)
    })

    test('async function with return identifier reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'x' } }],
      }))
      expect(reports.length).toBe(1)
    })

    test('async function with expression statement reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{ type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] } }],
      }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions async function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({ type: 'BlockStatement', body: [] }))
      expect(reports[0].message.toLowerCase()).toContain('async function')
    })

    test('report message mentions await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({ type: 'BlockStatement', body: [] }))
      expect(reports[0].message.toLowerCase()).toContain('await')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({ type: 'BlockStatement', body: [] }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({ type: 'BlockStatement', body: [] }))
      expect(reports[0].node).toBeDefined()
    })

    test('report loc matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      const node = makeAsyncFunctionDecl({ type: 'BlockStatement', body: [] }, makeLoc(10, 2, 15, 3))
      visitor.FunctionDeclaration(node)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[0].loc?.end.line).toBe(15)
      expect(reports[0].loc?.end.column).toBe(3)
    })

    test('report node is the function node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      const node = makeAsyncFunctionDecl({ type: 'BlockStatement', body: [] })
      visitor.FunctionDeclaration(node)
      expect(reports[0].node).toBe(node)
    })

    test('report message is exact match for FunctionDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({ type: 'BlockStatement', body: [] }))
      expect(reports[0].message).toBe(
        'Async function does not contain any await expressions. Remove the async keyword to avoid unnecessary promise wrapping.',
      )
    })

    test('async function with variable declaration reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{ type: 'VariableDeclaration', declarations: [], kind: 'let' }],
      }))
      expect(reports.length).toBe(1)
    })

    test('async function with if statement (no await) reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{
          type: 'IfStatement',
          test: { type: 'Identifier', name: 'x' },
          consequent: { type: 'BlockStatement', body: [] },
        }],
      }))
      expect(reports.length).toBe(1)
    })

    test('async function with multiple statements (no await) reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [
          { type: 'VariableDeclaration', declarations: [], kind: 'const' },
          { type: 'ReturnStatement', argument: { type: 'Literal', value: 1 } },
        ],
      }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== ARROWFUNCTION POSITIVE CASES (10) =====
  describe('ArrowFunctionExpression positive cases — reports', () => {
    test('async arrow with block body (no await) reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression(makeAsyncArrow({ type: 'BlockStatement', body: [] }))
      expect(reports.length).toBe(1)
    })

    test('async arrow with expression body (no await) reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression(makeAsyncArrow({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('async arrow with return identifier reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression(makeAsyncArrow({
        type: 'BlockStatement',
        body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'x' } }],
      }))
      expect(reports.length).toBe(1)
    })

    test('arrow report message mentions async arrow function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression(makeAsyncArrow({ type: 'Literal', value: 42 }))
      expect(reports[0].message.toLowerCase()).toContain('async arrow function')
    })

    test('arrow report message mentions await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression(makeAsyncArrow({ type: 'Literal', value: 42 }))
      expect(reports[0].message.toLowerCase()).toContain('await')
    })

    test('arrow report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression(makeAsyncArrow({ type: 'BlockStatement', body: [] }))
      expect(reports[0].loc).toBeDefined()
    })

    test('arrow report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression(makeAsyncArrow({ type: 'BlockStatement', body: [] }))
      expect(reports[0].node).toBeDefined()
    })

    test('arrow report loc matches node loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      const node = makeAsyncArrow({ type: 'Literal', value: 42 }, makeLoc(5, 0, 5, 20))
      visitor.ArrowFunctionExpression(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('arrow report message is exact match', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression(makeAsyncArrow({ type: 'Literal', value: 42 }))
      expect(reports[0].message).toBe(
        'Async arrow function does not contain any await expressions. Remove the async keyword to avoid unnecessary promise wrapping.',
      )
    })

    test('async arrow with if statement (no await) reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression(makeAsyncArrow({
        type: 'BlockStatement',
        body: [{
          type: 'IfStatement',
          test: { type: 'Identifier', name: 'x' },
          consequent: { type: 'BlockStatement', body: [] },
        }],
      }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== FUNCTIONDECLARATION NEGATIVE CASES (14) =====
  describe('FunctionDeclaration negative cases — does NOT report', () => {
    test('non-async function does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        async: false,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('function without async flag does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('async function with direct await does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{
          type: 'ExpressionStatement',
          expression: { type: 'AwaitExpression', argument: { type: 'Literal', value: 42 } },
        }],
      }))
      expect(reports.length).toBe(0)
    })

    test('async function with nested await in call does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{
          type: 'ReturnStatement',
          argument: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'x' } }],
          },
        }],
      }))
      expect(reports.length).toBe(0)
    })

    test('async function with await in return does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{
          type: 'ReturnStatement',
          argument: { type: 'AwaitExpression', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] } },
        }],
      }))
      expect(reports.length).toBe(0)
    })

    test('async function with await in variable declaration does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{
          type: 'VariableDeclaration',
          declarations: [{
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: 'x' },
            init: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'p' } },
          }],
          kind: 'const',
        }],
      }))
      expect(reports.length).toBe(0)
    })

    test('async function with await inside if statement does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{
          type: 'IfStatement',
          test: { type: 'Identifier', name: 'x' },
          consequent: {
            type: 'BlockStatement',
            body: [{
              type: 'ExpressionStatement',
              expression: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'p' } },
            }],
          },
        }],
      }))
      expect(reports.length).toBe(0)
    })

    test('null node does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('undefined node does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('wrong node type does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration({ type: 'VariableDeclaration', declarations: [], kind: 'let', loc: makeLoc(1, 0, 3, 1) })
      expect(reports.length).toBe(0)
    })

    test('async function with null body does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        async: true,
        params: [],
        body: null,
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('async function without body property does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        async: true,
        params: [],
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('async function with nested FunctionExpression containing await does NOT report (boundary stop)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{
          type: 'ReturnStatement',
          argument: {
            type: 'FunctionExpression',
            id: null,
            params: [],
            body: {
              type: 'BlockStatement',
              body: [{
                type: 'ReturnStatement',
                argument: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'x' } },
              }],
            },
          },
        }],
      }))
      expect(reports.length).toBe(1)
    })

    test('async function with nested ArrowFunctionExpression containing await does NOT stop parent report (boundary stop)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{
          type: 'ReturnStatement',
          argument: {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'x' } },
          },
        }],
      }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== ARROWFUNCTION NEGATIVE CASES (12) =====
  describe('ArrowFunctionExpression negative cases — does NOT report', () => {
    test('non-async arrow does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression({
        type: 'ArrowFunctionExpression',
        async: false,
        params: [],
        body: { type: 'Literal', value: 42 },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('arrow without async flag does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression({
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'Literal', value: 42 },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('async arrow with direct await does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression(makeAsyncArrow({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'p' } }))
      expect(reports.length).toBe(0)
    })

    test('async arrow with await in block body does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression(makeAsyncArrow({
        type: 'BlockStatement',
        body: [{
          type: 'ExpressionStatement',
          expression: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'p' } },
        }],
      }))
      expect(reports.length).toBe(0)
    })

    test('async arrow with await in return does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression(makeAsyncArrow({
        type: 'BlockStatement',
        body: [{
          type: 'ReturnStatement',
          argument: { type: 'AwaitExpression', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] } },
        }],
      }))
      expect(reports.length).toBe(0)
    })

    test('async arrow with await inside nested condition does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression(makeAsyncArrow({
        type: 'BlockStatement',
        body: [{
          type: 'IfStatement',
          test: { type: 'Identifier', name: 'cond' },
          consequent: {
            type: 'BlockStatement',
            body: [{
              type: 'ExpressionStatement',
              expression: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'p' } },
            }],
          },
        }],
      }))
      expect(reports.length).toBe(0)
    })

    test('null node does NOT report for arrow', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      expect(() => visitor.ArrowFunctionExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('undefined node does NOT report for arrow', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      expect(() => visitor.ArrowFunctionExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('wrong node type does NOT report for arrow', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression({ type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'foo' }, loc: makeLoc(1, 0, 3, 1) })
      expect(reports.length).toBe(0)
    })

    test('async arrow with null body does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression({
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: null,
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('async arrow without body property does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression({
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('async arrow with nested FunctionDeclaration containing await still reports (boundary stop)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression(makeAsyncArrow({
        type: 'BlockStatement',
        body: [{
          type: 'FunctionDeclaration',
          id: { type: 'Identifier', name: 'inner' },
          body: {
            type: 'BlockStatement',
            body: [{
              type: 'ExpressionStatement',
              expression: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'x' } },
            }],
          },
        }],
      }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== BOUNDARY / CONTAINSAWAIT TESTS (7) =====
  describe('containsAwait boundary tests', () => {
    test('await deeply nested in binary expression is found', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{
          type: 'ReturnStatement',
          argument: {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Literal', value: 1 },
            right: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'x' } },
          },
        }],
      }))
      expect(reports.length).toBe(0)
    })

    test('await inside try-catch is found', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{
          type: 'TryStatement',
          block: {
            type: 'BlockStatement',
            body: [{
              type: 'ExpressionStatement',
              expression: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'p' } },
            }],
          },
        }],
      }))
      expect(reports.length).toBe(0)
    })

    test('nested arrow with await does NOT count for outer function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{
          type: 'ReturnStatement',
          argument: {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'x' } },
          },
        }],
      }))
      expect(reports.length).toBe(1)
    })

    test('nested FunctionExpression with await does NOT count for outer function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'FunctionExpression',
              id: null,
              params: [],
              body: {
                type: 'BlockStatement',
                body: [{
                  type: 'ExpressionStatement',
                  expression: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'x' } },
                }],
              },
            },
            arguments: [],
          },
        }],
      }))
      expect(reports.length).toBe(1)
    })

    test('nested FunctionDeclaration with await does NOT count for outer function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{
          type: 'FunctionDeclaration',
          id: { type: 'Identifier', name: 'inner' },
          params: [],
          body: {
            type: 'BlockStatement',
            body: [{
              type: 'ExpressionStatement',
              expression: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'x' } },
            }],
          },
        }],
      }))
      expect(reports.length).toBe(1)
    })

    test('await in switch case is found', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{
          type: 'SwitchStatement',
          discriminant: { type: 'Identifier', name: 'x' },
          cases: [{
            type: 'SwitchCase',
            test: { type: 'Literal', value: 1 },
            consequent: [{
              type: 'ExpressionStatement',
              expression: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'p' } },
            }],
          }],
        }],
      }))
      expect(reports.length).toBe(0)
    })

    test('await in for loop is found', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{
          type: 'ForStatement',
          init: { type: 'VariableDeclaration', declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'i' }, init: { type: 'Literal', value: 0 } }], kind: 'let' },
          test: { type: 'BinaryExpression', operator: '<', left: { type: 'Identifier', name: 'i' }, right: { type: 'Literal', value: 10 } },
          body: {
            type: 'BlockStatement',
            body: [{
              type: 'ExpressionStatement',
              expression: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'p' } },
            }],
          },
        }],
      }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (12) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const v1 = noUnnecessaryAsyncRule.create(ctx1)
      const v2 = noUnnecessaryAsyncRule.create(ctx2)
      v1.FunctionDeclaration(makeAsyncFunctionDecl({ type: 'BlockStatement', body: [] }))
      v2.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        async: false,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('accumulation across multiple FunctionDeclaration calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({ type: 'BlockStatement', body: [] }))
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({ type: 'BlockStatement', body: [] }))
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({ type: 'BlockStatement', body: [] }))
      expect(reports.length).toBe(3)
    })

    test('accumulation across multiple ArrowFunctionExpression calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression(makeAsyncArrow({ type: 'Literal', value: 1 }))
      visitor.ArrowFunctionExpression(makeAsyncArrow({ type: 'Literal', value: 2 }))
      expect(reports.length).toBe(2)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({ type: 'BlockStatement', body: [] }))
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        async: false,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 3, 1),
      })
      visitor.ArrowFunctionExpression(makeAsyncArrow({ type: 'Literal', value: 42 }))
      visitor.ArrowFunctionExpression({
        type: 'ArrowFunctionExpression',
        async: true,
        params: [],
        body: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'x' } },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        async: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('handles node as empty object gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration({})
      expect(reports.length).toBe(0)
    })

    test('function with params still checked correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        async: true,
        params: [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(1)
    })

    test('multiple calls with same node report each time', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      const node = makeAsyncFunctionDecl({ type: 'BlockStatement', body: [] })
      visitor.FunctionDeclaration(node)
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(2)
    })

    test('function and arrow messages are different', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const v1 = noUnnecessaryAsyncRule.create(ctx1)
      const v2 = noUnnecessaryAsyncRule.create(ctx2)
      v1.FunctionDeclaration(makeAsyncFunctionDecl({ type: 'BlockStatement', body: [] }))
      v2.ArrowFunctionExpression(makeAsyncArrow({ type: 'Literal', value: 42 }))
      expect(rep1[0].message).not.toBe(rep2[0].message)
    })

    test('all FunctionDeclaration reports have same message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({ type: 'BlockStatement', body: [] }))
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: 42 } }],
      }))
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('all ArrowFunctionExpression reports have same message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression(makeAsyncArrow({ type: 'BlockStatement', body: [] }))
      visitor.ArrowFunctionExpression(makeAsyncArrow({ type: 'Literal', value: 42 }))
      const messages = reports.map(r => r.message)
      expect(new Set(messages).size).toBe(1)
    })

    test('visitor does not have IfStatement handler', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      expect(visitor).not.toHaveProperty('IfStatement')
    })
  })

  // ===== ADDITIONAL COVERAGE (14) =====
  describe('additional coverage', () => {
    test('visitor does not have ForStatement handler', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      expect(visitor).not.toHaveProperty('ForStatement')
    })

    test('visitor does not have ExpressionStatement handler', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      expect(visitor).not.toHaveProperty('ExpressionStatement')
    })

    test('meta is same reference across accesses', () => {
      const m1 = noUnnecessaryAsyncRule.meta
      const m2 = noUnnecessaryAsyncRule.meta
      expect(m1).toBe(m2)
    })

    test('async function with try-catch (no await) reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{
          type: 'TryStatement',
          block: { type: 'BlockStatement', body: [] },
          handler: {
            type: 'CatchClause',
            param: { type: 'Identifier', name: 'e' },
            body: { type: 'BlockStatement', body: [] },
          },
        }],
      }))
      expect(reports.length).toBe(1)
    })

    test('async function with while loop (no await) reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{
          type: 'WhileStatement',
          test: { type: 'Identifier', name: 'x' },
          body: { type: 'BlockStatement', body: [] },
        }],
      }))
      expect(reports.length).toBe(1)
    })

    test('async function with switch (no await) reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{
          type: 'SwitchStatement',
          discriminant: { type: 'Identifier', name: 'x' },
          cases: [],
        }],
      }))
      expect(reports.length).toBe(1)
    })

    test('async function with throw (no await) reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{
          type: 'ThrowStatement',
          argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' }, arguments: [] },
        }],
      }))
      expect(reports.length).toBe(1)
    })

    test('async arrow with throw (no await) reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression(makeAsyncArrow({
        type: 'BlockStatement',
        body: [{
          type: 'ThrowStatement',
          argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' }, arguments: [] },
        }],
      }))
      expect(reports.length).toBe(1)
    })

    test('async function with ternary expression (no await) reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression(makeAsyncArrow({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: 1 },
        alternate: { type: 'Literal', value: 2 },
      }))
      expect(reports.length).toBe(1)
    })

    test('async function with generator flag and no await reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        async: true,
        generator: true,
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(1)
    })

    test('async function body as string does not crash', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        async: true,
        params: [],
        body: 'not-an-ast-node',
        loc: makeLoc(1, 0, 3, 1),
      })
      expect(reports.length).toBe(1)
    })

    test('async arrow with call expression body (no await) reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.ArrowFunctionExpression(makeAsyncArrow({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('async function with deeply nested binary expression (no await) reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({
        type: 'BlockStatement',
        body: [{
          type: 'ReturnStatement',
          argument: {
            type: 'BinaryExpression',
            operator: '+',
            left: {
              type: 'BinaryExpression',
              operator: '*',
              left: { type: 'Literal', value: 2 },
              right: { type: 'Literal', value: 3 },
            },
            right: { type: 'Literal', value: 1 },
          },
        }],
      }))
      expect(reports.length).toBe(1)
    })

    test('mixed positive and negative across both visitors', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionDecl({ type: 'BlockStatement', body: [] }))
      visitor.ArrowFunctionExpression(makeAsyncArrow({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'x' } }))
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'bar' },
        async: true,
        params: [],
        body: {
          type: 'BlockStatement',
          body: [{ type: 'ExpressionStatement', expression: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'y' } } }],
        },
        loc: makeLoc(1, 0, 3, 1),
      })
      visitor.ArrowFunctionExpression(makeAsyncArrow({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(2)
    })
  })
})

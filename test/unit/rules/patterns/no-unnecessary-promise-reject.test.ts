import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryPromiseRejectRule } from '../../../../src/rules/patterns/no-unnecessary-promise-reject.js'
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

function makePromiseRejectStmt(
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'Promise' },
        property: { type: 'Identifier', name: 'reject' },
      },
      arguments: args,
      loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
    },
  }
}

function makeExprStmt(expression: unknown): unknown {
  return {
    type: 'ExpressionStatement',
    expression,
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-promise-reject rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryPromiseRejectRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryPromiseRejectRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryPromiseRejectRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryPromiseRejectRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryPromiseRejectRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Promise.reject', () => {
      const desc = noUnnecessaryPromiseRejectRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/promise/)
      expect(desc).toMatch(/reject/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryPromiseRejectRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-promise-reject.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryPromiseRejectRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ExpressionStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      expect(visitor).toHaveProperty('ExpressionStatement')
      expect(typeof visitor.ExpressionStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryPromiseRejectRule).toBeDefined()
      expect(noUnnecessaryPromiseRejectRule.meta).toBeDefined()
      expect(noUnnecessaryPromiseRejectRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary Promise.reject', () => {
    test('reports for Promise.reject(new Error("fail"))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt([
        { type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' }, arguments: [{ type: 'Literal', value: 'fail' }] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject("error")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt([
        { type: 'Literal', value: 'error' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject(err)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt([
        { type: 'Identifier', name: 'err' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt([]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt([
        { type: 'Literal', value: null },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt([
        { type: 'Literal', value: 0 },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject(false)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt([
        { type: 'Literal', value: false },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject({ message: "fail" })', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt([
        { type: 'ObjectExpression', properties: [{ type: 'Property', key: { type: 'Identifier', name: 'message' }, value: { type: 'Literal', value: 'fail' } }] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject(new CustomError())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt([
        { type: 'NewExpression', callee: { type: 'Identifier', name: 'CustomError' }, arguments: [] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject(someVar)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt([
        { type: 'Identifier', name: 'someVar' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Promise.reject', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt())
      expect(reports[0].message).toMatch(/Promise\.reject/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt())
      expect(reports[0].message).toBe(
        'Unnecessary Promise.reject() as a statement. The rejected promise is discarded and may cause an unhandled rejection. Throw an error instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      const callNode = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'reject' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement({ type: 'ExpressionStatement', expression: callNode })
      expect(reports[0].node).toBe(callNode)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt([], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt())
      visitor.ExpressionStatement(makePromiseRejectStmt([{ type: 'Literal', value: 'err' }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt())
      visitor.ExpressionStatement(makePromiseRejectStmt([{ type: 'Literal', value: 'err' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for Promise.reject with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt([
        { type: 'MemberExpression', object: { type: 'Identifier', name: 'err' }, property: { type: 'Identifier', name: 'message' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject with call expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt([
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'getError' }, arguments: [] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt([
        { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt([
        { type: 'TemplateLiteral', quasis: [], expressions: [] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Promise.reject with conditional expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt([
        { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.reject with spread element argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt([
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'errors' } },
      ]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (50) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      expect(() => visitor.ExpressionStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      expect(() => visitor.ExpressionStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      expect(() => visitor.ExpressionStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      expect(() => visitor.ExpressionStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      expect(() => visitor.ExpressionStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      expect(() => visitor.ExpressionStatement(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({ type: 'ExpressionStatement', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({ type: 'ExpressionStatement', expression: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is not an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({ type: 'ExpressionStatement', expression: 'string', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is not a CallExpression (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'foo' }))
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is not a CallExpression (Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is a BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'BinaryExpression', operator: '+', left: {}, right: {} }))
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is an UpdateExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'x' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is an UnaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {} }))
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is an AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'CallExpression', callee: { type: 'Identifier', name: 'reject' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression (CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        arguments: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does not report for someObj.reject(x) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'someObj' },
            property: { type: 'Identifier', name: 'reject' },
          },
          arguments: [{ type: 'Literal', value: 'err' }],
        },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MyPromise.reject(x) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'MyPromise' },
            property: { type: 'Identifier', name: 'reject' },
          },
          arguments: [],
        },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.resolve(x) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Promise' },
            property: { type: 'Identifier', name: 'resolve' },
          },
          arguments: [],
        },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.all() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Promise' },
            property: { type: 'Identifier', name: 'all' },
          },
          arguments: [],
        },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.race() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Promise' },
            property: { type: 'Identifier', name: 'race' },
          },
          arguments: [],
        },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.then() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Promise' },
            property: { type: 'Identifier', name: 'then' },
          },
          arguments: [],
        },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for "promise" (lowercase) as object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'promise' },
            property: { type: 'Identifier', name: 'reject' },
          },
          arguments: [],
        },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for "PROMISE" (uppercase) as object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'PROMISE' },
            property: { type: 'Identifier', name: 'reject' },
          },
          arguments: [],
        },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for "Reject" (capitalized) as property name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Promise' },
            property: { type: 'Identifier', name: 'Reject' },
          },
          arguments: [],
        },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier (Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Promise' },
            property: { type: 'Literal', value: 'reject' },
          },
          arguments: [],
        },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            property: { type: 'Identifier', name: 'reject' },
          },
          arguments: [],
        },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: null,
            property: { type: 'Identifier', name: 'reject' },
          },
          arguments: [],
        },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Promise' },
          },
          arguments: [],
        },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Promise' },
            property: null,
          },
          arguments: [],
        },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not an Identifier (MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } },
            property: { type: 'Identifier', name: 'reject' },
          },
          arguments: [],
        },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is not an Identifier (CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
            property: { type: 'Identifier', name: 'reject' },
          },
          arguments: [],
        },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.reject().catch(fn) — chained with catch', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'Promise' },
                property: { type: 'Identifier', name: 'reject' },
              },
              arguments: [{ type: 'Literal', value: 'err' }],
            },
            property: { type: 'Identifier', name: 'catch' },
          },
          arguments: [{ type: 'Identifier', name: 'handler' }],
        },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.reject().then(fn, fn) — chained with then', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'Promise' },
                property: { type: 'Identifier', name: 'reject' },
              },
              arguments: [{ type: 'Literal', value: 'err' }],
            },
            property: { type: 'Identifier', name: 'then' },
          },
          arguments: [{ type: 'Identifier', name: 'onFulfilled' }, { type: 'Identifier', name: 'onRejected' }],
        },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for throw new Error() — ThrowStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({
        type: 'ThrowStatement',
        argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' }, arguments: [{ type: 'Literal', value: 'fail' }] },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({ type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'foo' }, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for WhileStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({ type: 'WhileStatement', test: {}, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ForStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({ type: 'ForStatement', init: null, test: null, update: null, body: {}, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for SwitchStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({ type: 'SwitchStatement', discriminant: {}, cases: [], loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for TryStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({ type: 'TryStatement', block: { type: 'BlockStatement', body: [] }, handler: null, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a Literal (not Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Literal', value: 'Promise' },
            property: { type: 'Identifier', name: 'reject' },
          },
          arguments: [],
        },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ClassDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement({ type: 'ClassDeclaration', id: { type: 'Identifier', name: 'Foo' }, body: { type: 'ClassBody', body: [] }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (10) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryPromiseRejectRule.create(ctx1)
      const visitor2 = noUnnecessaryPromiseRejectRule.create(ctx2)
      visitor1.ExpressionStatement(makePromiseRejectStmt())
      visitor2.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Promise' },
            property: { type: 'Identifier', name: 'resolve' },
          },
          arguments: [],
        },
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed valid/invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt())
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Promise' },
            property: { type: 'Identifier', name: 'resolve' },
          },
          arguments: [],
        },
      })
      visitor.ExpressionStatement(makePromiseRejectStmt([{ type: 'Literal', value: 'err' }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Promise' },
            property: { type: 'Identifier', name: 'reject' },
          },
          arguments: [],
        },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Promise' },
            property: { type: 'Identifier', name: 'reject' },
          },
          arguments: [],
        },
      }
      visitor.ExpressionStatement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'Promise' },
            property: { type: 'Identifier', name: 'reject' },
          },
          arguments: [],
          loc: makeLoc(1, 0, 1, 20),
          range: [0, 20],
          extra: true,
          trailingComments: [],
        },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      const node = makePromiseRejectStmt()
      visitor.ExpressionStatement(node)
      visitor.ExpressionStatement(node)
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryPromiseRejectRule.create(context)
      const visitor2 = noUnnecessaryPromiseRejectRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryPromiseRejectRule.meta
      const meta2 = noUnnecessaryPromiseRejectRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryPromiseRejectRule).toBeDefined()
      expect(typeof noUnnecessaryPromiseRejectRule.create).toBe('function')
      expect(typeof noUnnecessaryPromiseRejectRule.meta).toBe('object')
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseRejectRule.create(context)
      visitor.ExpressionStatement(makePromiseRejectStmt([], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })
  })
})

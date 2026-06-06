import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryAsyncFunctionRule } from '../../../../src/rules/patterns/no-unnecessary-async-function.js'
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
    getSource: () => 'async function foo() { return x; }',
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

function makeAsyncFunctionNode(bodyStatements: unknown[]): unknown {
  return {
    type: 'FunctionDeclaration',
    async: true,
    id: { type: 'Identifier', name: 'foo' },
    body: {
      type: 'BlockStatement',
      body: bodyStatements,
    },
    loc: makeLoc(1, 0, 1, 10),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-async-function rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryAsyncFunctionRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryAsyncFunctionRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryAsyncFunctionRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryAsyncFunctionRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryAsyncFunctionRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning async', () => {
      const desc = noUnnecessaryAsyncFunctionRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/async/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryAsyncFunctionRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-async-function',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryAsyncFunctionRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with FunctionDeclaration', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      expect(visitor).toHaveProperty('FunctionDeclaration')
      expect(typeof visitor.FunctionDeclaration).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryAsyncFunctionRule).toBeDefined()
      expect(noUnnecessaryAsyncFunctionRule.meta).toBeDefined()
      expect(noUnnecessaryAsyncFunctionRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY ASYNC (25) =====

  describe('positive cases — reports unnecessary async', () => {
    test('reports async function with only a return of identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ReturnStatement', argument: { type: 'Identifier', name: 'x' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with empty body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with expression statement (no await)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with variable declaration (no await init)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'VariableDeclaration', kind: 'const', declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' }, init: { type: 'Literal', value: 42 } }] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with return statement having no argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ReturnStatement', argument: null },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with multiple statements none having await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'VariableDeclaration', kind: 'let', declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'a' }, init: { type: 'Literal', value: 1 } }] },
        { type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'log' }, arguments: [] } },
        { type: 'ReturnStatement', argument: { type: 'Identifier', name: 'a' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with only a return of literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ReturnStatement', argument: { type: 'Literal', value: 'hello' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with variable declaration and no init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'VariableDeclaration', kind: 'let', declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' }, init: null }] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with variable declaration and undefined init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'VariableDeclaration', kind: 'let', declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' } }] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with expression statement returning binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ReturnStatement', argument: { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with conditional expression return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ReturnStatement', argument: { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with call expression return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ReturnStatement', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with member expression return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ReturnStatement', argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with object expression return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ReturnStatement', argument: { type: 'ObjectExpression', properties: [] } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with array expression return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ReturnStatement', argument: { type: 'ArrayExpression', elements: [] } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with variable declarations array having non-await init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'VariableDeclaration', kind: 'const', declarations: [
          { type: 'VariableDeclarator', id: { type: 'Identifier', name: 'a' }, init: { type: 'Literal', value: 1 } },
          { type: 'VariableDeclarator', id: { type: 'Identifier', name: 'b' }, init: { type: 'Literal', value: 2 } },
        ] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with expression statement containing assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ExpressionStatement', expression: { type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 } } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with multiple variable declarations none with await', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'VariableDeclaration', kind: 'const', declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' }, init: { type: 'Literal', value: 'a' } }] },
        { type: 'VariableDeclaration', kind: 'const', declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'y' }, init: { type: 'Literal', value: 'b' } }] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with if statement in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'IfStatement', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'BlockStatement', body: [] } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with for loop in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ForStatement', init: null, test: null, update: null, body: { type: 'BlockStatement', body: [] } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with while loop in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'WhileStatement', test: { type: 'Identifier', name: 'x' }, body: { type: 'BlockStatement', body: [] } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with switch statement in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'SwitchStatement', discriminant: { type: 'Identifier', name: 'x' }, cases: [] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with throw statement in body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ThrowStatement', argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' }, arguments: [{ type: 'Literal', value: 'fail' }] } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with try-catch in body (no await)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'TryStatement', block: { type: 'BlockStatement', body: [] }, handler: { type: 'CatchClause', param: { type: 'Identifier', name: 'e' }, body: { type: 'BlockStatement', body: [] } } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with only debugger statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'DebuggerStatement' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('reports async function with return of function expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ReturnStatement', argument: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } } },
      ]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([]))
      expect(reports[0].message).toBe('Unnecessary async function with no await expressions.')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input FunctionDeclaration node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      const node = makeAsyncFunctionNode([])
      visitor.FunctionDeclaration(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(5, 10, 5, 15),
      }
      visitor.FunctionDeclaration(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(3, 0, 7, 1),
      }
      visitor.FunctionDeclaration(node)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([]))
      visitor.FunctionDeclaration(makeAsyncFunctionNode([]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([]))
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ReturnStatement', argument: { type: 'Identifier', name: 'x' } },
      ]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        id: { type: 'Identifier', name: 'bar' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(10, 4, 10, 12),
      }
      visitor.FunctionDeclaration(node)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('report message mentions "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([]))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message mentions "async"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([]))
      expect(reports[0].message).toContain('async')
    })

    test('report message mentions "await"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([]))
      expect(reports[0].message).toContain('await')
    })

    test('reports only once per function even with multiple non-await statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'VariableDeclaration', kind: 'const', declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'a' }, init: { type: 'Literal', value: 1 } }] },
        { type: 'VariableDeclaration', kind: 'const', declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'b' }, init: { type: 'Literal', value: 2 } }] },
        { type: 'ReturnStatement', argument: { type: 'Identifier', name: 'a' } },
      ]))
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      const node = makeAsyncFunctionNode([])
      visitor.FunctionDeclaration(node)
      visitor.FunctionDeclaration(node)
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(3)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report async function with await in return statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ReturnStatement', argument: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'x' } } },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report async function with await in expression statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ExpressionStatement', expression: { type: 'AwaitExpression', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] } } },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report async function with await in variable declaration init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'VariableDeclaration', kind: 'const', declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' }, init: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } } }] },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report non-async function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        async: false,
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report function with async undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration({
        type: 'ArrowFunctionExpression',
        async: true,
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      expect(() => visitor.FunctionDeclaration(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      expect(() => visitor.FunctionDeclaration(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      expect(() => visitor.FunctionDeclaration({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      expect(() => visitor.FunctionDeclaration('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      expect(() => visitor.FunctionDeclaration(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      expect(() => visitor.FunctionDeclaration(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report async function with await in second declaration init', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'VariableDeclaration', kind: 'const', declarations: [
          { type: 'VariableDeclarator', id: { type: 'Identifier', name: 'a' }, init: { type: 'Literal', value: 1 } },
          { type: 'VariableDeclarator', id: { type: 'Identifier', name: 'b' }, init: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'p' } } },
        ] },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report async function with await in second statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'VariableDeclaration', kind: 'const', declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' }, init: { type: 'Literal', value: 1 } }] },
        { type: 'ExpressionStatement', expression: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'y' } } },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report async function with await in return after other statements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'VariableDeclaration', kind: 'const', declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'a' }, init: { type: 'Literal', value: 1 } }] },
        { type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'log' }, arguments: [] } },
        { type: 'ReturnStatement', argument: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'result' } } },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      expect(() => visitor.FunctionDeclaration([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report async function when body is not a BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        async: true,
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'Identifier', name: 'expr' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report async function when body.body is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        async: true,
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: 'not-array' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report async function when body is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        async: true,
        id: { type: 'Identifier', name: 'foo' },
        body: null,
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
      const visitor1 = noUnnecessaryAsyncFunctionRule.create(ctx1)
      const visitor2 = noUnnecessaryAsyncFunctionRule.create(ctx2)
      visitor1.FunctionDeclaration(makeAsyncFunctionNode([]))
      visitor2.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ExpressionStatement', expression: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'x' } } },
      ]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([]))
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ExpressionStatement', expression: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'x' } } },
      ]))
      visitor.FunctionDeclaration(makeAsyncFunctionNode([]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: [] },
      }
      visitor.FunctionDeclaration(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ExpressionStatement', expression: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'x' } } },
      ]))
      visitor.FunctionDeclaration(makeAsyncFunctionNode([]))
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ReturnStatement', argument: { type: 'AwaitExpression', argument: { type: 'Identifier', name: 'y' } } },
      ]))
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ReturnStatement', argument: { type: 'Identifier', name: 'z' } },
      ]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryAsyncFunctionRule.create(context)
      const visitor2 = noUnnecessaryAsyncFunctionRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryAsyncFunctionRule.meta
      const meta2 = noUnnecessaryAsyncFunctionRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      const node = {
        type: 'FunctionDeclaration',
        async: true,
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 5),
        range: [0, 5],
        extra: true,
        generator: false,
      }
      visitor.FunctionDeclaration(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        async: true,
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: [] },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        async: true,
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryAsyncFunctionRule).toBeDefined()
      expect(typeof noUnnecessaryAsyncFunctionRule.create).toBe('function')
      expect(typeof noUnnecessaryAsyncFunctionRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        async: true,
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 5),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when statement type is not ReturnStatement, ExpressionStatement, or VariableDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'BreakStatement' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('async function with async true as string does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        async: 'true',
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('async function with async 1 does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration({
        type: 'FunctionDeclaration',
        async: 1,
        id: { type: 'Identifier', name: 'foo' },
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('VariableDeclaration with non-array declarations still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'VariableDeclaration', kind: 'const', declarations: 'not-array' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('VariableDeclaration with null declaration init still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'VariableDeclaration', kind: 'const', declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' }, init: null }] },
      ]))
      expect(reports.length).toBe(1)
    })

    test('ReturnStatement with undefined argument still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ReturnStatement' },
      ]))
      expect(reports.length).toBe(1)
    })

    test('ExpressionStatement with undefined expression still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryAsyncFunctionRule.create(context)
      visitor.FunctionDeclaration(makeAsyncFunctionNode([
        { type: 'ExpressionStatement' },
      ]))
      expect(reports.length).toBe(1)
    })

  })
})

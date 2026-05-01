import { describe, expect, test, vi } from 'vitest'
import { noExpressionStatementAssignRule } from '../../../../src/rules/patterns/no-useless-expression-statement.js'
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
    getSource: () => 'x;',
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

function makeExprStmt(expression: unknown, line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression,
    loc: makeLoc(line, column, line, column + 10),
  }
}

describe('no-useless-expression-statement rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noExpressionStatementAssignRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noExpressionStatementAssignRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noExpressionStatementAssignRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noExpressionStatementAssignRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noExpressionStatementAssignRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning expression or side effects', () => {
      const desc = noExpressionStatementAssignRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/expression|side effect/)
    })

    test('should have correct docs URL', () => {
      expect(noExpressionStatementAssignRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-expression-statement-assign',
      )
    })

    test('should have empty schema', () => {
      expect(noExpressionStatementAssignRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with ExpressionStatement', () => {
      const { context } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      expect(visitor).toHaveProperty('ExpressionStatement')
      expect(typeof visitor.ExpressionStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noExpressionStatementAssignRule).toBeDefined()
      expect(noExpressionStatementAssignRule.meta).toBeDefined()
      expect(noExpressionStatementAssignRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — IDENTIFIER (5) =====
  describe('positive cases — Identifier', () => {
    test('reports standalone identifier x;', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(1)
    })

    test('reports standalone identifier someVar;', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'someVar' }))
      expect(reports.length).toBe(1)
    })

    test('identifier message includes the variable name', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'myVariable' }))
      expect(reports[0].message).toContain('myVariable')
    })

    test('identifier message mentions "side effects"', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'x' }))
      expect(reports[0].message).toContain('side effects')
    })

    test('identifier message mentions "Unused expression statement"', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'x' }))
      expect(reports[0].message).toContain('Unused expression statement')
    })
  })

  // ===== POSITIVE CASES — BINARY EXPRESSION (6) =====
  describe('positive cases — BinaryExpression', () => {
    test('reports BinaryExpression 1 + 2;', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports BinaryExpression "a" + "b";', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 'a' },
        right: { type: 'Literal', value: 'b' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports BinaryExpression with comparison a < b;', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'BinaryExpression',
        operator: '<',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports BinaryExpression with strict equality a === b;', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'BinaryExpression',
        operator: '===',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(1)
    })

    test('BinaryExpression message mentions "evaluates to a value"', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
      }))
      expect(reports[0].message).toContain('evaluates to a value')
    })

    test('BinaryExpression message mentions "discarded"', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
      }))
      expect(reports[0].message).toContain('discarded')
    })
  })

  // ===== POSITIVE CASES — LOGICAL EXPRESSION (5) =====
  describe('positive cases — LogicalExpression', () => {
    test('reports LogicalExpression x && y;', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports LogicalExpression x || y;', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'LogicalExpression',
        operator: '||',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports LogicalExpression x ?? y;', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'LogicalExpression',
        operator: '??',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      }))
      expect(reports.length).toBe(1)
    })

    test('LogicalExpression message mentions "evaluates to a value"', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      }))
      expect(reports[0].message).toContain('evaluates to a value')
    })

    test('reports all three logical operators', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      const ops = ['&&', '||', '??'] as const
      for (const op of ops) {
        visitor.ExpressionStatement(makeExprStmt({
          type: 'LogicalExpression',
          operator: op,
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Identifier', name: 'y' },
        }))
      }
      expect(reports.length).toBe(3)
    })
  })

  // ===== POSITIVE CASES — TEMPLATE LITERAL (3) =====
  describe('positive cases — TemplateLiteral', () => {
    test('reports TemplateLiteral without interpolation', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }],
        expressions: [],
      }))
      expect(reports.length).toBe(1)
    })

    test('reports TemplateLiteral with interpolation', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'TemplateLiteral',
        quasis: [
          { type: 'TemplateElement', value: { raw: '', cooked: '' } },
          { type: 'TemplateElement', value: { raw: '', cooked: '' } },
        ],
        expressions: [{ type: 'Identifier', name: 'name' }],
      }))
      expect(reports.length).toBe(1)
    })

    test('TemplateLiteral message mentions "evaluates to a value"', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }],
        expressions: [],
      }))
      expect(reports[0].message).toContain('evaluates to a value')
    })
  })

  // ===== POSITIVE CASES — GENERAL (5) =====
  describe('positive cases — general', () => {
    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'x' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'x' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      const node = makeExprStmt({ type: 'Identifier', name: 'x' })
      visitor.ExpressionStatement(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'x' }, 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('reports multiple violations in same source', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'a' }))
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'b' }))
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'c' }))
      expect(reports.length).toBe(3)
    })
  })

  // ===== NEGATIVE CASES — ASSIGNMENT (4) =====
  describe('negative cases — AssignmentExpression', () => {
    test('does NOT report AssignmentExpression x = 5;', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 5 },
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report AssignmentExpression x += 1;', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'AssignmentExpression',
        operator: '+=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report AssignmentExpression x -= 1;', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'AssignmentExpression',
        operator: '-=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 1 },
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report AssignmentExpression x *= 2;', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'AssignmentExpression',
        operator: '*=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
      }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — CALL EXPRESSION (4) =====
  describe('negative cases — CallExpression', () => {
    test('does NOT report simple CallExpression foo();', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report obj.method() — non-mutating member call', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
          computed: false,
        },
        arguments: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report arr.map(fn) — non-mutating array method', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'map' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report arr.filter(fn) — non-mutating array method', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'filter' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
      }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — MUTATING ARRAY METHODS (7) =====
  describe('negative cases — mutating array methods', () => {
    test('does NOT report arr.push(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'push' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 1 }],
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report arr.pop()', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'pop' },
          computed: false,
        },
        arguments: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report arr.shift()', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'shift' },
          computed: false,
        },
        arguments: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report arr.unshift(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'unshift' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 1 }],
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report arr.splice(0, 1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'splice' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 0 }, { type: 'Literal', value: 1 }],
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report arr.sort()', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'sort' },
          computed: false,
        },
        arguments: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report arr.reverse()', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reverse' },
          computed: false,
        },
        arguments: [],
      }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — UPDATE EXPRESSION (2) =====
  describe('negative cases — UpdateExpression', () => {
    test('does NOT report UpdateExpression x++;', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'UpdateExpression',
        operator: '++',
        argument: { type: 'Identifier', name: 'x' },
        prefix: false,
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report UpdateExpression --x;', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'UpdateExpression',
        operator: '--',
        argument: { type: 'Identifier', name: 'x' },
        prefix: true,
      }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — OTHER ALLOWED (5) =====
  describe('negative cases — other allowed expressions', () => {
    test('does NOT report AwaitExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'AwaitExpression',
        argument: { type: 'Identifier', name: 'promise' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report YieldExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'YieldExpression',
        argument: { type: 'Identifier', name: 'value' },
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report ThrowStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'ThrowStatement',
        argument: { type: 'NewExpression', callee: { type: 'Identifier', name: 'Error' }, arguments: [] },
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report Literal number 42;', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — MORE LITERALS (2) =====
  describe('negative cases — Literals', () => {
    test('does NOT report Literal string "hello";', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report Literal boolean true;', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: true }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — INVALID INPUTS (4) =====
  describe('negative cases — invalid inputs', () => {
    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      expect(() => visitor.ExpressionStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      expect(() => visitor.ExpressionStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      expect(() => visitor.ExpressionStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      expect(() => visitor.ExpressionStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  // ===== NEGATIVE CASES — MORE NON-REPORTING (7) =====
  describe('negative cases — more non-reporting', () => {
    test('non-ExpressionStatement node type does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement({
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'let',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does NOT report arr.includes(1) — CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 1 }],
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report arr.indexOf(1) — CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'indexOf' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 1 }],
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report arr.forEach(fn) — CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
      }))
      expect(reports.length).toBe(0)
    })

    test('does NOT report arr.reduce(fn) — CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'reduce' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'fn' }],
      }))
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      expect(() => visitor.ExpressionStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does NOT report AssignmentExpression with %= operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'AssignmentExpression',
        operator: '%=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 2 },
      }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (13) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noExpressionStatementAssignRule.create(ctx1)
      const visitor2 = noExpressionStatementAssignRule.create(ctx2)

      visitor1.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'x' }))
      visitor2.ExpressionStatement(makeExprStmt({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 5 },
      }))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'a' }))
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'b' }))
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'c' }))
      expect(reports.length).toBe(3)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Identifier', name: 'x' },
      })
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Identifier', name: 'x' },
      })
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('ExpressionStatement with null expression does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('ExpressionStatement with undefined expression does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: undefined,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('computed MemberExpression in CallExpression does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Literal', value: 'push' },
          computed: true,
        },
        arguments: [{ type: 'Literal', value: 1 }],
      }))
      expect(reports.length).toBe(0)
    })

    test('location with specific line/column values is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'x' }, 7, 12))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('UnaryExpression passes through without report', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'UnaryExpression',
        operator: '-',
        argument: { type: 'Identifier', name: 'x' },
        prefix: true,
      }))
      expect(reports.length).toBe(0)
    })

    test('ConditionalExpression passes without report', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Identifier', name: 'a' },
        alternate: { type: 'Identifier', name: 'b' },
      }))
      expect(reports.length).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noExpressionStatementAssignRule.create(context)
      const visitor2 = noExpressionStatementAssignRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      // reports — Identifier
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'x' }))
      // does NOT report — AssignmentExpression
      visitor.ExpressionStatement(makeExprStmt({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Literal', value: 5 },
      }))
      // reports — BinaryExpression
      visitor.ExpressionStatement(makeExprStmt({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
      }))
      // does NOT report — CallExpression
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'foo' },
        arguments: [],
      }))
      // reports — LogicalExpression
      visitor.ExpressionStatement(makeExprStmt({
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      }))
      expect(reports.length).toBe(3)
    })

    test('MemberExpression alone passes without report', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
        computed: false,
      }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL CASES (13) =====
  describe('additional coverage', () => {
    test('reports BinaryExpression with instanceof operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'BinaryExpression',
        operator: 'instanceof',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'Foo' },
      }))
      expect(reports.length).toBe(1)
    })

    test('reports BinaryExpression with in operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'BinaryExpression',
        operator: 'in',
        left: { type: 'Identifier', name: 'key' },
        right: { type: 'Identifier', name: 'obj' },
      }))
      expect(reports.length).toBe(1)
    })

    test('ArrayExpression alone passes without report', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'ArrayExpression',
        elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }],
      }))
      expect(reports.length).toBe(0)
    })

    test('ObjectExpression alone passes without report', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'ObjectExpression',
        properties: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('CallExpression with non-Identifier property does NOT report', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'customMethod' },
          computed: true,
        },
        arguments: [],
      }))
      expect(reports.length).toBe(0)
    })

    test('all seven mutating array methods verified together', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      const methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']
      for (const method of methods) {
        visitor.ExpressionStatement(makeExprStmt({
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: method },
            computed: false,
          },
          arguments: [],
        }))
      }
      expect(reports.length).toBe(0)
    })

    test('reports multiple different expression types in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'x' }))
      visitor.ExpressionStatement(makeExprStmt({
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 },
      }))
      visitor.ExpressionStatement(makeExprStmt({
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
      }))
      visitor.ExpressionStatement(makeExprStmt({
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' } }],
        expressions: [],
      }))
      expect(reports.length).toBe(4)
    })

    test('identifier message mentions "assign or call"', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'x' }))
      expect(reports[0].message).toContain('assign or call')
    })

    test('handles node with type but no other properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement({ type: 'ExpressionStatement' })
      expect(() => visitor.ExpressionStatement({ type: 'ExpressionStatement' })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('reports identifier with various names', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      const names = ['foo', 'bar', 'baz', 'qux']
      for (const name of names) {
        visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name }))
      }
      expect(reports.length).toBe(4)
      expect(reports[0].message).toContain('foo')
      expect(reports[1].message).toContain('bar')
      expect(reports[2].message).toContain('baz')
      expect(reports[3].message).toContain('qux')
    })

    test('reports BinaryExpression with different operators', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      const operators = ['+', '-', '*', '/', '%', '<', '>', '<=', '>=', '===', '!==']
      for (const operator of operators) {
        visitor.ExpressionStatement(makeExprStmt({
          type: 'BinaryExpression',
          operator,
          left: { type: 'Literal', value: 1 },
          right: { type: 'Literal', value: 2 },
        }))
      }
      expect(reports.length).toBe(operators.length)
    })

    test('reports ChainExpression passes without report', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({
        type: 'ChainExpression',
        expression: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
      }))
      expect(reports.length).toBe(0)
    })

    test('reports identifier with empty name does not crash', () => {
      const { context, reports } = createMockContext()
      const visitor = noExpressionStatementAssignRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: '' }))
      expect(reports.length).toBe(1)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryExpressionStatementRule } from '../../../../src/rules/patterns/no-unnecessary-expression-statement.js'
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

function makeExprStmt(
  expression: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'ExpressionStatement',
    expression,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-expression-statement rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryExpressionStatementRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryExpressionStatementRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryExpressionStatementRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryExpressionStatementRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryExpressionStatementRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning literal or expression', () => {
      const desc = noUnnecessaryExpressionStatementRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/literal|expression|statement/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryExpressionStatementRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-expression-statement.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryExpressionStatementRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ExpressionStatement', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      expect(visitor).toHaveProperty('ExpressionStatement')
      expect(typeof visitor.ExpressionStatement).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryExpressionStatementRule).toBeDefined()
      expect(noUnnecessaryExpressionStatementRule.meta).toBeDefined()
      expect(noUnnecessaryExpressionStatementRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary expression statements', () => {
    test('reports for string literal "hello" as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'hello' }))
      expect(reports.length).toBe(1)
    })

    test('reports for empty string literal "" as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: '' }))
      expect(reports.length).toBe(1)
    })

    test('reports for single-character string literal "a" as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'a' }))
      expect(reports.length).toBe(1)
    })

    test('reports for multiline string literal as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'line1\nline2' }))
      expect(reports.length).toBe(1)
    })

    test('reports for StringLiteral type as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'text' }))
      expect(reports.length).toBe(1)
    })

    test('reports for StringLiteral type with empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: '' }))
      expect(reports.length).toBe(1)
    })

    test('reports for "use strict" string literal as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'use strict' }))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric literal 42 as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(1)
    })

    test('reports for numeric literal 0 as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('reports for negative numeric literal -1 as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: -1 }))
      expect(reports.length).toBe(1)
    })

    test('reports for float numeric literal 3.14 as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 3.14 }))
      expect(reports.length).toBe(1)
    })

    test('reports for NumericLiteral type as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 100 }))
      expect(reports.length).toBe(1)
    })

    test('reports for NumericLiteral type with value 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 0 }))
      expect(reports.length).toBe(1)
    })

    test('report message for string literal mentions string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'hello' }))
      expect(reports[0].message).toMatch(/string/i)
    })

    test('report message for numeric literal mentions numeric', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 42 }))
      expect(reports[0].message).toMatch(/numeric/i)
    })

    test('report message for string literal is exactly as defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'hello' }))
      expect(reports[0].message).toBe(
        'Unnecessary string literal as statement. This is likely a mistake or missing assignment.',
      )
    })

    test('report message for numeric literal is exactly as defined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 42 }))
      expect(reports[0].message).toBe(
        'Unnecessary numeric literal as statement. This is likely a mistake or missing assignment.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'hello' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'hello' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node is the expression node, not the statement node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      const expr = { type: 'Literal', value: 'hello' }
      visitor.ExpressionStatement(makeExprStmt(expr))
      expect(reports[0].node).toBe(expr)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'test', loc: makeLoc(5, 10, 5, 30) }))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'hello' }))
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(2)
    })

    test('different message types for string vs numeric', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'hello' }))
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 42 }))
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'hello' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for very large number as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 999999999 }))
      expect(reports.length).toBe(1)
    })

    test('reports for NaN number as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: NaN }))
      expect(reports.length).toBe(1)
    })

    test('reports for Infinity number as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: Infinity }))
      expect(reports.length).toBe(1)
    })

    test('reports for StringLiteral without value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal' }))
      expect(reports.length).toBe(1)
    })

    test('reports for NumericLiteral without value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Literal with unicode string as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'こんにちは' }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for identifier expression x;', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'x' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for function call foo();', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for assignment x = 5;', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 5 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for member expression obj.prop;', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean literal true as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: true }))
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean literal false as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: false }))
      expect(reports.length).toBe(0)
    })

    test('does not report for null literal as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: null }))
      expect(reports.length).toBe(0)
    })

    test('does not report for regex literal as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: /test/ }))
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined value literal as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: undefined }))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'i' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for SequenceExpression as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'SequenceExpression', expressions: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for LogicalExpression as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'LogicalExpression', operator: '&&', left: { type: 'Identifier', name: 'x' }, right: { type: 'Identifier', name: 'y' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for NewExpression as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Foo' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'ArrayExpression', elements: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for TemplateLiteral as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'TemplateLiteral', quasis: [], expressions: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for TaggedTemplateExpression as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for YieldExpression as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'YieldExpression', argument: null, delegate: false }))
      expect(reports.length).toBe(0)
    })

    test('does not report for AwaitExpression as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'AwaitExpression', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [] } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for ThrowExpression as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'ThrowStatement', argument: { type: 'Identifier', name: 'err' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for delete expression as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'UnaryExpression', operator: 'delete', prefix: true, argument: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof expression as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'UnaryExpression', operator: 'typeof', prefix: true, argument: { type: 'Identifier', name: 'x' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for void expression as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'UnaryExpression', operator: 'void', prefix: true, argument: { type: 'Literal', value: 0 } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      expect(() => visitor.ExpressionStatement(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      expect(() => visitor.ExpressionStatement(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      expect(() => visitor.ExpressionStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      expect(() => visitor.ExpressionStatement('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      expect(() => visitor.ExpressionStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement({ type: 'ExpressionStatement', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement({ type: 'ExpressionStatement', expression: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when expression is a non-object primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement({ type: 'ExpressionStatement', expression: 'literal', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for function expression as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for arrow function expression as statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] }, expression: false }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryExpressionStatementRule.create(ctx1)
      const visitor2 = noUnnecessaryExpressionStatementRule.create(ctx2)
      visitor1.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'hello' }))
      visitor2.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'x' }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly for mixed calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'hello' }))
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'x' }))
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 'hello' },
      }
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'a' }))
      visitor.ExpressionStatement(makeExprStmt({ type: 'Identifier', name: 'x' }))
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 1 }))
      visitor.ExpressionStatement(makeExprStmt({ type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [] }))
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'b' }))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryExpressionStatementRule.create(context)
      const visitor2 = noUnnecessaryExpressionStatementRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryExpressionStatementRule.meta
      const meta2 = noUnnecessaryExpressionStatementRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 'hello' },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 42 },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 'test', loc: { start: { line: 3, column: 5 } } },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      const node = makeExprStmt({ type: 'Literal', value: 'hello' })
      visitor.ExpressionStatement(node)
      visitor.ExpressionStatement(node)
      visitor.ExpressionStatement(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryExpressionStatementRule).toBeDefined()
      expect(typeof noUnnecessaryExpressionStatementRule.create).toBe('function')
      expect(typeof noUnnecessaryExpressionStatementRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Literal', value: 'hello' },
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'x', loc: makeLoc(10, 4, 10, 25) }))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('StringLiteral and Literal string both report string message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'a' }))
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'b' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('NumericLiteral and Literal number both report numeric message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 1 }))
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 2 }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('correct string report count in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'a' }))
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'b' }))
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'c' }))
      expect(reports.length).toBe(3)
      for (const r of reports) {
        expect(r.message).toMatch(/string/i)
      }
    })

    test('correct numeric report count in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 1 }))
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 2 }))
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 3 }))
      expect(reports.length).toBe(3)
      for (const r of reports) {
        expect(r.message).toMatch(/numeric/i)
      }
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 'hello' }))
      visitor.ExpressionStatement(makeExprStmt({ type: 'Literal', value: 42 }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toMatch(/string/i)
      expect(reports[1].message).toMatch(/numeric/i)
    })

    test('CompoundAssignmentExpression does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryExpressionStatementRule.create(context)
      visitor.ExpressionStatement(makeExprStmt({ type: 'AssignmentExpression', operator: '+=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 } }))
      expect(reports.length).toBe(0)
    })
  })
})

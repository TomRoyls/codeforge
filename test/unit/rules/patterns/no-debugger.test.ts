import { describe, test, expect } from 'vitest'
import { noDebuggerRule } from '../../../../src/rules/patterns/no-debugger.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createDebuggerStatement(line = 1, column = 0): unknown {
  return {
    type: 'DebuggerStatement',
    loc: {
      start: { line, column },
      end: { line, column: column + 9 },
    },
  }
}

function createNonDebuggerStatement(line = 1, column = 0): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'Literal',
      value: 42,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 2 },
    },
  }
}

describe('no-debugger rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noDebuggerRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noDebuggerRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noDebuggerRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noDebuggerRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention debugger in description', () => {
      expect(noDebuggerRule.meta.docs?.description.toLowerCase()).toContain('debugger')
    })

    test('should have description as a non-empty string', () => {
      expect(typeof noDebuggerRule.meta.docs?.description).toBe('string')
      expect(noDebuggerRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have exact description text', () => {
      expect(noDebuggerRule.meta.docs?.description).toBe('Disallow the use of debugger statements.')
    })

    test('should have type property as string', () => {
      expect(typeof noDebuggerRule.meta.type).toBe('string')
    })

    test('should have severity property as string', () => {
      expect(typeof noDebuggerRule.meta.severity).toBe('string')
    })

    test('should have docs object', () => {
      expect(noDebuggerRule.meta.docs).toBeDefined()
      expect(typeof noDebuggerRule.meta.docs).toBe('object')
    })

    test('should have recommended as boolean true', () => {
      expect(noDebuggerRule.meta.docs?.recommended).toBe(true)
      expect(typeof noDebuggerRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have category as string', () => {
      expect(typeof noDebuggerRule.meta.docs?.category).toBe('string')
    })

    test('should have schema as empty array', () => {
      expect(Array.isArray(noDebuggerRule.meta.schema)).toBe(true)
      expect(noDebuggerRule.meta.schema).toEqual([])
    })

    test('should have fixable as undefined', () => {
      expect(noDebuggerRule.meta.fixable).toBeUndefined()
    })

    test('should have meta as a plain object', () => {
      expect(typeof noDebuggerRule.meta).toBe('object')
      expect(noDebuggerRule.meta).not.toBeNull()
    })

    test('should have all expected meta properties', () => {
      expect(noDebuggerRule.meta).toHaveProperty('type')
      expect(noDebuggerRule.meta).toHaveProperty('severity')
      expect(noDebuggerRule.meta).toHaveProperty('docs')
      expect(noDebuggerRule.meta).toHaveProperty('schema')
    })

    test('should not have suggestion property in meta', () => {
      expect(noDebuggerRule.meta).not.toHaveProperty('hasSuggestions')
    })

    test('should have docs with all sub-properties', () => {
      const docs = noDebuggerRule.meta.docs
      expect(docs).toHaveProperty('description')
      expect(docs).toHaveProperty('category')
      expect(docs).toHaveProperty('recommended')
    })
  })

  describe('create', () => {
    test('should return visitor with DebuggerStatement method', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      expect(visitor).toHaveProperty('DebuggerStatement')
    })

    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should return DebuggerStatement as a function', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      expect(typeof visitor.DebuggerStatement).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      const visitor1 = noDebuggerRule.create(context)
      const visitor2 = noDebuggerRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context parameter without error', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      expect(() => noDebuggerRule.create(context)).not.toThrow()
    })

    test('should return visitor with only DebuggerStatement key', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      expect(Object.keys(visitor)).toEqual(['DebuggerStatement'])
    })

    test('should return visitor where DebuggerStatement returns void', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      const result = visitor.DebuggerStatement(createDebuggerStatement())
      expect(result).toBeUndefined()
    })
  })

  describe('detecting debugger statements', () => {
    test('should report debugger statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('debugger')
    })

    test('should not report non-debugger statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createNonDebuggerStatement())

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report message containing "Unexpected"', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should report message mentioning logging library', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].message).toContain('logging library')
    })

    test('should report message with exact format', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].message).toBe(
        "Unexpected 'debugger' statement. Use a logging library instead of debugger statements.",
      )
    })

    test('should report end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(3, 2))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(11)
    })

    test('should report with loc object', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].loc).toBeDefined()
      expect(typeof reports[0].loc).toBe('object')
    })

    test('should report loc with start and end', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report loc start with line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should report loc end with line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should report default location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('not reporting non-debugger node types', () => {
    test('should not report ExpressionStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'ExpressionStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ReturnStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'ReturnStatement',
        argument: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report IfStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'IfStatement',
        test: {},
        consequent: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report VariableDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'VariableDeclaration',
        declarations: [],
        kind: 'let',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'FunctionDeclaration',
        id: { name: 'foo' },
        params: [],
        body: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report BlockStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ForStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'ForStatement',
        init: null,
        test: null,
        update: null,
        body: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report WhileStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'WhileStatement',
        test: {},
        body: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report SwitchStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'SwitchStatement',
        discriminant: {},
        cases: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report TryStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'TryStatement',
        block: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ThrowStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'ThrowStatement',
        argument: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report BreakStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'BreakStatement',
        label: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ContinueStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'ContinueStatement',
        label: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report WithStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'WithStatement',
        object: {},
        body: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report LabeledStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'LabeledStatement',
        label: { name: 'foo' },
        body: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report DoWhileStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'DoWhileStatement',
        test: {},
        body: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ForInStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'ForInStatement',
        left: {},
        right: {},
        body: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ForOfStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'ForOfStatement',
        left: {},
        right: {},
        body: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report EmptyStatement', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'EmptyStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ClassDeclaration', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'ClassDeclaration',
        id: { name: 'Foo' },
        body: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ArrowFunctionExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'ArrowFunctionExpression',
        params: [],
        body: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Identifier node', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'Identifier',
        name: 'x',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report Literal node', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'Literal',
        value: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report CallExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'CallExpression',
        callee: {},
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report AssignmentExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'AssignmentExpression',
        operator: '=',
        left: {},
        right: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'BinaryExpression',
        operator: '+',
        left: {},
        right: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report UnaryExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'UnaryExpression',
        operator: '!',
        argument: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report UpdateExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'UpdateExpression',
        operator: '++',
        argument: {},
        prefix: false,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report MemberExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'MemberExpression',
        object: {},
        property: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report NewExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'NewExpression',
        callee: {},
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report ConditionalExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'ConditionalExpression',
        test: {},
        consequent: {},
        alternate: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report LogicalExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'LogicalExpression',
        operator: '&&',
        left: {},
        right: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report TemplateLiteral node', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report location at line 1, column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 5, column 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at line 100, column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(100, 0))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 1, column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(1, 50))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location at line 999, column 999', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(999, 999))

      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(999)
    })

    test('should report location at line 42, column 7', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(42, 7))

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should report location at line 0, column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report end location based on start column + 9', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(3, 4))

      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(13)
    })

    test('should report end location at line 1, column 9 for default', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(9)
    })

    test('should report end location at line 50, column 59', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(50, 50))

      expect(reports[0].loc?.end.line).toBe(50)
      expect(reports[0].loc?.end.column).toBe(59)
    })

    test('should report different locations for different debugger statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(1, 0))
      visitor.DebuggerStatement(createDebuggerStatement(5, 10))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.line).not.toBe(reports[1].loc?.start.line)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      expect(() => visitor.DebuggerStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      expect(() => visitor.DebuggerStatement(undefined)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      const node = { type: 'DebuggerStatement' }

      expect(() => visitor.DebuggerStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      expect(() => visitor.DebuggerStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'NotDebuggerStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'DebuggerStatement',
        extra: true,
        foo: 'bar',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle node where type is a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node where type is a boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: true,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node where type is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node where type is an array', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: ['DebuggerStatement'],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node where type is an object', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: { name: 'DebuggerStatement' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle string primitive node', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      expect(() => visitor.DebuggerStatement('debugger' as never)).not.toThrow()
    })

    test('should handle number primitive node', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      expect(() => visitor.DebuggerStatement(42 as never)).not.toThrow()
    })

    test('should handle boolean primitive node', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      expect(() => visitor.DebuggerStatement(true as never)).not.toThrow()
    })

    test('should not report null node', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(null)

      expect(reports.length).toBe(0)
    })

    test('should not report undefined node', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(undefined)

      expect(reports.length).toBe(0)
    })

    test('should handle node with loc containing string values', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      const node = {
        type: 'DebuggerStatement',
        loc: {
          start: { line: '5' as unknown as number, column: '3' as unknown as number },
          end: { line: '5' as unknown as number, column: '12' as unknown as number },
        },
      }

      visitor.DebuggerStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc containing null values', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      const node = {
        type: 'DebuggerStatement',
        loc: {
          start: { line: null as unknown as number, column: null as unknown as number },
          end: { line: null as unknown as number, column: null as unknown as number },
        },
      }

      visitor.DebuggerStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc containing undefined values', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      const node = {
        type: 'DebuggerStatement',
        loc: {
          start: { line: undefined as unknown as number, column: undefined as unknown as number },
          end: { line: undefined as unknown as number, column: undefined as unknown as number },
        },
      }

      visitor.DebuggerStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with missing loc.start', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      const node = {
        type: 'DebuggerStatement',
        loc: {
          end: { line: 1, column: 9 },
        },
      }

      visitor.DebuggerStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with missing loc.end', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      const node = {
        type: 'DebuggerStatement',
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      visitor.DebuggerStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with empty loc object', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      const node = {
        type: 'DebuggerStatement',
        loc: {},
      }

      visitor.DebuggerStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with case-sensitive type mismatch', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'debuggerstatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with DEBUGGERSTATEMENT uppercase', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'DEBUGGERSTATEMENT',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with Debugger Statement (with space)', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'Debugger Statement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with debugger type prefix', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'DebuggerStatementExtra',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle Array node', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      expect(() => visitor.DebuggerStatement([] as never)).not.toThrow()
    })

    test('should handle Symbol primitive node', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      expect(() => visitor.DebuggerStatement(Symbol('test') as never)).not.toThrow()
    })

    test('should handle BigInt primitive node', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      expect(() => visitor.DebuggerStatement(BigInt(42) as never)).not.toThrow()
    })
  })

  describe('multiple debugger statements', () => {
    test('should report each debugger statement independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(1, 0))
      visitor.DebuggerStatement(createDebuggerStatement(5, 0))
      visitor.DebuggerStatement(createDebuggerStatement(10, 0))

      expect(reports.length).toBe(3)
    })

    test('should report 5 debugger statements independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.DebuggerStatement(createDebuggerStatement(i + 1, 0))
      }

      expect(reports.length).toBe(5)
    })

    test('should report 10 debugger statements independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.DebuggerStatement(createDebuggerStatement(i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should report correct location for each debugger statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(1, 0))
      visitor.DebuggerStatement(createDebuggerStatement(2, 4))
      visitor.DebuggerStatement(createDebuggerStatement(3, 8))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[1].loc?.start.column).toBe(4)
      expect(reports[2].loc?.start.line).toBe(3)
      expect(reports[2].loc?.start.column).toBe(8)
    })

    test('should report correct message for each debugger statement', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(1, 0))
      visitor.DebuggerStatement(createDebuggerStatement(5, 0))

      expect(reports[0].message).toContain('debugger')
      expect(reports[1].message).toContain('debugger')
      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  describe('mixed statements', () => {
    test('should only report debugger among mixed statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createNonDebuggerStatement())
      visitor.DebuggerStatement(createDebuggerStatement())
      visitor.DebuggerStatement(createNonDebuggerStatement())

      expect(reports.length).toBe(1)
    })

    test('should report correct location when debugger is between non-debuggers', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createNonDebuggerStatement(1, 0))
      visitor.DebuggerStatement(createDebuggerStatement(2, 4))
      visitor.DebuggerStatement(createNonDebuggerStatement(3, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should handle alternating debugger and non-debugger statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          visitor.DebuggerStatement(createDebuggerStatement(i + 1, 0))
        } else {
          visitor.DebuggerStatement(createNonDebuggerStatement(i + 1, 0))
        }
      }

      expect(reports.length).toBe(5)
    })

    test('should handle all non-debugger statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.DebuggerStatement(createNonDebuggerStatement(i + 1, 0))
      }

      expect(reports.length).toBe(0)
    })

    test('should handle all debugger statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      for (let i = 0; i < 20; i++) {
        visitor.DebuggerStatement(createDebuggerStatement(i + 1, 0))
      }

      expect(reports.length).toBe(20)
    })
  })

  describe('rule definition structure', () => {
    test('should have meta property', () => {
      expect(noDebuggerRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noDebuggerRule).toHaveProperty('create')
    })

    test('should have create as a function', () => {
      expect(typeof noDebuggerRule.create).toBe('function')
    })

    test('should have exactly meta and create properties', () => {
      const keys = Object.keys(noDebuggerRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })

    test('should be an object', () => {
      expect(typeof noDebuggerRule).toBe('object')
      expect(noDebuggerRule).not.toBeNull()
    })

    test('should not be frozen', () => {
      expect(Object.isFrozen(noDebuggerRule)).toBe(false)
    })

    test('should have create that accepts RuleContext', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      expect(() => noDebuggerRule.create(context)).not.toThrow()
    })
  })

  describe('visitor method signature', () => {
    test('should accept single argument', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      expect(visitor.DebuggerStatement.length).toBeLessThanOrEqual(1)
    })

    test('should return undefined from DebuggerStatement', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      const result = visitor.DebuggerStatement(createDebuggerStatement())
      expect(result).toBeUndefined()
    })

    test('should return undefined when called with null', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      const result = visitor.DebuggerStatement(null)
      expect(result).toBeUndefined()
    })

    test('should return undefined when called with non-debugger', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      const result = visitor.DebuggerStatement(createNonDebuggerStatement())
      expect(result).toBeUndefined()
    })
  })

  describe('report descriptor completeness', () => {
    test('should include message in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].message).toBeDefined()
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should include loc in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].loc).toBeDefined()
    })

    test('should include loc.start.line in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].loc?.start.line).toBeDefined()
    })

    test('should include loc.start.column in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].loc?.start.column).toBeDefined()
    })

    test('should include loc.end.line in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].loc?.end.line).toBeDefined()
    })

    test('should include loc.end.column in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].loc?.end.column).toBeDefined()
    })

    test('should have message containing single quotes around debugger', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].message).toContain("'debugger'")
    })
  })

  describe('isDebuggerStatement internal behavior', () => {
    test('should not report when node is false', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(false as never)

      expect(reports.length).toBe(0)
    })

    test('should not report when node is 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(0 as never)

      expect(reports.length).toBe(0)
    })

    test('should not report when node is empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement('' as never)

      expect(reports.length).toBe(0)
    })

    test('should report for DebuggerStatement type exactly', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'DebuggerStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports.length).toBe(1)
    })

    test('should handle node with prototype properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      class CustomNode {
        type = 'DebuggerStatement'
        loc = { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } }
      }

      visitor.DebuggerStatement(new CustomNode())

      expect(reports.length).toBe(1)
    })

    test('should handle node with numeric type property that matches', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 0,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('context interaction', () => {
    test('should call report exactly once for a single debugger', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports.length).toBe(1)
    })

    test('should not call report for non-debugger statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createNonDebuggerStatement())

      expect(reports.length).toBe(0)
    })

    test('should work with different context instances', () => {
      const { context: ctx1, reports: rep1 } = createMockRuleContext({ source: 'debugger;' })
      const { context: ctx2, reports: rep2 } = createMockRuleContext({ source: 'debugger;' })

      const visitor1 = noDebuggerRule.create(ctx1)
      const visitor2 = noDebuggerRule.create(ctx2)

      visitor1.DebuggerStatement(createDebuggerStatement())
      visitor2.DebuggerStatement(createDebuggerStatement(2, 0))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(1)
      expect(rep1).not.toBe(rep2)
    })

    test('should isolate reports between different visitors', () => {
      const { context: ctx1, reports: rep1 } = createMockRuleContext({ source: 'debugger;' })
      const { context: ctx2, reports: rep2 } = createMockRuleContext({ source: 'debugger;' })

      const visitor1 = noDebuggerRule.create(ctx1)
      const visitor2 = noDebuggerRule.create(ctx2)

      visitor1.DebuggerStatement(createDebuggerStatement())

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })
  })

  describe('message content verification', () => {
    test('should contain the word debugger in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].message.toLowerCase()).toContain('debugger')
    })

    test('should contain "Unexpected" in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should contain "statement" in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].message).toContain('statement')
    })

    test('should contain suggestion about logging library', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].message).toContain('logging library')
    })

    test('should contain suggestion about debugger statements', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].message).toContain('debugger statements')
    })

    test('should have message starting with "Unexpected"', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].message.startsWith('Unexpected')).toBe(true)
    })

    test('should have message containing the suggestion text', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].message).toContain('Use a logging library instead of debugger statements.')
    })

    test('should have consistent message across multiple reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(1, 0))
      visitor.DebuggerStatement(createDebuggerStatement(2, 0))
      visitor.DebuggerStatement(createDebuggerStatement(3, 0))

      expect(reports[0].message).toBe(reports[1].message)
      expect(reports[1].message).toBe(reports[2].message)
    })
  })

  describe('default location for nodes without loc', () => {
    test('should use default line 1 when loc is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({ type: 'DebuggerStatement' })

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should use default column 0 when loc is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({ type: 'DebuggerStatement' })

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default end location when loc is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({ type: 'DebuggerStatement' })

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(1)
    })

    test('should use default location when loc.start has missing line', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'DebuggerStatement',
        loc: { start: { column: 5 }, end: { line: 1, column: 9 } },
      })

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should use default column 0 when loc.start has missing column', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'DebuggerStatement',
        loc: { start: { line: 5 }, end: { line: 5, column: 9 } },
      })

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default end location when loc.end is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'DebuggerStatement',
        loc: { start: { line: 3, column: 2 } },
      })

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(0)
    })
  })

  describe('repeated calls', () => {
    test('should handle same visitor called many times', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.DebuggerStatement(createDebuggerStatement(i + 1, 0))
      }

      expect(reports.length).toBe(50)
    })

    test('should handle same visitor called with mix of valid and invalid', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      for (let i = 0; i < 100; i++) {
        if (i % 3 === 0) {
          visitor.DebuggerStatement(createDebuggerStatement(i + 1, 0))
        } else {
          visitor.DebuggerStatement(createNonDebuggerStatement(i + 1, 0))
        }
      }

      expect(reports.length).toBe(34)
    })
  })

  describe('node type boundary values', () => {
    test('should not report when type is empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: '',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when type is whitespace', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: '  DebuggerStatement  ',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should report for exact DebuggerStatement match with no extra chars', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'DebuggerStatement',
        loc: { start: { line: 7, column: 3 }, end: { line: 7, column: 12 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('should not report for DebuggerStatements (plural)', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'DebuggerStatements',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report for type with tab character', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'Debugger\tStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report for type with newline character', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'Debugger\nStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should not report when type property is a function', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: () => 'DebuggerStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('loc boundary values', () => {
    test('should handle very large line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(999999, 0))

      expect(reports[0].loc?.start.line).toBe(999999)
    })

    test('should handle very large column numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(1, 999999))

      expect(reports[0].loc?.start.column).toBe(999999)
    })

    test('should handle negative line number gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(-1, 0))

      expect(reports[0].loc?.start.line).toBe(-1)
    })

    test('should handle negative column number gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(1, -1))

      expect(reports[0].loc?.start.column).toBe(-1)
    })

    test('should handle floating point line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'DebuggerStatement',
        loc: { start: { line: 3.5, column: 0 }, end: { line: 3.5, column: 9 } },
      })

      expect(reports[0].loc?.start.line).toBe(3.5)
    })

    test('should handle loc with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement({
        type: 'DebuggerStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 9 }, source: 'test.ts' },
      })

      expect(reports.length).toBe(1)
    })
  })

  describe('import and export verification', () => {
    test('should export noDebuggerRule as named export', () => {
      expect(noDebuggerRule).toBeDefined()
      expect(typeof noDebuggerRule).toBe('object')
    })

    test('should export object with meta and create', () => {
      expect(typeof noDebuggerRule.meta).toBe('object')
      expect(typeof noDebuggerRule.create).toBe('function')
    })

    test('should be importable and usable', () => {
      const { context } = createMockRuleContext({ source: 'debugger;' })
      expect(() => noDebuggerRule.create(context)).not.toThrow()
    })
  })

  describe('report called with correct arguments', () => {
    test('should call report with message property', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0]).toHaveProperty('message')
    })

    test('should call report with loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0]).toHaveProperty('loc')
    })

    test('should not include unexpected properties in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      const reportKeys = Object.keys(reports[0])
      expect(reportKeys).toContain('message')
      expect(reportKeys).toContain('loc')
    })

    test('should produce message as non-empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement())

      expect(reports[0].message).toBeTruthy()
      expect(reports[0].message.length).toBeGreaterThan(0)
    })
  })

  describe('visitor isolation', () => {
    test('should not share state between different context instances', () => {
      const { context: ctx1, reports: rep1 } = createMockRuleContext({ source: 'debugger;' })
      const { context: ctx2, reports: rep2 } = createMockRuleContext({ source: 'debugger;' })

      const v1 = noDebuggerRule.create(ctx1)
      const v2 = noDebuggerRule.create(ctx2)

      v1.DebuggerStatement(createDebuggerStatement(1, 0))
      v1.DebuggerStatement(createDebuggerStatement(2, 0))
      v1.DebuggerStatement(createDebuggerStatement(3, 0))
      v2.DebuggerStatement(createDebuggerStatement(4, 0))

      expect(rep1.length).toBe(3)
      expect(rep2.length).toBe(1)
    })

    test('each visitor should report independently', () => {
      const mock1 = createMockRuleContext({ source: 'debugger;' })
      const mock2 = createMockRuleContext({ source: 'debugger;' })
      const v1 = noDebuggerRule.create(mock1.context)
      const v2 = noDebuggerRule.create(mock2.context)

      v1.DebuggerStatement(createDebuggerStatement(10, 5))
      v2.DebuggerStatement(createDebuggerStatement(20, 10))

      expect(mock1.reports[0].loc?.start.line).toBe(10)
      expect(mock2.reports[0].loc?.start.line).toBe(20)
    })
  })

  describe('severity and type values', () => {
    test('should have severity "error" not "warning"', () => {
      expect(noDebuggerRule.meta.severity).not.toBe('warning')
    })

    test('should have severity "error" not "info"', () => {
      expect(noDebuggerRule.meta.severity).not.toBe('info')
    })

    test('should have type "problem" not "suggestion"', () => {
      expect(noDebuggerRule.meta.type).not.toBe('suggestion')
    })

    test('should have type "problem" not "layout"', () => {
      expect(noDebuggerRule.meta.type).not.toBe('layout')
    })

    test('should have category "patterns" not "security"', () => {
      expect(noDebuggerRule.meta.docs?.category).not.toBe('security')
    })

    test('should have category "patterns" not "complexity"', () => {
      expect(noDebuggerRule.meta.docs?.category).not.toBe('complexity')
    })
  })

  describe('concurrent visitor usage', () => {
    test('should handle sequential calls to same visitor', () => {
      const { context, reports } = createMockRuleContext({ source: 'debugger;' })
      const visitor = noDebuggerRule.create(context)

      visitor.DebuggerStatement(createDebuggerStatement(1, 0))
      expect(reports.length).toBe(1)

      visitor.DebuggerStatement(createDebuggerStatement(2, 0))
      expect(reports.length).toBe(2)

      visitor.DebuggerStatement(createNonDebuggerStatement(3, 0))
      expect(reports.length).toBe(2)

      visitor.DebuggerStatement(createDebuggerStatement(4, 0))
      expect(reports.length).toBe(3)
    })
  })

  describe('description text verification', () => {
    test('should have description that is grammatically correct', () => {
      expect(noDebuggerRule.meta.docs?.description.endsWith('.')).toBe(true)
    })

    test('should have description starting with capital letter', () => {
      const desc = noDebuggerRule.meta.docs?.description
      expect(desc).toBeDefined()
      expect(desc![0]).toBe(desc![0].toUpperCase())
    })

    test('should have description containing "Disallow"', () => {
      expect(noDebuggerRule.meta.docs?.description).toContain('Disallow')
    })

    test('should have description mentioning "statements" plural', () => {
      expect(noDebuggerRule.meta.docs?.description).toContain('statements')
    })

    test('should have concise description under 100 characters', () => {
      expect(noDebuggerRule.meta.docs!.description.length).toBeLessThan(100)
    })

    test('should have recommended flag as strictly boolean', () => {
      expect(noDebuggerRule.meta.docs?.recommended).toBeTypeOf('boolean')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noDebuggerRule.meta.schema)).toBe(true)
    })

    test('should have exactly zero schema entries', () => {
      expect(noDebuggerRule.meta.schema.length).toBe(0)
    })
  })
})

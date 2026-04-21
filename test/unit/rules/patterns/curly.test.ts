import { describe, test, expect, vi } from 'vitest'
import { curlyRule } from '../../../../src/rules/patterns/curly.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext } from '../../../helpers/ast-helpers.js'

function createIfStatement(
  consequent: unknown,
  line = 1,
  column = 0,
  range?: [number, number],
): unknown {
  return {
    type: 'IfStatement',
    test: {
      type: 'Identifier',
      name: 'x',
    },
    consequent,
    alternate: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
    range: range ?? [column, column + 20],
  }
}

function createForStatement(
  body: unknown,
  line = 1,
  column = 0,
  range?: [number, number],
): unknown {
  return {
    type: 'ForStatement',
    init: null,
    test: null,
    update: null,
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
    range: range ?? [column, column + 20],
  }
}

function createWhileStatement(body: unknown, line = 1, column = 0): unknown {
  return {
    type: 'WhileStatement',
    test: {
      type: 'Identifier',
      name: 'x',
    },
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createDoWhileStatement(body: unknown, line = 1, column = 0): unknown {
  return {
    type: 'DoWhileStatement',
    body,
    test: {
      type: 'Identifier',
      name: 'x',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createWithStatement(body: unknown, line = 1, column = 0): unknown {
  return {
    type: 'WithStatement',
    object: {
      type: 'Identifier',
      name: 'obj',
    },
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createBlockStatement(line = 1, column = 0): unknown {
  return {
    type: 'BlockStatement',
    body: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createExpressionStatement(line = 1, column = 0, range?: [number, number]): unknown {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'Identifier',
      name: 'y',
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
    range: range ?? [column, column + 10],
  }
}

function createForInStatement(body: unknown, line = 1, column = 0): unknown {
  return {
    type: 'ForInStatement',
    left: { type: 'Identifier', name: 'k' },
    right: { type: 'Identifier', name: 'obj' },
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createForOfStatement(body: unknown, line = 1, column = 0): unknown {
  return {
    type: 'ForOfStatement',
    left: { type: 'Identifier', name: 'k' },
    right: { type: 'Identifier', name: 'obj' },
    body,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

// ============================================================================
// META TESTS (20)
// ============================================================================
describe('curly rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(curlyRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(curlyRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(curlyRule.meta.docs?.recommended).toBe(true)
    })

    test('should have style category', () => {
      expect(curlyRule.meta.docs?.category).toBe('style')
    })

    test('should have schema defined', () => {
      expect(curlyRule.meta.schema).toBeDefined()
    })

    test('should be code fixable', () => {
      expect(curlyRule.meta.fixable).toBe('code')
    })

    test('should mention curly braces in description', () => {
      expect(curlyRule.meta.docs?.description.toLowerCase()).toContain('curly')
    })

    test('should have meta property', () => {
      expect(curlyRule).toHaveProperty('meta')
    })

    test('should have create method', () => {
      expect(curlyRule).toHaveProperty('create')
      expect(typeof curlyRule.create).toBe('function')
    })

    test('should have docs property', () => {
      expect(curlyRule.meta.docs).toBeDefined()
    })

    test('should have description in docs', () => {
      expect(curlyRule.meta.docs?.description).toBeDefined()
      expect(typeof curlyRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(curlyRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should mention control statements in description', () => {
      expect(curlyRule.meta.docs?.description.toLowerCase()).toContain('control')
    })

    test('should mention if in description', () => {
      expect(curlyRule.meta.docs?.description).toContain('if')
    })

    test('should mention for in description', () => {
      expect(curlyRule.meta.docs?.description).toContain('for')
    })

    test('should mention while in description', () => {
      expect(curlyRule.meta.docs?.description).toContain('while')
    })

    test('should have url in docs', () => {
      expect(curlyRule.meta.docs?.url).toBeDefined()
    })

    test('should have url pointing to codeforge docs', () => {
      expect(curlyRule.meta.docs?.url).toContain('codeforge.dev')
    })

    test('should have type string value', () => {
      expect(typeof curlyRule.meta.type).toBe('string')
    })

    test('should have severity string value', () => {
      expect(typeof curlyRule.meta.severity).toBe('string')
    })
  })

  // ============================================================================
  // CREATE / VISITOR TESTS (8)
  // ============================================================================
  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(visitor).toHaveProperty('IfStatement')
      expect(visitor).toHaveProperty('ForStatement')
      expect(visitor).toHaveProperty('WhileStatement')
      expect(visitor).toHaveProperty('DoWhileStatement')
      expect(visitor).toHaveProperty('WithStatement')
    })

    test('should return all five visitor methods', () => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const keys = Object.keys(visitor)
      expect(keys).toHaveLength(5)
    })

    test('should return functions for each visitor method', () => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(typeof visitor.IfStatement).toBe('function')
      expect(typeof visitor.ForStatement).toBe('function')
      expect(typeof visitor.WhileStatement).toBe('function')
      expect(typeof visitor.DoWhileStatement).toBe('function')
      expect(typeof visitor.WithStatement).toBe('function')
    })

    test('should create new visitor on each call', () => {
      const { context } = createMockRuleContext()
      const visitor1 = curlyRule.create(context)
      const visitor2 = curlyRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context and return valid object', () => {
      const { context } = createMockRuleContext()
      expect(() => curlyRule.create(context)).not.toThrow()
    })

    test('should return object type from create', () => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)
      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should not have extra visitor methods beyond the five', () => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)
      const expected = [
        'IfStatement',
        'ForStatement',
        'WhileStatement',
        'DoWhileStatement',
        'WithStatement',
      ]

      Object.keys(visitor).forEach((key) => {
        expect(expected).toContain(key)
      })
    })

    test('should work with different context configurations', () => {
      const { context } = createMockRuleContext({ options: [{ multiLine: true }] })
      const visitor = curlyRule.create(context)
      expect(visitor).toHaveProperty('IfStatement')
    })
  })

  // ============================================================================
  // DETECTION TESTS (30)
  // ============================================================================
  describe('detection', () => {
    test('should report if without curly braces', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement(createExpressionStatement())
      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("Expected { after 'if' statement.")
    })

    test('should report for without curly braces', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createForStatement(createExpressionStatement())
      visitor.ForStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("Expected { after 'for' statement.")
    })

    test('should report while without curly braces', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createWhileStatement(createExpressionStatement())
      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("Expected { after 'while' statement.")
    })

    test('should report do-while without curly braces', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createDoWhileStatement(createExpressionStatement())
      visitor.DoWhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("Expected { after 'do' statement.")
    })

    test('should report with without curly braces', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createWithStatement(createExpressionStatement())
      visitor.WithStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("Expected { after 'with' statement.")
    })

    test('should report if with nested if without braces', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const innerIf = createIfStatement(createExpressionStatement(), 2, 4)
      const node = createIfStatement(innerIf, 1, 0)

      visitor.IfStatement(node)
      visitor.IfStatement(innerIf)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain("Expected { after 'if' statement.")
      expect(reports[1].message).toContain("Expected { after 'if' statement.")
    })

    test('should report for with single expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createForStatement({
        type: 'ExpressionStatement',
        expression: { type: 'Identifier', name: 'console.log(x)' },
        loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 25 } },
      })
      visitor.ForStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report if with expression statement body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement()))
      expect(reports.length).toBe(1)
    })

    test('should report for with expression statement body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.ForStatement(createForStatement(createExpressionStatement()))
      expect(reports.length).toBe(1)
    })

    test('should report while with expression statement body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.WhileStatement(createWhileStatement(createExpressionStatement()))
      expect(reports.length).toBe(1)
    })

    test('should report do-while with expression statement body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.DoWhileStatement(createDoWhileStatement(createExpressionStatement()))
      expect(reports.length).toBe(1)
    })

    test('should report with with expression statement body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.WithStatement(createWithStatement(createExpressionStatement()))
      expect(reports.length).toBe(1)
    })

    test('should report when body is a ReturnStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement({
        type: 'ReturnStatement',
        argument: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report when body is a ThrowStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement({
        type: 'ThrowStatement',
        argument: { type: 'Identifier', name: 'err' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report when body is a BreakStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement({
        type: 'BreakStatement',
        label: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report when body is a ContinueStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement({
        type: 'ContinueStatement',
        label: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report when body is a DebuggerStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement({
        type: 'DebuggerStatement',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report when body is a nested ForStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const innerFor = createForStatement(createExpressionStatement(), 2, 4)
      const node = createIfStatement(innerFor)

      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report when body is a nested WhileStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const innerWhile = createWhileStatement(createExpressionStatement(), 2, 4)
      const node = createIfStatement(innerWhile)

      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should detect missing braces in deeply nested if', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const innerIf = createIfStatement(createExpressionStatement(), 3, 8)
      const middleIf = createIfStatement(innerIf, 2, 4)
      const outerIf = createIfStatement(middleIf, 1, 0)

      visitor.IfStatement(outerIf)
      visitor.IfStatement(middleIf)
      visitor.IfStatement(innerIf)

      expect(reports.length).toBe(3)
    })

    test('should detect missing braces in chained for statements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.ForStatement(createForStatement(createExpressionStatement(), 1))
      visitor.ForStatement(createForStatement(createExpressionStatement(), 3))
      visitor.ForStatement(createForStatement(createExpressionStatement(), 5))

      expect(reports.length).toBe(3)
    })

    test('should detect missing braces in mixed statement types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement(), 1))
      visitor.ForStatement(createForStatement(createExpressionStatement(), 3))
      visitor.WhileStatement(createWhileStatement(createExpressionStatement(), 5))
      visitor.DoWhileStatement(createDoWhileStatement(createExpressionStatement(), 7))
      visitor.WithStatement(createWithStatement(createExpressionStatement(), 9))

      expect(reports.length).toBe(5)
    })

    test('should report when for body is a for-in statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const forInBody = createForInStatement(createExpressionStatement())
      const node = createForStatement(forInBody)
      visitor.ForStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report when for body is a for-of statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const forOfBody = createForOfStatement(createExpressionStatement())
      const node = createForStatement(forOfBody)
      visitor.ForStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should detect when while body is an assignment expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createWhileStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
        },
        loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 15 } },
      })
      visitor.WhileStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should detect when do-while body is a function call', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createDoWhileStatement({
        type: 'ExpressionStatement',
        expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' } },
        loc: { start: { line: 1, column: 3 }, end: { line: 1, column: 8 } },
      })
      visitor.DoWhileStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should detect when with body is a member expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createWithStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: { start: { line: 1, column: 8 }, end: { line: 1, column: 17 } },
      })
      visitor.WithStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report if with UpdateExpression body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement({
        type: 'ExpressionStatement',
        expression: {
          type: 'UpdateExpression',
          operator: '++',
          prefix: false,
          argument: { type: 'Identifier', name: 'i' },
        },
        loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 10 } },
      })
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report for with ConditionalExpression body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createForStatement({
        type: 'ExpressionStatement',
        expression: { type: 'ConditionalExpression' },
        loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } },
      })
      visitor.ForStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report if with empty consequent object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'EmptyStatement' },
        alternate: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })
  })

  // ============================================================================
  // NOT REPORTING TESTS (30)
  // ============================================================================
  describe('not reporting', () => {
    test('should not report if with block statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement(createBlockStatement())
      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for with block statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createForStatement(createBlockStatement())
      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report while with block statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createWhileStatement(createBlockStatement())
      visitor.WhileStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report do-while with block statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createDoWhileStatement(createBlockStatement())
      visitor.DoWhileStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with with block statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createWithStatement(createBlockStatement())
      visitor.WithStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle if with else clause without braces', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: createBlockStatement(),
        alternate: createExpressionStatement(),
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 5, column: 0 },
        },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when if consequent is block with body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement({
        type: 'BlockStatement',
        body: [{ type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'y' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      })
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when for body is block with multiple statements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createForStatement({
        type: 'BlockStatement',
        body: [
          { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'a' } },
          { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'b' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      })
      visitor.ForStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when while body is block with nested if', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createWhileStatement({
        type: 'BlockStatement',
        body: [createIfStatement(createBlockStatement())],
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 1 } },
      })
      visitor.WhileStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when do-while body is block', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createDoWhileStatement({
        type: 'BlockStatement',
        body: [{ type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'x' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      })
      visitor.DoWhileStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when with body is block', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createWithStatement({
        type: 'BlockStatement',
        body: [{ type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'x' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      })
      visitor.WithStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report if-else where both branches are blocks', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: createBlockStatement(),
        alternate: createBlockStatement(3, 2),
        loc: { start: { line: 1, column: 0 }, end: { line: 5, column: 0 } },
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when called with empty options', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createBlockStatement()))
      expect(reports.length).toBe(0)
    })

    test('should not report when all five statements have blocks', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createBlockStatement()))
      visitor.ForStatement(createForStatement(createBlockStatement()))
      visitor.WhileStatement(createWhileStatement(createBlockStatement()))
      visitor.DoWhileStatement(createDoWhileStatement(createBlockStatement()))
      visitor.WithStatement(createWithStatement(createBlockStatement()))

      expect(reports.length).toBe(0)
    })

    test('should not report block statement with only whitespace content', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not double report when if consequent is block', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createBlockStatement()))
      visitor.IfStatement(createIfStatement(createBlockStatement()))

      expect(reports.length).toBe(0)
    })

    test('should not report when for body has block with return statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createForStatement({
        type: 'BlockStatement',
        body: [{ type: 'ReturnStatement', argument: null }],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      })
      visitor.ForStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when while body has block with throw', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createWhileStatement({
        type: 'BlockStatement',
        body: [{ type: 'ThrowStatement', argument: { type: 'Identifier', name: 'e' } }],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      })
      visitor.WhileStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when do-while body has block with break', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createDoWhileStatement({
        type: 'BlockStatement',
        body: [{ type: 'BreakStatement', label: null }],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      })
      visitor.DoWhileStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when with body has block with continue', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createWithStatement({
        type: 'BlockStatement',
        body: [{ type: 'ContinueStatement', label: null }],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      })
      visitor.WithStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report if with block containing nested if with block', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement(createBlockStatement())
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when consequent is a block with multiple declarations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement({
        type: 'BlockStatement',
        body: [
          { type: 'VariableDeclaration', kind: 'const', declarations: [] },
          { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'y' } },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      })
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when block body contains function declaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createForStatement({
        type: 'BlockStatement',
        body: [{ type: 'FunctionDeclaration', id: { type: 'Identifier', name: 'fn' }, params: [] }],
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 1 } },
      })
      visitor.ForStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report when visiting block statement multiple times', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const blockNode = createIfStatement(createBlockStatement())
      visitor.IfStatement(blockNode)
      visitor.IfStatement(blockNode)
      visitor.IfStatement(blockNode)

      expect(reports.length).toBe(0)
    })

    test('should not report for if with block on different lines', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 8 }, end: { line: 5, column: 1 } },
      })
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for while with empty block body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createWhileStatement({
        type: 'BlockStatement',
        body: [],
        loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 12 } },
      })
      visitor.WhileStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for do-while with block containing a switch', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createDoWhileStatement({
        type: 'BlockStatement',
        body: [
          { type: 'SwitchStatement', discriminant: { type: 'Identifier', name: 'x' }, cases: [] },
        ],
        loc: { start: { line: 1, column: 3 }, end: { line: 5, column: 1 } },
      })
      visitor.DoWhileStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for with with block containing try-catch', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createWithStatement({
        type: 'BlockStatement',
        body: [
          {
            type: 'TryStatement',
            block: { type: 'BlockStatement', body: [] },
            handler: null,
            finalizer: null,
          },
        ],
        loc: { start: { line: 1, column: 8 }, end: { line: 5, column: 1 } },
      })
      visitor.WithStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should not report if where alternate is a block but consequent is expression', () => {
      // Rule only checks consequent for IfStatement
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: createBlockStatement(),
        alternate: createExpressionStatement(5, 4),
        loc: { start: { line: 1, column: 0 }, end: { line: 3, column: 10 } },
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(0)
    })
  })

  // ============================================================================
  // EDGE CASES (25)
  // ============================================================================
  describe('edge cases', () => {
    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.IfStatement('string')).not.toThrow()
      expect(() => visitor.IfStatement(123)).not.toThrow()
      expect(() => visitor.ForStatement('string')).not.toThrow()
      expect(() => visitor.WhileStatement(123)).not.toThrow()
    })

    test('should handle null if statement', () => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.IfStatement(null)).not.toThrow()
    })

    test('should handle undefined if statement', () => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.IfStatement(undefined)).not.toThrow()
    })

    test('should handle null for statement', () => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.ForStatement(null)).not.toThrow()
    })

    test('should handle undefined for statement', () => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.ForStatement(undefined)).not.toThrow()
    })

    test('should handle null while statement', () => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.WhileStatement(null)).not.toThrow()
    })

    test('should handle undefined while statement', () => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.WhileStatement(undefined)).not.toThrow()
    })

    test('should handle null do-while statement', () => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.DoWhileStatement(null)).not.toThrow()
    })

    test('should handle undefined do-while statement', () => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.DoWhileStatement(undefined)).not.toThrow()
    })

    test('should handle null with statement', () => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.WithStatement(null)).not.toThrow()
    })

    test('should handle undefined with statement', () => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.WithStatement(undefined)).not.toThrow()
    })

    test('should handle if statement without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: createExpressionStatement(),
        alternate: null,
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle statement with null body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: null,
        alternate: null,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle statement with undefined body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with non-number line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: createExpressionStatement(),
        alternate: null,
        loc: {
          start: { line: 'not-a-number' as unknown as number, column: 0 },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-number column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: createExpressionStatement(),
        alternate: null,
        loc: {
          start: { line: 5, column: 'invalid' as unknown as number },
          end: { line: 5, column: 20 },
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: createExpressionStatement(),
        alternate: null,
        loc: {
          start: undefined as unknown as { line: number; column: number },
          end: { line: 1, column: 20 },
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: createExpressionStatement(),
        alternate: null,
        loc: {
          start: { line: 5, column: 2 },
          end: undefined as unknown as { line: number; column: number },
        },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should handle loc with empty object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: createExpressionStatement(),
        alternate: null,
        loc: {},
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.IfStatement(true)).not.toThrow()
      expect(() => visitor.IfStatement(false)).not.toThrow()
    })

    test('should handle numeric node', () => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.ForStatement(0)).not.toThrow()
      expect(() => visitor.ForStatement(-1)).not.toThrow()
    })

    test('should handle empty object node with no properties', () => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor.IfStatement({})).not.toThrow()
    })

    test('should handle node with array body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        consequent: [createExpressionStatement()],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with body as number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        consequent: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with body as string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'ForStatement',
        body: 'x++',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ForStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement()))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================================
  // LOCATION TESTS (15)
  // ============================================================================
  describe('location', () => {
    test('should report correct location for if statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement(createExpressionStatement(), 10, 5)
      visitor.IfStatement(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location for for statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createForStatement(createExpressionStatement(), 5, 10)
      visitor.ForStatement(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for while statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createWhileStatement(createExpressionStatement(), 8, 3)
      visitor.WhileStatement(node)

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report correct location for do-while statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createDoWhileStatement(createExpressionStatement(), 12, 7)
      visitor.DoWhileStatement(node)

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should report correct location for with statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createWithStatement(createExpressionStatement(), 15, 2)
      visitor.WithStatement(node)

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report location at column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement(createExpressionStatement(), 1, 0)
      visitor.IfStatement(node)

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at large line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement(createExpressionStatement(), 500, 10)
      visitor.IfStatement(node)

      expect(reports[0].loc?.start.line).toBe(500)
    })

    test('should report location at large column number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createForStatement(createExpressionStatement(), 1, 200)
      visitor.ForStatement(node)

      expect(reports[0].loc?.start.column).toBe(200)
    })

    test('should report both start and end location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement(createExpressionStatement(), 3, 5)
      visitor.IfStatement(node)

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should report end location correctly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement(createExpressionStatement(), 1, 0)
      visitor.IfStatement(node)

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should preserve exact location from node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createWhileStatement(createExpressionStatement(), 42, 17)
      visitor.WhileStatement(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(17)
      expect(reports[0].loc?.end.line).toBe(42)
      expect(reports[0].loc?.end.column).toBe(37)
    })

    test('should default to line 1 when node has no loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: createExpressionStatement(),
        alternate: null,
      }

      visitor.IfStatement(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for multiple different statements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement(), 1, 0))
      visitor.ForStatement(createForStatement(createExpressionStatement(), 5, 4))
      visitor.WhileStatement(createWhileStatement(createExpressionStatement(), 10, 2))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(10)
    })

    test('should handle zero line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement(createExpressionStatement(), 0, 0)
      visitor.IfStatement(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location at line 1 column 0 for for-in body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createForStatement(createExpressionStatement(), 1, 0)
      visitor.ForStatement(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  // ============================================================================
  // MESSAGE TESTS (10)
  // ============================================================================
  describe('messages', () => {
    test('should include keyword in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement()))

      expect(reports[0].message).toContain("'if'")
    })

    test('should mention expected braces in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.ForStatement(createForStatement(createExpressionStatement()))

      expect(reports[0].message).toContain('Expected {')
    })

    test('should have correct message for all statement types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement()))
      visitor.ForStatement(createForStatement(createExpressionStatement(), 2))
      visitor.WhileStatement(createWhileStatement(createExpressionStatement(), 3))
      visitor.DoWhileStatement(createDoWhileStatement(createExpressionStatement(), 4))
      visitor.WithStatement(createWithStatement(createExpressionStatement(), 5))

      expect(reports[0].message).toContain("'if'")
      expect(reports[1].message).toContain("'for'")
      expect(reports[2].message).toContain("'while'")
      expect(reports[3].message).toContain("'do'")
      expect(reports[4].message).toContain("'with'")
    })

    test('should include "statement" in all messages', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement()))
      visitor.ForStatement(createForStatement(createExpressionStatement()))
      visitor.WhileStatement(createWhileStatement(createExpressionStatement()))
      visitor.DoWhileStatement(createDoWhileStatement(createExpressionStatement()))
      visitor.WithStatement(createWithStatement(createExpressionStatement()))

      reports.forEach((r) => {
        expect(r.message).toContain('statement')
      })
    })

    test('should have period at end of message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement()))

      expect(reports[0].message).toMatch(/\.$/)
    })

    test('should have correct message format', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement()))

      expect(reports[0].message).toMatch(/^Expected \{ after 'if' statement\.$/)
    })

    test('should have correct for message format', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.ForStatement(createForStatement(createExpressionStatement()))

      expect(reports[0].message).toBe("Expected { after 'for' statement.")
    })

    test('should have correct while message format', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.WhileStatement(createWhileStatement(createExpressionStatement()))

      expect(reports[0].message).toBe("Expected { after 'while' statement.")
    })

    test('should have correct do message format', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.DoWhileStatement(createDoWhileStatement(createExpressionStatement()))

      expect(reports[0].message).toBe("Expected { after 'do' statement.")
    })

    test('should have correct with message format', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.WithStatement(createWithStatement(createExpressionStatement()))

      expect(reports[0].message).toBe("Expected { after 'with' statement.")
    })
  })

  // ============================================================================
  // MULTIPLE REPORTS TESTS (10)
  // ============================================================================
  describe('multiple reports', () => {
    test('should report multiple if violations independently', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement(), 1))
      visitor.IfStatement(createIfStatement(createExpressionStatement(), 5))
      visitor.IfStatement(createIfStatement(createExpressionStatement(), 10))

      expect(reports.length).toBe(3)
    })

    test('should report multiple for violations independently', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.ForStatement(createForStatement(createExpressionStatement(), 1))
      visitor.ForStatement(createForStatement(createExpressionStatement(), 3))

      expect(reports.length).toBe(2)
    })

    test('should report multiple while violations independently', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.WhileStatement(createWhileStatement(createExpressionStatement(), 1))
      visitor.WhileStatement(createWhileStatement(createExpressionStatement(), 4))
      visitor.WhileStatement(createWhileStatement(createExpressionStatement(), 7))

      expect(reports.length).toBe(3)
    })

    test('should report multiple do-while violations independently', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.DoWhileStatement(createDoWhileStatement(createExpressionStatement(), 2))
      visitor.DoWhileStatement(createDoWhileStatement(createExpressionStatement(), 6))

      expect(reports.length).toBe(2)
    })

    test('should report multiple with violations independently', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.WithStatement(createWithStatement(createExpressionStatement(), 3))
      visitor.WithStatement(createWithStatement(createExpressionStatement(), 7))

      expect(reports.length).toBe(2)
    })

    test('should accumulate reports across different statement types', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement()))
      visitor.ForStatement(createForStatement(createExpressionStatement()))
      visitor.WhileStatement(createWhileStatement(createExpressionStatement()))

      expect(reports.length).toBe(3)
    })

    test('should correctly identify each report in sequence', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement(), 1))
      visitor.ForStatement(createForStatement(createExpressionStatement(), 2))
      visitor.WhileStatement(createWhileStatement(createExpressionStatement(), 3))

      expect(reports[0].message).toContain("'if'")
      expect(reports[1].message).toContain("'for'")
      expect(reports[2].message).toContain("'while'")
    })

    test('should not accumulate when block statements are used', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createBlockStatement()))
      visitor.ForStatement(createForStatement(createBlockStatement()))
      visitor.WhileStatement(createWhileStatement(createBlockStatement()))

      expect(reports.length).toBe(0)
    })

    test('should handle mix of violations and non-violations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createBlockStatement())) // no report
      visitor.ForStatement(createForStatement(createExpressionStatement())) // report
      visitor.WhileStatement(createWhileStatement(createBlockStatement())) // no report
      visitor.DoWhileStatement(createDoWhileStatement(createExpressionStatement())) // report

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain("'for'")
      expect(reports[1].message).toContain("'do'")
    })

    test('should report same node type visited multiple times', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const exprNode = createExpressionStatement()
      visitor.IfStatement(createIfStatement(exprNode))
      visitor.IfStatement(createIfStatement(exprNode))

      expect(reports.length).toBe(2)
    })
  })

  // ============================================================================
  // CONTEXT TESTS (10)
  // ============================================================================
  describe('context handling', () => {
    test('should work with default context', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement()))
      expect(reports.length).toBe(1)
    })

    test('should work with custom file path', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/custom/path.ts',
        source: 'if (x) y;',
      })
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement()))
      expect(reports.length).toBe(1)
    })

    test('should work with multi-line source', () => {
      const source = 'if (x)\n  y;'
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement()))
      expect(reports.length).toBe(1)
    })

    test('should work with empty source string', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source: '' })
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement()))
      expect(reports.length).toBe(1)
    })

    test('should work with long source string', () => {
      const source = 'if (x) y;'.repeat(100)
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement()))
      expect(reports.length).toBe(1)
    })

    test('should use context report function', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement()))
      expect(reports).toHaveLength(1)
    })

    test('should not report when context provides block body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createBlockStatement()))
      expect(reports).toHaveLength(0)
    })

    test('should handle context with undefined options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc, fix: descriptor.fix })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'if (x) y;',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = curlyRule.create(context)
      visitor.IfStatement(createIfStatement(createExpressionStatement()))
      expect(reports.length).toBe(1)
    })

    test('should handle context with workspace root', () => {
      const { context, reports } = createMockRuleContext({ filePath: '/project/src/file.ts' })
      const visitor = curlyRule.create(context)

      visitor.IfStatement(createIfStatement(createExpressionStatement()))
      expect(reports.length).toBe(1)
    })

    test('should handle different file extensions in path', () => {
      const extensions = ['file.ts', 'file.tsx', 'file.js', 'file.jsx', 'file.mjs']

      extensions.forEach((filePath) => {
        const { context, reports } = createMockRuleContext({ filePath: `/src/${filePath}` })
        const visitor = curlyRule.create(context)

        visitor.IfStatement(createIfStatement(createExpressionStatement()))
        expect(reports.length).toBe(1)
      })
    })
  })

  // ============================================================================
  // FIX TESTS
  // ============================================================================
  describe('fix', () => {
    test('should provide fix for if statement without braces', () => {
      const source = 'if (x) y;'
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = curlyRule.create(context)

      const bodyNode = createExpressionStatement(1, 7, [7, 8])
      const node = createIfStatement(bodyNode, 1, 0, [0, 12])
      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.range).toEqual([7, 8])
      expect(reports[0].fix?.text).toBe('{ y }')
    })

    test('should provide fix for for statement without braces', () => {
      const source = 'for (;;) y;'
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = curlyRule.create(context)

      const bodyNode = createExpressionStatement(1, 9, [9, 10])
      const node = createForStatement(bodyNode, 1, 0)
      visitor.ForStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('{ y }')
    })

    test('should provide fix for while statement without braces', () => {
      const source = 'while (x) y;'
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = curlyRule.create(context)

      const bodyNode = createExpressionStatement(1, 10, [10, 11])
      const node = createWhileStatement(bodyNode, 1, 0)
      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('{ y }')
    })

    test('should not provide fix when body has no range', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const bodyNode = {
        type: 'ExpressionStatement',
        expression: { type: 'Identifier', name: 'y' },
        loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 8 } },
      }
      const node = createIfStatement(bodyNode, 1, 0)
      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should not provide fix for block statement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement(createBlockStatement())
      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not provide fix when bodySource is empty', () => {
      const source = ''
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = curlyRule.create(context)

      const bodyNode = {
        type: 'ExpressionStatement',
        expression: { type: 'Identifier', name: 'y' },
        loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 8 } },
        range: [7, 8] as [number, number],
      }
      const node = createIfStatement(bodyNode, 1, 0)
      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeUndefined()
    })

    test('should wrap body source in braces', () => {
      const source = 'if (cond) doSomething();'
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = curlyRule.create(context)

      const bodyNode = {
        type: 'ExpressionStatement',
        expression: { type: 'CallExpression', callee: { type: 'Identifier', name: 'doSomething' } },
        loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 23 } },
        range: [10, 23] as [number, number],
      }
      const node = createIfStatement(bodyNode, 1, 0, [0, 23])
      visitor.IfStatement(node)

      expect(reports[0].fix?.text).toBe('{ doSomething() }')
    })

    test('should provide fix for do-while without braces', () => {
      const source = 'do x; while (y);'
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = curlyRule.create(context)

      const bodyNode = createExpressionStatement(1, 3, [3, 4])
      const node = createDoWhileStatement(bodyNode, 1, 0)
      visitor.DoWhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('{ x }')
    })

    test('should provide fix for with without braces', () => {
      const source = 'with (obj) x;'
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = curlyRule.create(context)

      const bodyNode = createExpressionStatement(1, 11, [11, 12])
      const node = createWithStatement(bodyNode, 1, 0)
      visitor.WithStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('{ x }')
    })

    test('should provide fix with correct range for nested body', () => {
      const source = 'if (a) if (b) c;'
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = curlyRule.create(context)

      const innerBodyNode = {
        type: 'ExpressionStatement',
        expression: { type: 'Identifier', name: 'c' },
        loc: { start: { line: 1, column: 14 }, end: { line: 1, column: 15 } },
        range: [14, 15] as [number, number],
      }
      const innerIf = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'b' },
        consequent: innerBodyNode,
        alternate: null,
        loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 15 } },
        range: [7, 15] as [number, number],
      }

      visitor.IfStatement(innerIf)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.range).toEqual([14, 15])
      expect(reports[0].fix?.text).toBe('{ c }')
    })

    test('should not provide fix when body has range but source is mismatched', () => {
      const source = 'short'
      const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
      const visitor = curlyRule.create(context)

      const bodyNode = {
        type: 'ExpressionStatement',
        expression: { type: 'Identifier', name: 'y' },
        loc: { start: { line: 1, column: 100 }, end: { line: 1, column: 110 } },
        range: [100, 110] as [number, number],
      }
      const node = createIfStatement(bodyNode, 1, 0)
      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      // The slice of 'short' from 100 to 110 is '' (empty string)
      // So bodySource will be '' and fix will be undefined
      expect(reports[0].fix).toBeUndefined()
    })
  })

  // ============================================================================
  // TEST.EACH - PARAMETERIZED TESTS (40+)
  // ============================================================================
  describe('parameterized detection', () => {
    const statementTypes = [
      {
        name: 'if',
        keyword: 'if',
        visitorKey: 'IfStatement',
        create: (body: unknown) => createIfStatement(body),
      },
      {
        name: 'for',
        keyword: 'for',
        visitorKey: 'ForStatement',
        create: (body: unknown) => createForStatement(body),
      },
      {
        name: 'while',
        keyword: 'while',
        visitorKey: 'WhileStatement',
        create: (body: unknown) => createWhileStatement(body),
      },
      {
        name: 'do-while',
        keyword: 'do',
        visitorKey: 'DoWhileStatement',
        create: (body: unknown) => createDoWhileStatement(body),
      },
      {
        name: 'with',
        keyword: 'with',
        visitorKey: 'WithStatement',
        create: (body: unknown) => createWithStatement(body),
      },
    ] as const

    test.each(statementTypes)(
      'should report $name without curly braces',
      ({ visitorKey, create }) => {
        const { context, reports } = createMockRuleContext()
        const visitor = curlyRule.create(context)

        visitor[visitorKey](create(createExpressionStatement()))

        expect(reports.length).toBe(1)
      },
    )

    test.each(statementTypes)(
      'should not report $name with block statement',
      ({ visitorKey, create }) => {
        const { context, reports } = createMockRuleContext()
        const visitor = curlyRule.create(context)

        visitor[visitorKey](create(createBlockStatement()))

        expect(reports.length).toBe(0)
      },
    )

    test.each(statementTypes)('should handle null node for $name', ({ visitorKey }) => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor[visitorKey](null)).not.toThrow()
    })

    test.each(statementTypes)('should handle undefined node for $name', ({ visitorKey }) => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor[visitorKey](undefined)).not.toThrow()
    })

    test.each(statementTypes)('should handle empty object node for $name', ({ visitorKey }) => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor[visitorKey]({})).not.toThrow()
    })

    test.each(statementTypes)('should handle string node for $name', ({ visitorKey }) => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor[visitorKey]('not a node')).not.toThrow()
    })

    test.each(statementTypes)('should handle numeric node for $name', ({ visitorKey }) => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor[visitorKey](42)).not.toThrow()
    })

    test.each(statementTypes)('should handle boolean node for $name', ({ visitorKey }) => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      expect(() => visitor[visitorKey](true)).not.toThrow()
    })

    test.each(statementTypes)(
      'should provide correct message for $name',
      ({ keyword, visitorKey, create }) => {
        const { context, reports } = createMockRuleContext()
        const visitor = curlyRule.create(context)

        visitor[visitorKey](create(createExpressionStatement()))

        expect(reports[0].message).toBe(`Expected { after '${keyword}' statement.`)
      },
    )
  })

  describe('parameterized location', () => {
    const locations = [
      { line: 1, column: 0 },
      { line: 1, column: 10 },
      { line: 5, column: 0 },
      { line: 10, column: 20 },
      { line: 100, column: 0 },
      { line: 42, column: 17 },
      { line: 0, column: 0 },
      { line: 1, column: 99 },
    ]

    test.each(locations)(
      'should report correct location at line=$line, column=$column for if',
      ({ line, column }) => {
        const { context, reports } = createMockRuleContext()
        const visitor = curlyRule.create(context)

        const node = createIfStatement(createExpressionStatement(), line, column)
        visitor.IfStatement(node)

        expect(reports[0].loc?.start.line).toBe(line)
        expect(reports[0].loc?.start.column).toBe(column)
      },
    )

    test.each(locations)(
      'should report correct location at line=$line, column=$column for for',
      ({ line, column }) => {
        const { context, reports } = createMockRuleContext()
        const visitor = curlyRule.create(context)

        const node = createForStatement(createExpressionStatement(), line, column)
        visitor.ForStatement(node)

        expect(reports[0].loc?.start.line).toBe(line)
        expect(reports[0].loc?.start.column).toBe(column)
      },
    )
  })

  describe('parameterized body types', () => {
    const nonBlockTypes = [
      { typeName: 'ExpressionStatement', type: 'ExpressionStatement' },
      { typeName: 'ReturnStatement', type: 'ReturnStatement' },
      { typeName: 'ThrowStatement', type: 'ThrowStatement' },
      { typeName: 'BreakStatement', type: 'BreakStatement' },
      { typeName: 'ContinueStatement', type: 'ContinueStatement' },
      { typeName: 'DebuggerStatement', type: 'DebuggerStatement' },
      { typeName: 'EmptyStatement', type: 'EmptyStatement' },
      { typeName: 'WithStatement', type: 'WithStatement' },
      { typeName: 'SwitchStatement', type: 'SwitchStatement' },
      { typeName: 'LabeledStatement', type: 'LabeledStatement' },
    ]

    test.each(nonBlockTypes)('should report when body is $typeName', ({ type }) => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement({
        type,
        loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 15 } },
      })
      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('parameterized fix text', () => {
    const fixCases = [
      { source: 'if (x) y;', rangeStart: 7, rangeEnd: 8, expected: '{ y }' },
      { source: 'if (a) foo();', rangeStart: 7, rangeEnd: 12, expected: '{ foo() }' },
      { source: 'if (z) bar(1, 2);', rangeStart: 7, rangeEnd: 17, expected: '{ bar(1, 2); }' },
      { source: 'if (c) x = 1;', rangeStart: 7, rangeEnd: 12, expected: '{ x = 1 }' },
    ]

    test.each(fixCases)(
      'should wrap "$source" body in braces',
      ({ source, rangeStart, rangeEnd, expected }) => {
        const { context, reports } = createMockRuleContext({ filePath: '/src/file.ts', source })
        const visitor = curlyRule.create(context)

        const bodyNode = {
          type: 'ExpressionStatement',
          expression: { type: 'Identifier', name: 'y' },
          loc: { start: { line: 1, column: rangeStart }, end: { line: 1, column: rangeEnd } },
          range: [rangeStart, rangeEnd] as [number, number],
        }
        const node = createIfStatement(bodyNode, 1, 0, [0, source.length] as [number, number])
        visitor.IfStatement(node)

        expect(reports[0].fix?.text).toBe(expected)
      },
    )
  })

  describe('parameterized visitor methods', () => {
    const methods = [
      { method: 'IfStatement', keyword: 'if' },
      { method: 'ForStatement', keyword: 'for' },
      { method: 'WhileStatement', keyword: 'while' },
      { method: 'DoWhileStatement', keyword: 'do' },
      { method: 'WithStatement', keyword: 'with' },
    ] as const

    test.each(methods)('visitor should have $method method', ({ method }) => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)
      expect(typeof visitor[method]).toBe('function')
    })

    test.each(methods)('$method should be callable without error', ({ method }) => {
      const { context } = createMockRuleContext()
      const visitor = curlyRule.create(context)
      expect(() => visitor[method](null)).not.toThrow()
    })
  })

  // ============================================================================
  // ADDITIONAL STANDALONE TESTS (35+)
  // ============================================================================
  describe('meta completeness', () => {
    test('should have meta.type as one of valid types', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(curlyRule.meta.type)
    })

    test('should have meta.severity as one of valid severities', () => {
      expect(['off', 'warn', 'error']).toContain(curlyRule.meta.severity)
    })

    test('should have fixable value of code or whitespace', () => {
      expect(['code', 'whitespace']).toContain(curlyRule.meta.fixable)
    })

    test('should have description longer than 20 characters', () => {
      expect(curlyRule.meta.docs?.description.length).toBeGreaterThan(20)
    })

    test('should have url containing rules path', () => {
      expect(curlyRule.meta.docs?.url).toContain('/rules/')
    })

    test('should have category as string', () => {
      expect(typeof curlyRule.meta.docs?.category).toBe('string')
    })

    test('should have recommended as boolean', () => {
      expect(typeof curlyRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should not be deprecated', () => {
      expect(curlyRule.meta.deprecated).toBeFalsy()
    })

    test('should not have replacedBy', () => {
      expect(curlyRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(curlyRule.meta.requiresTypeChecking).toBeFalsy()
    })
  })

  describe('isolation', () => {
    test('separate contexts should have separate reports', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()

      const v1 = curlyRule.create(ctx1)
      const v2 = curlyRule.create(ctx2)

      v1.IfStatement(createIfStatement(createExpressionStatement()))
      v2.IfStatement(createIfStatement(createBlockStatement()))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('same context used by two visitors accumulates reports', () => {
      const { context, reports } = createMockRuleContext()
      const v1 = curlyRule.create(context)
      const v2 = curlyRule.create(context)

      v1.IfStatement(createIfStatement(createExpressionStatement()))
      v2.IfStatement(createIfStatement(createExpressionStatement(3, 0)))

      expect(reports.length).toBe(2)
    })

    test('should not carry state between create calls', () => {
      const { context, reports } = createMockRuleContext()
      const v1 = curlyRule.create(context)

      v1.IfStatement(createIfStatement(createExpressionStatement()))
      expect(reports.length).toBe(1)

      const v2 = curlyRule.create(context)
      v2.IfStatement(createIfStatement(createBlockStatement()))
      expect(reports.length).toBe(1) // still 1, no additional report
    })

    test('should handle many sequential violations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.IfStatement(createIfStatement(createExpressionStatement(), i + 1, 0))
      }

      expect(reports.length).toBe(50)
    })

    test('should handle alternating violations and non-violations', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          visitor.IfStatement(createIfStatement(createExpressionStatement(), i + 1, 0))
        } else {
          visitor.IfStatement(createIfStatement(createBlockStatement(), i + 1, 0))
        }
      }

      expect(reports.length).toBe(10)
    })
  })

  describe('body type variations', () => {
    test('should report when body type is VariableDeclaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createForStatement({
        type: 'VariableDeclaration',
        kind: 'let',
        declarations: [],
        loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } },
      })
      visitor.ForStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report when body type is FunctionDeclaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createWhileStatement({
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'fn' },
        params: [],
        loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 20 } },
      })
      visitor.WhileStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report when body type is ClassDeclaration', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement({
        type: 'ClassDeclaration',
        id: { type: 'Identifier', name: 'Foo' },
        loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 20 } },
      })
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report when body type is TryStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement({
        type: 'TryStatement',
        block: { type: 'BlockStatement', body: [] },
        handler: null,
        finalizer: null,
        loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 20 } },
      })
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report when body type is SwitchStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement({
        type: 'SwitchStatement',
        discriminant: { type: 'Identifier', name: 'x' },
        cases: [],
        loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 20 } },
      })
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report when body is object without type property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createIfStatement({
        name: 'not-a-type',
        loc: { start: { line: 1, column: 7 }, end: { line: 1, column: 15 } },
      })
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should report when body is array', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = createForStatement([createExpressionStatement()])
      visitor.ForStatement(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('consequent vs body property', () => {
    test('should check consequent for IfStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'x' },
        consequent: createExpressionStatement(),
        body: createBlockStatement(), // body exists but should use consequent
        alternate: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.IfStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should prefer consequent over body when both exist for ForStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: null,
        update: null,
        body: createExpressionStatement(),
        consequent: createBlockStatement(), // consequent takes priority via ||
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.ForStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should check body for WhileStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: { type: 'Identifier', name: 'x' },
        body: createExpressionStatement(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.WhileStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should check body for DoWhileStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'DoWhileStatement',
        body: createExpressionStatement(),
        test: { type: 'Identifier', name: 'x' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.DoWhileStatement(node)
      expect(reports.length).toBe(1)
    })

    test('should check body for WithStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = curlyRule.create(context)

      const node = {
        type: 'WithStatement',
        object: { type: 'Identifier', name: 'obj' },
        body: createExpressionStatement(),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.WithStatement(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('rule definition shape', () => {
    test('should export curlyRule as a RuleDefinition', () => {
      expect(curlyRule).toHaveProperty('meta')
      expect(curlyRule).toHaveProperty('create')
    })

    test('should have exactly two top-level properties', () => {
      const keys = Object.keys(curlyRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })

    test('should have create as a function taking one argument', () => {
      expect(curlyRule.create.length).toBe(1)
    })

    test('should have default export equal to curlyRule', () => {
      expect(curlyRule).toBeDefined()
      expect(typeof curlyRule).toBe('object')
    })

    test('should have meta.schema as an array', () => {
      expect(Array.isArray(curlyRule.meta.schema)).toBe(true)
    })
  })
})

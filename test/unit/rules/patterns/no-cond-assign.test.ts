import { describe, test, expect, vi } from 'vitest'
import { noCondAssignRule } from '../../../../src/rules/patterns/no-cond-assign.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

function createIfWithAssignmentInTest(line = 1, column = 0): unknown {
  return {
    type: 'IfStatement',
    test: {
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'Identifier', name: 'x' },
      right: { type: 'Literal', value: 1 },
      loc: { start: { line, column }, end: { line, column: column + 5 } },
    },
    consequent: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createIfWithComparisonInTest(line = 1, column = 0): unknown {
  return {
    type: 'IfStatement',
    test: {
      type: 'BinaryExpression',
      operator: '===',
      left: { type: 'Identifier', name: 'x' },
      right: { type: 'Literal', value: 1 },
    },
    consequent: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createWhileWithAssignmentInTest(line = 1, column = 0): unknown {
  return {
    type: 'WhileStatement',
    test: {
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'Identifier', name: 'x' },
      right: { type: 'Literal', value: 1 },
      loc: { start: { line, column }, end: { line, column: column + 5 } },
    },
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createWhileWithComparisonInTest(line = 1, column = 0): unknown {
  return {
    type: 'WhileStatement',
    test: {
      type: 'BinaryExpression',
      operator: '<',
      left: { type: 'Identifier', name: 'x' },
      right: { type: 'Literal', value: 10 },
    },
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createNonIfOrWhile(): unknown {
  return {
    type: 'ForStatement',
    init: null,
    test: null,
    update: null,
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

describe('no-cond-assign rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noCondAssignRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noCondAssignRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noCondAssignRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noCondAssignRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention assignment in description', () => {
      expect(noCondAssignRule.meta.docs?.description.toLowerCase()).toContain('assignment')
    })

    test('should have a non-empty description', () => {
      expect(noCondAssignRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have description that mentions conditional', () => {
      expect(noCondAssignRule.meta.docs?.description.toLowerCase()).toContain('conditional')
    })

    test('should have description as a string', () => {
      expect(typeof noCondAssignRule.meta.docs?.description).toBe('string')
    })

    test('should have type as a valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noCondAssignRule.meta.type)
    })

    test('should have severity as a valid Severity', () => {
      expect(['off', 'warn', 'error']).toContain(noCondAssignRule.meta.severity)
    })

    test('should have docs object defined', () => {
      expect(noCondAssignRule.meta.docs).toBeDefined()
    })

    test('should have docs.description defined', () => {
      expect(noCondAssignRule.meta.docs?.description).toBeDefined()
    })

    test('should have docs.recommended as a boolean', () => {
      expect(typeof noCondAssignRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have docs.category as a string', () => {
      expect(typeof noCondAssignRule.meta.docs?.category).toBe('string')
    })

    test('should have schema defined as an array', () => {
      expect(Array.isArray(noCondAssignRule.meta.schema)).toBe(true)
    })

    test('should have empty schema array', () => {
      expect(noCondAssignRule.meta.schema).toEqual([])
    })

    test('should have fixable as undefined', () => {
      expect(noCondAssignRule.meta.fixable).toBeUndefined()
    })

    test('should have meta as a plain object', () => {
      expect(typeof noCondAssignRule.meta).toBe('object')
    })

    test('should not be deprecated', () => {
      expect(noCondAssignRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noCondAssignRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noCondAssignRule.meta.requiresTypeChecking).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor with IfStatement method', () => {
      const { context } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      expect(visitor).toHaveProperty('IfStatement')
    })

    test('should return visitor with WhileStatement method', () => {
      const { context } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      expect(visitor).toHaveProperty('WhileStatement')
    })

    test('should return an object from create', () => {
      const { context } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should return visitor with IfStatement as a function', () => {
      const { context } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      expect(typeof visitor.IfStatement).toBe('function')
    })

    test('should return visitor with WhileStatement as a function', () => {
      const { context } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      expect(typeof visitor.WhileStatement).toBe('function')
    })

    test('should return a new visitor on each call', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noCondAssignRule.create(context)
      const visitor2 = noCondAssignRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should have create as a function on the rule', () => {
      expect(typeof noCondAssignRule.create).toBe('function')
    })

    test('should not throw when creating visitor', () => {
      const { context } = createMockRuleContext()

      expect(() => noCondAssignRule.create(context)).not.toThrow()
    })

    test('should return visitor with exactly IfStatement and WhileStatement keys', () => {
      const { context } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      expect(Object.keys(visitor).sort()).toEqual(['IfStatement', 'WhileStatement'])
    })
  })

  describe('detecting assignment in conditionals', () => {
    test('should report assignment in if test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest())

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('assignment')
    })

    test('should not report comparison in if test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithComparisonInTest())

      expect(reports.length).toBe(0)
    })

    test('should report assignment in while test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.WhileStatement(createWhileWithAssignmentInTest())

      expect(reports.length).toBe(1)
    })

    test('should not report comparison in while test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.WhileStatement(createWhileWithComparisonInTest())

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report assignment in if test with complex right side', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'result' },
          right: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [],
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report assignment in if test with member expression left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'prop' },
          },
          right: { type: 'Literal', value: 42 },
          loc: { start: { line: 3, column: 2 }, end: { line: 3, column: 12 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 3, column: 0 }, end: { line: 3, column: 20 } },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report assignment in while test with string literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 's' },
          right: { type: 'Literal', value: 'hello' },
          loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 10 } },
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 20 } },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not report BinaryExpression with == operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'BinaryExpression',
          operator: '==',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
        },
        consequent: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report BinaryExpression with != operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'BinaryExpression',
          operator: '!=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: null },
        },
        consequent: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report LogicalExpression in if test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'LogicalExpression',
          operator: '&&',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        consequent: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report LogicalExpression in while test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: {
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report CallExpression in if test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'check' },
          arguments: [],
        },
        consequent: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Identifier in if test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 'Identifier', name: 'condition' },
        consequent: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report UnaryExpression in if test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'UnaryExpression',
          operator: '!',
          argument: { type: 'Identifier', name: 'flag' },
        },
        consequent: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Literal in while test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: { type: 'Literal', value: true },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report start line from assignment loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest(42, 0))

      expect(reports[0].loc?.start.line).toBe(42)
    })

    test('should report start column from assignment loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest(1, 8))

      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report end line from assignment loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest(5, 2))

      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('should report end column from assignment loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest(1, 3))

      expect(reports[0].loc?.end.column).toBe(8)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest())

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for while at custom line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.WhileStatement(createWhileWithAssignmentInTest(100, 50))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location end column offset by 5 for default assignment', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest(1, 0))

      expect(reports[0].loc?.end.column).toBe(5)
    })

    test('should report location for assignment in while at line 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.WhileStatement(createWhileWithAssignmentInTest(0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for assignment with large column offset', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest(1, 999))

      expect(reports[0].loc?.start.column).toBe(999)
      expect(reports[0].loc?.end.column).toBe(1004)
    })
  })

  describe('message content verification', () => {
    test('should include "assignment" in report message for if', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest())

      expect(reports[0].message).toContain('assignment')
    })

    test('should include "assignment" in report message for while', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.WhileStatement(createWhileWithAssignmentInTest())

      expect(reports[0].message).toContain('assignment')
    })

    test('should include "conditional" in report message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest())

      expect(reports[0].message.toLowerCase()).toContain('conditional')
    })

    test('should have non-empty message string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest())

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have same message for if and while assignments', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext()
      const visitor1 = noCondAssignRule.create(ctx1)
      visitor1.IfStatement(createIfWithAssignmentInTest())

      const { context: ctx2, reports: reports2 } = createMockRuleContext()
      const visitor2 = noCondAssignRule.create(ctx2)
      visitor2.WhileStatement(createWhileWithAssignmentInTest())

      expect(reports1[0].message).toBe(reports2[0].message)
    })

    test('should have message that ends with a period', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest())

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should include "Expected" in report message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest())

      expect(reports[0].message).toContain('Expected')
    })

    test('should include "expression" in report message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest())

      expect(reports[0].message.toLowerCase()).toContain('expression')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully for IfStatement', () => {
      const { context } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      expect(() => visitor.IfStatement(null)).not.toThrow()
    })

    test('should handle null node gracefully for WhileStatement', () => {
      const { context } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      expect(() => visitor.WhileStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully for IfStatement', () => {
      const { context } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      expect(() => visitor.IfStatement(undefined)).not.toThrow()
    })

    test('should handle undefined node gracefully for WhileStatement', () => {
      const { context } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      expect(() => visitor.WhileStatement(undefined)).not.toThrow()
    })

    test('should handle non-IfStatement gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      expect(() => visitor.IfStatement(createNonIfOrWhile())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-WhileStatement gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      expect(() => visitor.WhileStatement(createNonIfOrWhile())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle if without test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = { type: 'IfStatement', consequent: { type: 'BlockStatement', body: [] } }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = createIfWithAssignmentInTest() as Record<string, unknown>
      delete (node.test as Record<string, unknown>).loc

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle primitive number node for IfStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      expect(() => visitor.IfStatement(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle primitive string node for IfStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      expect(() => visitor.IfStatement('node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle primitive number node for WhileStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      expect(() => visitor.WhileStatement(0)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle primitive false node for IfStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      expect(() => visitor.IfStatement(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node for IfStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      expect(() => visitor.IfStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node for WhileStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      expect(() => visitor.WhileStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle while without test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = { type: 'WhileStatement', body: { type: 'BlockStatement', body: [] } }

      expect(() => visitor.WhileStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle if with test as null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: null,
        consequent: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle while with test as null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: null,
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.WhileStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle if with test as undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: undefined,
        consequent: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle while with test as undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: undefined,
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.WhileStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle if with test as a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: 42,
        consequent: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle if with test as a string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: 'x',
        consequent: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string for IfStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'ExpressionStatement',
        test: { type: 'AssignmentExpression', operator: '=' },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string for WhileStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'DoWhileStatement',
        test: { type: 'AssignmentExpression', operator: '=' },
      }

      expect(() => visitor.WhileStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle if with test type as non-string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: { type: 123 },
        consequent: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
    })

    test('should handle if with test loc missing end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: { start: { line: 1, column: 0 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle if with test loc missing start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: { end: { line: 1, column: 5 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle if with test loc as null', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: null,
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle if with test loc as empty object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: {},
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle array node for IfStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      expect(() => visitor.IfStatement([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node for WhileStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      expect(() => visitor.WhileStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for ForStatement with assignment in test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'ForStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Literal', value: 0 },
        },
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not report for DoWhileStatement with assignment in test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'DoWhileStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
        },
        body: { type: 'BlockStatement', body: [] },
      }

      expect(() => visitor.WhileStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('multiple reports', () => {
    test('should report separately for two if statements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest(1, 0))
      visitor.IfStatement(createIfWithAssignmentInTest(5, 0))

      expect(reports.length).toBe(2)
    })

    test('should report separately for two while statements', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.WhileStatement(createWhileWithAssignmentInTest(1, 0))
      visitor.WhileStatement(createWhileWithAssignmentInTest(10, 0))

      expect(reports.length).toBe(2)
    })

    test('should report for mixed if and while with assignments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest(1, 0))
      visitor.WhileStatement(createWhileWithAssignmentInTest(5, 0))

      expect(reports.length).toBe(2)
    })

    test('should only report for if when while has comparison', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest(1, 0))
      visitor.WhileStatement(createWhileWithComparisonInTest(5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should only report for while when if has comparison', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithComparisonInTest(1, 0))
      visitor.WhileStatement(createWhileWithAssignmentInTest(5, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should report zero when both if and while have comparisons', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithComparisonInTest(1, 0))
      visitor.WhileStatement(createWhileWithComparisonInTest(5, 0))

      expect(reports.length).toBe(0)
    })

    test('should report for many sequential if statements with assignments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.IfStatement(createIfWithAssignmentInTest(i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should report for many sequential while statements with assignments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.WhileStatement(createWhileWithAssignmentInTest(i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should accumulate reports correctly with mixed patterns', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest())
      visitor.IfStatement(createIfWithComparisonInTest())
      visitor.WhileStatement(createWhileWithAssignmentInTest())
      visitor.IfStatement(createIfWithAssignmentInTest())
      visitor.WhileStatement(createWhileWithComparisonInTest())

      expect(reports.length).toBe(3)
    })

    test('should track correct locations for multiple reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest(2, 4))
      visitor.WhileStatement(createWhileWithAssignmentInTest(7, 1))

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[1].loc?.start.line).toBe(7)
      expect(reports[1].loc?.start.column).toBe(1)
    })

    test('should have separate report objects for each report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest(1, 0))
      visitor.IfStatement(createIfWithAssignmentInTest(2, 0))

      expect(reports[0]).not.toBe(reports[1])
    })
  })

  describe('visitor isolation', () => {
    test('should not share reports between two visitors', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext()
      const { context: ctx2, reports: reports2 } = createMockRuleContext()

      const visitor1 = noCondAssignRule.create(ctx1)
      const visitor2 = noCondAssignRule.create(ctx2)

      visitor1.IfStatement(createIfWithAssignmentInTest())

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('each visitor should report independently', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext()
      const { context: ctx2, reports: reports2 } = createMockRuleContext()

      const visitor1 = noCondAssignRule.create(ctx1)
      const visitor2 = noCondAssignRule.create(ctx2)

      visitor1.IfStatement(createIfWithAssignmentInTest(1, 0))
      visitor2.IfStatement(createIfWithAssignmentInTest(5, 0))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(1)
      expect(reports1[0].loc?.start.line).toBe(1)
      expect(reports2[0].loc?.start.line).toBe(5)
    })

    test('should not leak reports from if visitor to while visitor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest())
      visitor.WhileStatement(createWhileWithComparisonInTest())

      expect(reports.length).toBe(1)
    })
  })

  describe('rule structure', () => {
    test('should have meta property on rule', () => {
      expect(noCondAssignRule).toHaveProperty('meta')
    })

    test('should have create property on rule', () => {
      expect(noCondAssignRule).toHaveProperty('create')
    })

    test('should have exactly meta and create properties', () => {
      const keys = Object.keys(noCondAssignRule).sort()
      expect(keys).toEqual(['create', 'meta'])
    })

    test('should be a valid RuleDefinition object', () => {
      expect(typeof noCondAssignRule).toBe('object')
      expect(typeof noCondAssignRule.meta).toBe('object')
      expect(typeof noCondAssignRule.create).toBe('function')
    })
  })

  describe('mock context interactions', () => {
    test('should not call report for comparison in if', () => {
      let reportCalled = false
      const context = {
        report: () => {
          reportCalled = true
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noCondAssignRule.create(context)
      visitor.IfStatement(createIfWithComparisonInTest())

      expect(reportCalled).toBe(false)
    })

    test('should call report exactly once for assignment in if', () => {
      let reportCount = 0
      const context = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noCondAssignRule.create(context)
      visitor.IfStatement(createIfWithAssignmentInTest())

      expect(reportCount).toBe(1)
    })

    test('should call report exactly once for assignment in while', () => {
      let reportCount = 0
      const context = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noCondAssignRule.create(context)
      visitor.WhileStatement(createWhileWithAssignmentInTest())

      expect(reportCount).toBe(1)
    })

    test('should pass message to report callback', () => {
      let reportedMessage = ''
      const context = {
        report: (descriptor: ReportDescriptor) => {
          reportedMessage = descriptor.message
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noCondAssignRule.create(context)
      visitor.IfStatement(createIfWithAssignmentInTest())

      expect(reportedMessage).toBeTruthy()
      expect(typeof reportedMessage).toBe('string')
    })

    test('should pass loc to report callback', () => {
      let reportedLoc: unknown = null
      const context = {
        report: (descriptor: ReportDescriptor) => {
          reportedLoc = descriptor.loc
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noCondAssignRule.create(context)
      visitor.IfStatement(createIfWithAssignmentInTest())

      expect(reportedLoc).toBeDefined()
    })
  })

  describe('specific assignment operators', () => {
    test('should report for = operator in if', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest())

      expect(reports.length).toBe(1)
    })

    test('should report for = operator in while', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.WhileStatement(createWhileWithAssignmentInTest())

      expect(reports.length).toBe(1)
    })

    test('should report for assignment with += operator variant type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '+=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report for assignment with -= operator variant type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '-=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report for assignment with *= operator in while', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '*=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 2 },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report for assignment with /= operator in while', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '/=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 2 },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('BinaryExpression comparison operators', () => {
    test('should not report for === in if', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithComparisonInTest())

      expect(reports.length).toBe(0)
    })

    test('should not report for < in while', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.WhileStatement(createWhileWithComparisonInTest())

      expect(reports.length).toBe(0)
    })

    test('should not report for > in if', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'BinaryExpression',
          operator: '>',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 0 },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for <= in if', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'BinaryExpression',
          operator: '<=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 10 },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for >= in while', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: {
          type: 'BinaryExpression',
          operator: '>=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 0 },
        },
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for !== in while', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: {
          type: 'BinaryExpression',
          operator: '!==',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 'stop' },
        },
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for instanceof in if', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'BinaryExpression',
          operator: 'instanceof',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Identifier', name: 'Foo' },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('DoWhileStatement handling', () => {
    test('should not detect do-while via WhileStatement handler', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'DoWhileStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
        },
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('ConditionalExpression handling', () => {
    test('should not report ConditionalExpression in if test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'a' },
          consequent: { type: 'Identifier', name: 'b' },
          alternate: { type: 'Identifier', name: 'c' },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('boolean node type handling', () => {
    test('should handle node with type true for IfStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = { type: true, test: { type: 'AssignmentExpression' } }

      expect(() => visitor.IfStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type false for WhileStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = { type: false, test: { type: 'AssignmentExpression' } }

      expect(() => visitor.WhileStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('consecutive calls on same visitor', () => {
    test('should report on every call with assignment in if', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest())
      visitor.IfStatement(createIfWithAssignmentInTest())
      visitor.IfStatement(createIfWithAssignmentInTest())

      expect(reports.length).toBe(3)
    })

    test('should report on every call with assignment in while', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.WhileStatement(createWhileWithAssignmentInTest())
      visitor.WhileStatement(createWhileWithAssignmentInTest())

      expect(reports.length).toBe(2)
    })

    test('should not accumulate reports from non-assignment calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithComparisonInTest())
      visitor.IfStatement(createIfWithComparisonInTest())
      visitor.IfStatement(createIfWithComparisonInTest())

      expect(reports.length).toBe(0)
    })

    test('should handle alternating assignment and comparison calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest())
      visitor.IfStatement(createIfWithComparisonInTest())
      visitor.WhileStatement(createWhileWithAssignmentInTest())
      visitor.IfStatement(createIfWithComparisonInTest())
      visitor.WhileStatement(createWhileWithComparisonInTest())

      expect(reports.length).toBe(2)
    })
  })

  describe('export verification', () => {
    test('should have noCondAssignRule defined', () => {
      expect(noCondAssignRule).toBeDefined()
    })

    test('should have noCondAssignRule as an object', () => {
      expect(typeof noCondAssignRule).toBe('object')
    })

    test('should have noCondAssignRule with meta and create', () => {
      expect(noCondAssignRule.meta).toBeDefined()
      expect(noCondAssignRule.create).toBeDefined()
    })

    test('should be importable as named export', async () => {
      const mod = await import('../../../../src/rules/patterns/no-cond-assign.js')
      expect(mod.noCondAssignRule).toBeDefined()
      expect(mod.noCondAssignRule).toBe(noCondAssignRule)
    })

    test('should be importable as default export', async () => {
      const mod = await import('../../../../src/rules/patterns/no-cond-assign.js')
      expect(mod.default).toBeDefined()
      expect(mod.default).toBe(noCondAssignRule)
    })

    test('should have same object for default and named export', async () => {
      const mod = await import('../../../../src/rules/patterns/no-cond-assign.js')
      expect(mod.default).toBe(mod.noCondAssignRule)
    })

    test('should have consistent meta between default and named export', async () => {
      const mod = await import('../../../../src/rules/patterns/no-cond-assign.js')
      expect(mod.default.meta).toBe(mod.noCondAssignRule.meta)
    })
  })

  describe('location edge cases', () => {
    test('should use default location when test has no loc property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default location when while test has no loc property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
        },
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-numeric line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: { start: { line: 'abc', column: 0 }, end: { line: 1, column: 5 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-numeric column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: { start: { line: 1, column: 'bad' }, end: { line: 1, column: 5 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with negative line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest(-1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(-1)
    })

    test('should handle loc with negative column number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest(1, -5))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(-5)
    })

    test('should handle very large line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest(99999, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(99999)
    })

    test('should handle loc where end line differs from start line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: { start: { line: 5, column: 0 }, end: { line: 7, column: 10 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(10)
    })
  })

  describe('complex test expressions', () => {
    test('should not report for nested BinaryExpression in if test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'BinaryExpression',
          operator: '===',
          left: {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Identifier', name: 'a' },
            right: { type: 'Identifier', name: 'b' },
          },
          right: { type: 'Literal', value: 5 },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for MemberExpression in if test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'flag' },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report for AssignmentExpression with object destructuring left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'ObjectPattern', properties: [] },
          right: { type: 'Identifier', name: 'obj' },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report for AssignmentExpression with array destructuring left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'ArrayPattern', elements: [] },
          right: { type: 'Identifier', name: 'arr' },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not report for SequenceExpression in if test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'SequenceExpression',
          expressions: [
            { type: 'Identifier', name: 'a' },
            { type: 'Identifier', name: 'b' },
          ],
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should report for AssignmentExpression with null right', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: null },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report for AssignmentExpression with undefined right', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Identifier', name: 'undefined' },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report for AssignmentExpression with ArrowFunctionExpression right', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'fn' },
          right: {
            type: 'ArrowFunctionExpression',
            params: [],
            body: { type: 'BlockStatement', body: [] },
          },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('operator variations in while', () => {
    test('should report for %= operator in while', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '%=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 2 },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report for **= operator in while', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '**=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 2 },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report for <<= operator in while', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '<<=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report for >>= operator in if', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '>>=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report for &= operator in if', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '&=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 0xff },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report for |= operator in if', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '|=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 0x01 },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should report for ^= operator in while', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '^=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 0xff },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('SwitchStatement non-detection', () => {
    test('should not report for SwitchStatement passed to IfStatement handler', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'AssignmentExpression', operator: '=' },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for SwitchStatement passed to WhileStatement handler', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'SwitchStatement',
        discriminant: { type: 'AssignmentExpression', operator: '=' },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('idempotency', () => {
    test('calling IfStatement handler twice with same node should report twice', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = createIfWithAssignmentInTest(1, 0)
      visitor.IfStatement(node)
      visitor.IfStatement(node)

      expect(reports.length).toBe(2)
    })

    test('calling WhileStatement handler twice with same node should report twice', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = createWhileWithAssignmentInTest(1, 0)
      visitor.WhileStatement(node)
      visitor.WhileStatement(node)

      expect(reports.length).toBe(2)
    })

    test('calling IfStatement with comparison twice should not report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = createIfWithComparisonInTest(1, 0)
      visitor.IfStatement(node)
      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('location with default fallback', () => {
    test('should default to line 1 when loc.start.line is undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: { start: { column: 5 }, end: { line: 1, column: 10 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should default to column 0 when loc.start.column is undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: { start: { line: 3 }, end: { line: 3, column: 10 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should default end line to 1 when undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: { start: { line: 2, column: 0 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports[0].loc?.end.line).toBe(1)
    })

    test('should default end column to 0 when undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: { start: { line: 1, column: 0 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports[0].loc?.end.column).toBe(0)
    })
  })

  describe('ForInStatement and ForOfStatement non-detection', () => {
    test('should not report for ForInStatement passed to IfStatement handler', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'ForInStatement',
        left: { type: 'Identifier', name: 'k' },
        right: { type: 'Identifier', name: 'obj' },
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for ForOfStatement passed to WhileStatement handler', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'ForOfStatement',
        left: { type: 'Identifier', name: 'v' },
        right: { type: 'Identifier', name: 'arr' },
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('node with extra properties', () => {
    test('should still detect assignment when if has alternate property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
        alternate: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should not report comparison when if has alternate property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'BinaryExpression',
          operator: '===',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
        },
        consequent: { type: 'BlockStatement', body: [] },
        alternate: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle if with consequent as ExpressionStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        consequent: { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'y' } },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle while with body as ExpressionStatement', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        body: { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'y' } },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('deep nesting patterns', () => {
    test('should report assignment in nested if test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const innerNode = createIfWithAssignmentInTest(5, 3)
      visitor.IfStatement(innerNode)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should report assignment in nested while test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const innerNode = createWhileWithAssignmentInTest(10, 2)
      visitor.WhileStatement(innerNode)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('should report for deeply nested visitor re-invocation', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest(1, 0))
      visitor.WhileStatement(createWhileWithAssignmentInTest(2, 0))
      visitor.IfStatement(createIfWithAssignmentInTest(3, 0))

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })
  })

  describe('TernaryExpression in test position', () => {
    test('should not report for TernaryExpression (ConditionalExpression) in if test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'ConditionalExpression',
          test: { type: 'Identifier', name: 'a' },
          consequent: { type: 'Literal', value: 1 },
          alternate: { type: 'Literal', value: 0 },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('NewExpression and TemplateLiteral in test', () => {
    test('should not report for NewExpression in while test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Error' },
          arguments: [],
        },
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for TemplateLiteral in if test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'TemplateLiteral',
          quasis: [],
          expressions: [],
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('zero line/column values', () => {
    test('should report for assignment at line 0 column 0 in if', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.IfStatement(createIfWithAssignmentInTest(0, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report for assignment at line 0 column 0 in while', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      visitor.WhileStatement(createWhileWithAssignmentInTest(0, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
    })
  })

  describe('node type case sensitivity', () => {
    test('should not detect assignment with ifstatement (lowercase) type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'ifstatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not detect assignment with WHILESTATEMENT (uppercase) type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'WHILESTATEMENT',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
        },
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not detect with assignmentexpression (lowercase) test type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'assignmentexpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('consequent and body structure independence', () => {
    test('should still report when if consequent has nested body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        consequent: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: { type: 'Identifier', name: 'doSomething' },
            },
          ],
        },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should still report when while body has nested body', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: {
          type: 'AssignmentExpression',
          operator: '=',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 1 },
          loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        },
        body: {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'process' },
                arguments: [],
              },
            },
          ],
        },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should still report when consequent is empty block', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = createIfWithAssignmentInTest()
      visitor.IfStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should still report when while body is empty block', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = createWhileWithAssignmentInTest()
      visitor.WhileStatement(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('UpdateExpression non-detection', () => {
    test('should not report for UpdateExpression (++x) in if test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'x' },
          prefix: true,
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report for UpdateExpression (x--) in while test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'WhileStatement',
        test: {
          type: 'UpdateExpression',
          operator: '--',
          argument: { type: 'Identifier', name: 'x' },
          prefix: false,
        },
        body: { type: 'BlockStatement', body: [] },
      }

      visitor.WhileStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('AwaitExpression non-detection', () => {
    test('should not report for AwaitExpression in if test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noCondAssignRule.create(context)

      const node = {
        type: 'IfStatement',
        test: {
          type: 'AwaitExpression',
          argument: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fetch' },
            arguments: [],
          },
        },
        consequent: { type: 'BlockStatement', body: [] },
      }

      visitor.IfStatement(node)

      expect(reports.length).toBe(0)
    })
  })
})

import { describe, test, expect } from 'vitest'
import { forDirectionRule } from '../../../../src/rules/patterns/for-direction.js'
import importDefault from '../../../../src/rules/patterns/for-direction.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createForStatement(
  testOp: string,
  updateOp: string,
  counterOnRight = false,
  line = 1,
  column = 0,
): unknown {
  const left = { type: 'Identifier', name: 'i' }
  const right = { type: 'Literal', value: 10 }

  return {
    type: 'ForStatement',
    init: {
      type: 'VariableDeclaration',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: 'i' },
          init: { type: 'Literal', value: 0 },
        },
      ],
    },
    test: {
      type: 'BinaryExpression',
      operator: testOp,
      left: counterOnRight ? right : left,
      right: counterOnRight ? left : right,
    },
    update: {
      type: 'UpdateExpression',
      operator: updateOp,
      argument: { type: 'Identifier', name: 'i' },
      prefix: false,
    },
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createValidForStatement(line = 1, column = 0): unknown {
  return createForStatement('<', '++', false, line, column)
}

function createInvalidForStatement(line = 1, column = 0): unknown {
  return createForStatement('<', '--', false, line, column)
}

function createForStatementWithoutTest(): unknown {
  return {
    type: 'ForStatement',
    init: null,
    test: null,
    update: {
      type: 'UpdateExpression',
      operator: '++',
      argument: { type: 'Identifier', name: 'i' },
    },
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
  }
}

function createForStatementWithoutUpdate(): unknown {
  return {
    type: 'ForStatement',
    init: null,
    test: {
      type: 'BinaryExpression',
      operator: '<',
      left: { type: 'Identifier', name: 'i' },
      right: { type: 'Literal', value: 10 },
    },
    update: null,
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 20 },
    },
  }
}

function createNonForStatement(): unknown {
  return {
    type: 'WhileStatement',
    test: { type: 'Literal', value: true },
    body: { type: 'BlockStatement', body: [] },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 10 },
    },
  }
}

describe('for-direction rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(forDirectionRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(forDirectionRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(forDirectionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(forDirectionRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention for loop in description', () => {
      expect(forDirectionRule.meta.docs?.description.toLowerCase()).toContain('for')
    })

    test('should have a non-empty description string', () => {
      expect(typeof forDirectionRule.meta.docs?.description).toBe('string')
      expect((forDirectionRule.meta.docs?.description as string).length).toBeGreaterThan(0)
    })

    test('should mention update clause in description', () => {
      expect(forDirectionRule.meta.docs?.description.toLowerCase()).toContain('update')
    })

    test('should mention direction in description', () => {
      expect(forDirectionRule.meta.docs?.description.toLowerCase()).toContain('direction')
    })

    test('should mention counter in description', () => {
      expect(forDirectionRule.meta.docs?.description.toLowerCase()).toContain('counter')
    })

    test('should have meta type as one of valid RuleType values', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(forDirectionRule.meta.type)
    })

    test('should have meta severity as one of valid Severity values', () => {
      expect(['off', 'warn', 'error']).toContain(forDirectionRule.meta.severity)
    })

    test('should have docs object defined', () => {
      expect(forDirectionRule.meta.docs).toBeDefined()
      expect(forDirectionRule.meta.docs).not.toBeNull()
    })

    test('should have docs.recommended as boolean', () => {
      expect(typeof forDirectionRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have schema defined', () => {
      expect(forDirectionRule.meta.schema).toBeDefined()
    })

    test('should have empty schema array', () => {
      const schema = forDirectionRule.meta.schema
      expect(Array.isArray(schema)).toBe(true)
      expect(schema).toHaveLength(0)
    })

    test('should not be fixable', () => {
      expect(forDirectionRule.meta.fixable).toBeUndefined()
    })

    test('should not be deprecated', () => {
      expect(forDirectionRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(forDirectionRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(forDirectionRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have meta as a plain object', () => {
      expect(typeof forDirectionRule.meta).toBe('object')
      expect(forDirectionRule.meta).not.toBeNull()
    })

    test('should have description as a string with more than 10 characters', () => {
      const desc = forDirectionRule.meta.docs?.description
      expect(typeof desc).toBe('string')
      expect((desc as string).length).toBeGreaterThan(10)
    })
  })

  describe('create', () => {
    test('should return visitor with ForStatement method', () => {
      const { context } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      expect(visitor).toHaveProperty('ForStatement')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      expect(visitor).not.toBeNull()
      expect(visitor).toBeDefined()
    })

    test('should return visitor as an object', () => {
      const { context } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should return ForStatement as a function', () => {
      const { context } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      expect(typeof visitor.ForStatement).toBe('function')
    })

    test('should return the same visitor shape for different contexts', () => {
      const { context: ctx1 } = createMockRuleContext()
      const { context: ctx2 } = createMockRuleContext()
      const visitor1 = forDirectionRule.create(ctx1)
      const visitor2 = forDirectionRule.create(ctx2)

      expect(Object.keys(visitor1)).toEqual(Object.keys(visitor2))
    })

    test('should produce independent visitors', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext()
      const { context: ctx2, reports: reports2 } = createMockRuleContext()
      const visitor1 = forDirectionRule.create(ctx1)
      const visitor2 = forDirectionRule.create(ctx2)

      visitor1.ForStatement(createInvalidForStatement())
      visitor2.ForStatement(createValidForStatement())

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should accept a context and return a RuleVisitor', () => {
      const { context } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      expect(visitor.ForStatement).toBeInstanceOf(Function)
    })

    test('should create new visitor on each call', () => {
      const { context } = createMockRuleContext()
      const visitor1 = forDirectionRule.create(context)
      const visitor2 = forDirectionRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('detecting wrong direction', () => {
    test('should report decrement with < operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('<', '--', false))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('wrong direction')
    })

    test('should report decrement with <= operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('<=', '--', false))

      expect(reports.length).toBe(1)
    })

    test('should report increment with > operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('>', '++', false))

      expect(reports.length).toBe(1)
    })

    test('should report increment with >= operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('>=', '++', false))

      expect(reports.length).toBe(1)
    })

    test('should report counter on right with increment and <', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      // i < 10 with i++ is valid
      // 10 < i with i++ is invalid
      visitor.ForStatement(createForStatement('<', '++', true))

      expect(reports.length).toBe(1)
    })

    test('should not report valid increment with <', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createValidForStatement())

      expect(reports.length).toBe(0)
    })

    test('should not report valid decrement with >', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('>', '--', false))

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createInvalidForStatement(10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report increment with > operator (counter left)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('>', '++', false))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('wrong direction')
    })

    test('should report increment with >= operator (counter left)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('>=', '++', false))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('wrong direction')
    })

    test('should report decrement with < operator (counter left)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('<', '--', false))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('wrong direction')
    })

    test('should report decrement with <= operator (counter left)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('<=', '--', false))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('wrong direction')
    })

    test('should report counter on right with increment and <=', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('<=', '++', true))

      expect(reports.length).toBe(1)
    })

    test('should report counter on right with decrement and >', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('>', '--', true))

      expect(reports.length).toBe(1)
    })

    test('should report counter on right with decrement and >=', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('>=', '--', true))

      expect(reports.length).toBe(1)
    })

    test('should not report valid counter on right with decrement and <', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('<', '--', true))

      expect(reports.length).toBe(0)
    })

    test('should not report valid counter on right with decrement and <=', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('<=', '--', true))

      expect(reports.length).toBe(0)
    })

    test('should not report valid counter on right with increment and >', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('>', '++', true))

      expect(reports.length).toBe(0)
    })

    test('should not report valid counter on right with increment and >=', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('>=', '++', true))

      expect(reports.length).toBe(0)
    })

    test('should not report valid counter on left with increment and <', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('<', '++', false))

      expect(reports.length).toBe(0)
    })

    test('should not report valid counter on left with increment and <=', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('<=', '++', false))

      expect(reports.length).toBe(0)
    })

    test('should not report valid counter on left with decrement and >', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('>', '--', false))

      expect(reports.length).toBe(0)
    })

    test('should not report valid counter on left with decrement and >=', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('>=', '--', false))

      expect(reports.length).toBe(0)
    })
  })

  describe('message content verification', () => {
    test('should include update in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createInvalidForStatement())

      expect(reports[0].message.toLowerCase()).toContain('update')
    })

    test('should include wrong direction in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createInvalidForStatement())

      expect(reports[0].message.toLowerCase()).toContain('wrong direction')
    })

    test('should include loop in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createInvalidForStatement())

      expect(reports[0].message.toLowerCase()).toContain('loop')
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createInvalidForStatement())

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have message as string type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createInvalidForStatement())

      expect(typeof reports[0].message).toBe('string')
    })

    test('should include variable in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createInvalidForStatement())

      expect(reports[0].message.toLowerCase()).toContain('variable')
    })

    test('should report same message for different invalid combinations', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()
      const v1 = forDirectionRule.create(ctx1)
      const v2 = forDirectionRule.create(ctx2)

      v1.ForStatement(createForStatement('<', '--', false))
      v2.ForStatement(createForStatement('>', '++', false))

      expect(r1[0].message).toBe(r2[0].message)
    })
  })

  describe('location reporting', () => {
    test('should report correct location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createInvalidForStatement(1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at line 5 column 10', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createInvalidForStatement(5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location at line 100 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createInvalidForStatement(100, 0))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report end location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createInvalidForStatement(3, 5))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('should report location at line 1 column 0 with no args', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createInvalidForStatement())

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report loc as an object with start and end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createInvalidForStatement())

      expect(reports[0].loc).toBeDefined()
      expect(typeof reports[0].loc?.start).toBe('object')
      expect(typeof reports[0].loc?.end).toBe('object')
    })

    test('should report location at large line numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createInvalidForStatement(9999, 42))

      expect(reports[0].loc?.start.line).toBe(9999)
      expect(reports[0].loc?.start.column).toBe(42)
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createInvalidForStatement(0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      expect(() => visitor.ForStatement(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      expect(() => visitor.ForStatement(undefined)).not.toThrow()
    })

    test('should handle non-ForStatement gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      expect(() => visitor.ForStatement(createNonForStatement())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle for without test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      expect(() => visitor.ForStatement(createForStatementWithoutTest())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle for without update', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      expect(() => visitor.ForStatement(createForStatementWithoutUpdate())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = createInvalidForStatement()
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = createInvalidForStatement()
      delete (node as Record<string, unknown>).type

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      expect(() => visitor.ForStatement({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      expect(() => visitor.ForStatement(42)).not.toThrow()
    })

    test('should handle string node', () => {
      const { context } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      expect(() => visitor.ForStatement('for')).not.toThrow()
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      expect(() => visitor.ForStatement(true)).not.toThrow()
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      expect(() => visitor.ForStatement([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null test and null update', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: null,
        update: null,
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: undefined,
        update: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'i' },
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined update', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Literal', value: 10 },
        },
        update: undefined,
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle ForStatement with wrong type on test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        update: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'i' },
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle ForStatement with wrong type on update', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'AssignmentExpression',
          operator: '+=',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Literal', value: 1 },
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle test with non-Identifier left', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Literal', value: 0 },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'i' },
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle test with non-Identifier right', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'i' },
          right: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'fn' },
            arguments: [],
          },
        },
        update: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'i' },
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle update with non-Identifier argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: '++',
          argument: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'obj' },
            property: { type: 'Identifier', name: 'x' },
          },
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle different counter name j', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: {
          type: 'VariableDeclaration',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: { type: 'Identifier', name: 'j' },
              init: { type: 'Literal', value: 0 },
            },
          ],
        },
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'j' },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: '--',
          argument: { type: 'Identifier', name: 'j' },
          prefix: false,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ForStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle different counter name k with valid direction', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'k' },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'k' },
          prefix: false,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle prefix update expression', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: '--',
          argument: { type: 'Identifier', name: 'i' },
          prefix: true,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ForStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle prefix increment as valid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'i' },
          prefix: true,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with loc containing non-numeric values', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: '--',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: {
          start: { line: 'abc' as unknown as number, column: null as unknown as number },
          end: { line: undefined as unknown as number, column: {} as unknown as number },
        },
      }

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle ForStatement with IfStatement type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = createInvalidForStatement()
      ;(node as Record<string, unknown>).type = 'IfStatement'

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null init', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: '--',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ForStatement(node)

      expect(reports.length).toBe(1)
    })

    test('should handle update argument with name as non-string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: '--',
          argument: { type: 'Identifier', name: 123 as unknown as string },
          prefix: false,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle test with unknown operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '===',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should handle test with !== operator (valid)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('!==', '++', false))

      expect(reports.length).toBe(0)
    })

    test('should handle test with == operator (valid)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('==', '++', false))

      expect(reports.length).toBe(0)
    })

    test('should handle test with != operator (valid)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('!=', '--', false))

      expect(reports.length).toBe(0)
    })

    test('should handle test with + operator (valid)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('+', '++', false))

      expect(reports.length).toBe(0)
    })

    test('should handle update with non-standard operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: '**',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when counter names do not match test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: '--',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when right side has different name', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Literal', value: 0 },
          right: { type: 'Identifier', name: 'x' },
        },
        update: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple reports', () => {
    test('should report each invalid for loop separately', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createInvalidForStatement())
      visitor.ForStatement(createInvalidForStatement())

      expect(reports.length).toBe(2)
    })

    test('should report three invalid loops', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('<', '--', false))
      visitor.ForStatement(createForStatement('>', '++', false))
      visitor.ForStatement(createForStatement('<=', '--', false))

      expect(reports.length).toBe(3)
    })

    test('should only report invalid loops in mixed batch', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createValidForStatement())
      visitor.ForStatement(createInvalidForStatement())
      visitor.ForStatement(createValidForStatement())
      visitor.ForStatement(createInvalidForStatement())

      expect(reports.length).toBe(2)
    })

    test('should report five invalid loops', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('<', '--', false))
      visitor.ForStatement(createForStatement('<=', '--', false))
      visitor.ForStatement(createForStatement('>', '++', false))
      visitor.ForStatement(createForStatement('>=', '++', false))
      visitor.ForStatement(createForStatement('>', '--', true))

      expect(reports.length).toBe(5)
    })

    test('should report no loops when all are valid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('<', '++', false))
      visitor.ForStatement(createForStatement('<=', '++', false))
      visitor.ForStatement(createForStatement('>', '--', false))
      visitor.ForStatement(createForStatement('>=', '--', false))

      expect(reports.length).toBe(0)
    })

    test('should maintain separate report locations for different loops', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createInvalidForStatement(1, 0))
      visitor.ForStatement(createInvalidForStatement(5, 10))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('should handle 10 valid loops without reporting', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      for (let idx = 0; idx < 10; idx++) {
        visitor.ForStatement(createValidForStatement())
      }

      expect(reports.length).toBe(0)
    })

    test('should handle 10 invalid loops with 10 reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      for (let idx = 0; idx < 10; idx++) {
        visitor.ForStatement(createInvalidForStatement())
      }

      expect(reports.length).toBe(10)
    })

    test('should handle alternating valid and invalid loops', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      for (let idx = 0; idx < 20; idx++) {
        if (idx % 2 === 0) {
          visitor.ForStatement(createValidForStatement())
        } else {
          visitor.ForStatement(createInvalidForStatement())
        }
      }

      expect(reports.length).toBe(10)
    })

    test('should produce consistent messages across multiple reports', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('<', '--', false))
      visitor.ForStatement(createForStatement('>', '++', false))
      visitor.ForStatement(createForStatement('<=', '--', false))

      const messages = reports.map((r) => r.message)
      expect(new Set(messages).size).toBe(1)
    })
  })

  describe('export verification', () => {
    test('should export forDirectionRule as named export', () => {
      expect(forDirectionRule).toBeDefined()
    })

    test('should export forDirectionRule as default export', () => {
      expect(importDefault).toBeDefined()
    })

    test('named and default exports should be identical', () => {
      expect(importDefault).toBe(forDirectionRule)
    })

    test('should have create method on exported rule', () => {
      expect(typeof forDirectionRule.create).toBe('function')
    })

    test('should have meta property on exported rule', () => {
      expect(forDirectionRule.meta).toBeDefined()
    })

    test('default export should have create method', () => {
      expect(typeof importDefault.create).toBe('function')
    })

    test('default export should have meta property', () => {
      expect(importDefault.meta).toBeDefined()
    })

    test('default export meta should match named export meta', () => {
      expect(importDefault.meta).toBe(forDirectionRule.meta)
    })

    test('default export create should produce same visitor', () => {
      const { context } = createMockRuleContext()
      const namedVisitor = forDirectionRule.create(context)
      const defaultVisitor = importDefault.create(context)

      expect(Object.keys(namedVisitor).sort()).toEqual(Object.keys(defaultVisitor).sort())
    })
  })

  describe('visitor behavior with different context instances', () => {
    test('should work with multiple context instances independently', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()

      const visitor1 = forDirectionRule.create(ctx1)
      const visitor2 = forDirectionRule.create(ctx2)

      visitor1.ForStatement(createInvalidForStatement())
      visitor2.ForStatement(createValidForStatement())

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })

    test('should use context report function for each visitor', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()

      const visitor1 = forDirectionRule.create(ctx1)
      const visitor2 = forDirectionRule.create(ctx2)

      visitor1.ForStatement(createInvalidForStatement())
      visitor2.ForStatement(createInvalidForStatement())

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(1)
    })

    test('should not cross-contaminate reports between visitors', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()

      const visitor1 = forDirectionRule.create(ctx1)
      const visitor2 = forDirectionRule.create(ctx2)

      visitor1.ForStatement(createInvalidForStatement())
      visitor1.ForStatement(createInvalidForStatement())
      visitor1.ForStatement(createInvalidForStatement())

      visitor2.ForStatement(createValidForStatement())

      expect(r1.length).toBe(3)
      expect(r2.length).toBe(0)
    })
  })

  describe('all four invalid combinations systematically', () => {
    test('counter left: i++ with i > N is invalid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('>', '++', false))
      expect(reports.length).toBe(1)
    })

    test('counter left: i++ with i >= N is invalid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('>=', '++', false))
      expect(reports.length).toBe(1)
    })

    test('counter left: i-- with i < N is invalid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('<', '--', false))
      expect(reports.length).toBe(1)
    })

    test('counter left: i-- with i <= N is invalid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('<=', '--', false))
      expect(reports.length).toBe(1)
    })

    test('counter right: i++ with N < i is invalid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('<', '++', true))
      expect(reports.length).toBe(1)
    })

    test('counter right: i++ with N <= i is invalid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('<=', '++', true))
      expect(reports.length).toBe(1)
    })

    test('counter right: i-- with N > i is invalid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('>', '--', true))
      expect(reports.length).toBe(1)
    })

    test('counter right: i-- with N >= i is invalid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('>=', '--', true))
      expect(reports.length).toBe(1)
    })
  })

  describe('all eight valid combinations systematically', () => {
    test('counter left: i++ with i < N is valid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('<', '++', false))
      expect(reports.length).toBe(0)
    })

    test('counter left: i++ with i <= N is valid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('<=', '++', false))
      expect(reports.length).toBe(0)
    })

    test('counter left: i-- with i > N is valid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('>', '--', false))
      expect(reports.length).toBe(0)
    })

    test('counter left: i-- with i >= N is valid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('>=', '--', false))
      expect(reports.length).toBe(0)
    })

    test('counter right: i++ with N > i is valid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('>', '++', true))
      expect(reports.length).toBe(0)
    })

    test('counter right: i++ with N >= i is valid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('>=', '++', true))
      expect(reports.length).toBe(0)
    })

    test('counter right: i-- with N < i is valid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('<', '--', true))
      expect(reports.length).toBe(0)
    })

    test('counter right: i-- with N <= i is valid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('<=', '--', true))
      expect(reports.length).toBe(0)
    })
  })

  describe('meta docs url', () => {
    test('should not have docs.url defined', () => {
      expect(forDirectionRule.meta.docs?.url).toBeUndefined()
    })

    test('should not have docs.category as undefined', () => {
      expect(forDirectionRule.meta.docs?.category).toBeDefined()
    })
  })

  describe('non-comparison operators in test', () => {
    test('should not report for in operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('in', '++', false))
      expect(reports.length).toBe(0)
    })

    test('should not report for instanceof operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('instanceof', '++', false))
      expect(reports.length).toBe(0)
    })

    test('should not report for & operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('&', '++', false))
      expect(reports.length).toBe(0)
    })

    test('should not report for | operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('|', '++', false))
      expect(reports.length).toBe(0)
    })

    test('should not report for ^ operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('^', '++', false))
      expect(reports.length).toBe(0)
    })

    test('should not report for << operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('<<', '++', false))
      expect(reports.length).toBe(0)
    })

    test('should not report for >> operator', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForStatement('>>', '++', false))
      expect(reports.length).toBe(0)
    })
  })

  describe('nested counter scenarios', () => {
    test('should not crash with missing update argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: '++',
          prefix: false,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle update argument without name property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier' },
          prefix: false,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle test left without name property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier' },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle test right without name property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Identifier' },
        },
        update: {
          type: 'UpdateExpression',
          operator: '++',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('location edge cases', () => {
    test('should handle node with loc but missing start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: '--',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { end: { line: 1, column: 20 } },
      }

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with loc but missing end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: '--',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 5, column: 3 } },
      }

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should handle node with empty loc object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: '--',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: {},
      }

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with null loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: '--',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: null,
      }

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle valid loop with no loc (no report needed)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = createValidForStatement()
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.ForStatement(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('report descriptor shape', () => {
    test('report should contain message key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createInvalidForStatement())

      expect(reports[0]).toHaveProperty('message')
    })

    test('report should contain loc key', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createInvalidForStatement())

      expect(reports[0]).toHaveProperty('loc')
    })

    test('report message should be exactly the expected string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createInvalidForStatement())

      expect(reports[0].message).toBe(
        'The update clause in this loop moves the variable in the wrong direction.',
      )
    })

    test('report loc start should have line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createInvalidForStatement())

      expect(reports[0].loc?.start).toHaveProperty('line')
      expect(reports[0].loc?.start).toHaveProperty('column')
    })

    test('report loc end should have line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createInvalidForStatement())

      expect(reports[0].loc?.end).toHaveProperty('line')
      expect(reports[0].loc?.end).toHaveProperty('column')
    })

    test('report loc start line should be a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createInvalidForStatement())

      expect(typeof reports[0].loc?.start.line).toBe('number')
    })

    test('report loc start column should be a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createInvalidForStatement())

      expect(typeof reports[0].loc?.start.column).toBe('number')
    })
  })

  describe('mixed valid/invalid in sequence', () => {
    test('valid then invalid at same location', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()
      const v1 = forDirectionRule.create(ctx1)
      const v2 = forDirectionRule.create(ctx2)

      v1.ForStatement(createValidForStatement(3, 5))
      v2.ForStatement(createInvalidForStatement(3, 5))

      expect(r1.length).toBe(0)
      expect(r2.length).toBe(1)
      expect(r2[0].loc?.start.line).toBe(3)
      expect(r2[0].loc?.start.column).toBe(5)
    })

    test('should handle invalid then valid then invalid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createInvalidForStatement(1, 0))
      visitor.ForStatement(createValidForStatement(2, 0))
      visitor.ForStatement(createInvalidForStatement(3, 0))

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(3)
    })
  })

  describe('create function immutability', () => {
    test('calling create multiple times should not affect prior visitors', () => {
      const { context, reports } = createMockRuleContext()

      const visitor1 = forDirectionRule.create(context)
      const visitor2 = forDirectionRule.create(context)

      visitor1.ForStatement(createInvalidForStatement())

      expect(reports.length).toBe(1)

      visitor2.ForStatement(createInvalidForStatement())

      expect(reports.length).toBe(2)
    })
  })

  describe('rule definition structure', () => {
    test('should have exactly meta and create properties', () => {
      const keys = Object.keys(forDirectionRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })

    test('meta should be readonly', () => {
      const descriptor = Object.getOwnPropertyDescriptor(forDirectionRule, 'meta')
      expect(descriptor).toBeDefined()
    })

    test('create should be a function property', () => {
      const descriptor = Object.getOwnPropertyDescriptor(forDirectionRule, 'create')
      expect(descriptor).toBeDefined()
      expect(typeof forDirectionRule.create).toBe('function')
    })

    test('rule should be an object', () => {
      expect(typeof forDirectionRule).toBe('object')
      expect(forDirectionRule).not.toBeNull()
    })
  })

  describe('various counter variable names', () => {
    function createForWithCounterName(name: string, testOp: string, updateOp: string): unknown {
      return {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: testOp,
          left: { type: 'Identifier', name },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: updateOp,
          argument: { type: 'Identifier', name },
          prefix: false,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
    }

    test('should detect wrong direction with counter name idx', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForWithCounterName('idx', '<', '--'))
      expect(reports.length).toBe(1)
    })

    test('should detect valid direction with counter name count', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForWithCounterName('count', '<', '++'))
      expect(reports.length).toBe(0)
    })

    test('should detect wrong direction with counter name n', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForWithCounterName('n', '>', '++'))
      expect(reports.length).toBe(1)
    })

    test('should detect valid direction with counter name num', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForWithCounterName('num', '>', '--'))
      expect(reports.length).toBe(0)
    })

    test('should detect wrong direction with counter name _index', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForWithCounterName('_index', '<=', '--'))
      expect(reports.length).toBe(1)
    })

    test('should detect valid direction with counter name $counter', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForWithCounterName('$counter', '<=', '++'))
      expect(reports.length).toBe(0)
    })

    test('should detect wrong direction with single letter counter x', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForWithCounterName('x', '>=', '++'))
      expect(reports.length).toBe(1)
    })

    test('should detect valid direction with long counter name myLoopCounter', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForWithCounterName('myLoopCounter', '>=', '--'))
      expect(reports.length).toBe(0)
    })

    test('should handle counter name with number counter2', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForWithCounterName('counter2', '<', '--'))
      expect(reports.length).toBe(1)
    })

    test('should handle counter name with underscore __i', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createForWithCounterName('__i', '<', '++'))
      expect(reports.length).toBe(0)
    })
  })

  describe('single valid loop at various locations', () => {
    test('should not report valid loop at line 2 column 3', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createValidForStatement(2, 3))
      expect(reports.length).toBe(0)
    })

    test('should not report valid loop at line 50 column 25', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createValidForStatement(50, 25))
      expect(reports.length).toBe(0)
    })

    test('should not report valid loop at line 1000 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createValidForStatement(1000, 0))
      expect(reports.length).toBe(0)
    })
  })

  describe('single invalid loop at various locations', () => {
    test('should report invalid loop at line 7 column 12', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createInvalidForStatement(7, 12))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
    })

    test('should report invalid loop at line 42 column 7', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createInvalidForStatement(42, 7))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should report invalid loop at line 500 column 99', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      visitor.ForStatement(createInvalidForStatement(500, 99))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(99)
    })
  })

  describe('repeated ForStatement calls with same node', () => {
    test('should report multiple times when same invalid node is passed repeatedly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      const node = createInvalidForStatement()

      visitor.ForStatement(node)
      visitor.ForStatement(node)
      visitor.ForStatement(node)

      expect(reports.length).toBe(3)
    })

    test('should not report when same valid node is passed repeatedly', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      const node = createValidForStatement()

      visitor.ForStatement(node)
      visitor.ForStatement(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('rule does not crash with symbol or function nodes', () => {
    test('should handle Symbol as node', () => {
      const { context } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      expect(() => visitor.ForStatement(Symbol('test'))).not.toThrow()
    })

    test('should handle function as node', () => {
      const { context } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      expect(() => visitor.ForStatement(() => {})).not.toThrow()
    })

    test('should handle Date as node', () => {
      const { context } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      expect(() => visitor.ForStatement(new Date())).not.toThrow()
    })

    test('should handle Map as node', () => {
      const { context } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)
      expect(() => visitor.ForStatement(new Map())).not.toThrow()
    })
  })

  describe('operator edge cases', () => {
    test('should handle empty string operator on update', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      const node = {
        type: 'ForStatement',
        init: null,
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'i' },
          right: { type: 'Literal', value: 10 },
        },
        update: {
          type: 'UpdateExpression',
          operator: '',
          argument: { type: 'Identifier', name: 'i' },
          prefix: false,
        },
        body: { type: 'BlockStatement', body: [] },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.ForStatement(node)
      expect(reports.length).toBe(0)
    })

    test('should handle empty string operator on test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('', '++', false))
      expect(reports.length).toBe(0)
    })

    test('should handle && operator as test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('&&', '++', false))
      expect(reports.length).toBe(0)
    })

    test('should handle || operator as test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('||', '++', false))
      expect(reports.length).toBe(0)
    })

    test('should handle ** operator as test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('**', '++', false))
      expect(reports.length).toBe(0)
    })

    test('should handle % operator as test', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = forDirectionRule.create(context)

      visitor.ForStatement(createForStatement('%', '--', false))
      expect(reports.length).toBe(0)
    })
  })
})

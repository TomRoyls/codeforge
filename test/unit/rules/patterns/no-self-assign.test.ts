import { describe, test, expect, vi } from 'vitest'
import { noSelfAssignRule } from '../../../../src/rules/patterns/no-self-assign.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: name.length },
    },
  }
}

function createMemberExpression(object: unknown, property: unknown, line = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object,
    property,
    computed: false,
    loc: {
      start: { line, column },
      end: { line, column: 10 },
    },
  }
}

function createAssignmentExpression(left: unknown, right: unknown, line = 1, column = 0): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left,
    right,
    loc: {
      start: { line, column },
      end: { line, column: 5 },
    },
  }
}

describe('no-self-assign rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noSelfAssignRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noSelfAssignRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noSelfAssignRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noSelfAssignRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention assignments in description', () => {
      expect(noSelfAssignRule.meta.docs?.description.toLowerCase()).toContain('assignment')
    })

    test('should have exact description text', () => {
      expect(noSelfAssignRule.meta.docs?.description).toBe(
        'Disallow assignments where both sides are exactly the same.',
      )
    })

    test('should mention self in description', () => {
      expect(noSelfAssignRule.meta.docs?.description.toLowerCase()).toContain('same')
    })

    test('should have schema as empty array', () => {
      expect(noSelfAssignRule.meta.schema).toEqual([])
    })

    test('should have fixable as undefined', () => {
      expect(noSelfAssignRule.meta.fixable).toBeUndefined()
    })

    test('should have docs object defined', () => {
      expect(noSelfAssignRule.meta.docs).toBeDefined()
    })

    test('should have docs.description as non-empty string', () => {
      expect(typeof noSelfAssignRule.meta.docs?.description).toBe('string')
      expect(noSelfAssignRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs.category as non-empty string', () => {
      expect(typeof noSelfAssignRule.meta.docs?.category).toBe('string')
      expect(noSelfAssignRule.meta.docs?.category!.length).toBeGreaterThan(0)
    })

    test('should have docs.recommended as boolean', () => {
      expect(typeof noSelfAssignRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have docs.url', () => {
      expect(noSelfAssignRule.meta.docs?.url).toBeDefined()
    })

    test('should not be deprecated', () => {
      expect(noSelfAssignRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noSelfAssignRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noSelfAssignRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have meta.type as valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noSelfAssignRule.meta.type)
    })

    test('should have meta.severity as valid Severity', () => {
      expect(['off', 'warn', 'error']).toContain(noSelfAssignRule.meta.severity)
    })

    test('should have meta as plain object', () => {
      expect(typeof noSelfAssignRule.meta).toBe('object')
      expect(noSelfAssignRule.meta).not.toBeNull()
    })
  })

  describe('create', () => {
    test('should return visitor with AssignmentExpression method', () => {
      const { context } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      expect(visitor).toHaveProperty('AssignmentExpression')
    })

    test('AssignmentExpression should be a function', () => {
      const { context } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      expect(typeof visitor.AssignmentExpression).toBe('function')
    })

    test('should return visitor with exactly one key', () => {
      const { context } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      expect(Object.keys(visitor).length).toBe(1)
    })

    test('should return new visitor on each create call', () => {
      const { context } = createMockRuleContext({ source: 'a = a' })
      const visitor1 = noSelfAssignRule.create(context)
      const visitor2 = noSelfAssignRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should return object from create', () => {
      const { context } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('visitor AssignmentExpression should accept one argument', () => {
      const { context } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      expect(visitor.AssignmentExpression.length).toBe(1)
    })

    test('create should be a function', () => {
      expect(typeof noSelfAssignRule.create).toBe('function')
    })

    test('create should accept context argument', () => {
      const { context } = createMockRuleContext({ source: 'a = a' })
      expect(() => noSelfAssignRule.create(context)).not.toThrow()
    })

    test('visitor should not have other common AST handler names', () => {
      const { context } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      expect(visitor).not.toHaveProperty('Identifier')
      expect(visitor).not.toHaveProperty('Literal')
      expect(visitor).not.toHaveProperty('CallExpression')
      expect(visitor).not.toHaveProperty('BinaryExpression')
    })

    test('create with different contexts should work', () => {
      const ctx1 = createMockRuleContext({ source: 'a = a' })
      const ctx2 = createMockRuleContext({ source: 'a = a' })

      expect(() => {
        noSelfAssignRule.create(ctx1.context)
        noSelfAssignRule.create(ctx2.context)
      }).not.toThrow()
    })
  })

  describe('valid cases', () => {
    test('should not report assignment to different identifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('a'), createIdentifier('b'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment of different member expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('x')),
        createMemberExpression(createIdentifier('obj'), createIdentifier('y')),
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment to different objects', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createMemberExpression(createIdentifier('obj1'), createIdentifier('x')),
        createMemberExpression(createIdentifier('obj2'), createIdentifier('x')),
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment of identifier to member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createIdentifier('a'),
        createMemberExpression(createIdentifier('obj'), createIdentifier('x')),
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment of member expression to identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('x')),
        createIdentifier('a'),
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report assignment with compound operator when same operand', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '+=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report assignment with computed properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('x')),
        createMemberExpression(createIdentifier('obj'), { type: 'Literal', value: 'y' }),
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment of nested member expressions with different paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createMemberExpression(
          createMemberExpression(createIdentifier('obj'), createIdentifier('a')),
          createIdentifier('x'),
        ),
        createMemberExpression(
          createMemberExpression(createIdentifier('obj'), createIdentifier('b')),
          createIdentifier('x'),
        ),
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report assignment with different property values', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('x')),
        createMemberExpression(createIdentifier('obj'), createIdentifier('y')),
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x = y', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createIdentifier('y')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report foo = bar', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('foo'), createIdentifier('bar')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report camelCase = PascalCase', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('myVar'), createIdentifier('MyVar')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report _private = public', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('_private'), createIdentifier('public')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report $jquery = element', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('$jquery'), createIdentifier('element')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report UPPER_CASE = lower_case', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('MAX_SIZE'), createIdentifier('max_size')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report single letter different identifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('i'), createIdentifier('j')),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report long different identifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(
          createIdentifier('veryLongVariableName1'),
          createIdentifier('veryLongVariableName2'),
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report a = b with different member objects', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createMemberExpression(createIdentifier('foo'), createIdentifier('bar')),
        createMemberExpression(createIdentifier('baz'), createIdentifier('bar')),
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report deeply nested members with different middle', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const left = createMemberExpression(
        createMemberExpression(
          createMemberExpression(createIdentifier('a'), createIdentifier('b')),
          createIdentifier('c'),
        ),
        createIdentifier('d'),
      )
      const right = createMemberExpression(
        createMemberExpression(
          createMemberExpression(createIdentifier('a'), createIdentifier('x')),
          createIdentifier('c'),
        ),
        createIdentifier('d'),
      )
      const node = createAssignmentExpression(left, right)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report a.x = b.x', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createMemberExpression(createIdentifier('a'), createIdentifier('x')),
        createMemberExpression(createIdentifier('b'), createIdentifier('x')),
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report a += b with different operands', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '+=',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report a -= b with different operands', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '-=',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report a *= b with different operands', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '*=',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report a /= b with different operands', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '/=',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report a %= b with different operands', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '%=',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report a **= b with different operands', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '**=',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report a <<= b with different operands', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '<<=',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report a >>= b with different operands', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '>>=',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report a >>>= b with different operands', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '>>>=',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report a &= b with different operands', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '&=',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report a |= b with different operands', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '|=',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report a ^= b with different operands', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '^=',
        left: createIdentifier('a'),
        right: createIdentifier('b'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is identifier and right is literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('a'), { type: 'Literal', value: 1 })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left and right are different literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        { type: 'Literal', value: 1 },
        { type: 'Literal', value: 2 },
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is member and right is call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('x')),
        { type: 'CallExpression', callee: createIdentifier('fn'), arguments: [] },
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left and right have different node types', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        { type: 'ThisExpression' },
        { type: 'Identifier', name: 'self' },
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid cases', () => {
    test('should report self assignment of identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('a'), createIdentifier('a'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Self assignment')
    })

    test('should report self assignment of member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('x')),
        createMemberExpression(createIdentifier('obj'), createIdentifier('x')),
      )
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Self assignment')
    })

    test('should report self assignment of nested member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const nested = createMemberExpression(
        createMemberExpression(createIdentifier('obj'), createIdentifier('a')),
        createIdentifier('x'),
      )
      const node = createAssignmentExpression(nested, nested)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Self assignment')
    })

    test('should report self assignment with correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createIdentifier('a', 5, 10),
        createIdentifier('a', 5, 10),
        5,
        10,
      )
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should not report self assignment of member with computed property (not supported)', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const computedMember = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: { type: 'Literal', value: 'x' },
        computed: true,
      }
      const node = createAssignmentExpression(computedMember, computedMember)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report self assignment for each occurrence', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createIdentifier('a')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createIdentifier('b')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('c'), createIdentifier('c')),
      )

      expect(reports.length).toBe(3)
    })

    test('should report self assignment of x = x', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createIdentifier('x')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report self assignment of foo = foo', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('foo'), createIdentifier('foo')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report self assignment of _private = _private', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('_private'), createIdentifier('_private')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report self assignment of $jquery = $jquery', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('$jquery'), createIdentifier('$jquery')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report self assignment of myVar = myVar', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('myVar'), createIdentifier('myVar')),
      )

      expect(reports.length).toBe(1)
    })

    test('should report self assignment of obj.prop = obj.prop', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const left = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))
      const right = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))
      visitor.AssignmentExpression(createAssignmentExpression(left, right))

      expect(reports.length).toBe(1)
    })

    test('should report self assignment of data.value = data.value', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const left = createMemberExpression(createIdentifier('data'), createIdentifier('value'))
      const right = createMemberExpression(createIdentifier('data'), createIdentifier('value'))
      visitor.AssignmentExpression(createAssignmentExpression(left, right))

      expect(reports.length).toBe(1)
    })

    test('should report self assignment of a.b.c = a.b.c (separate instances)', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const left = createMemberExpression(
        createMemberExpression(createIdentifier('a'), createIdentifier('b')),
        createIdentifier('c'),
      )
      const right = createMemberExpression(
        createMemberExpression(createIdentifier('a'), createIdentifier('b')),
        createIdentifier('c'),
      )
      visitor.AssignmentExpression(createAssignmentExpression(left, right))

      expect(reports.length).toBe(1)
    })

    test('should report self assignment of deeply nested a.b.c.d = a.b.c.d', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const deepLeft = createMemberExpression(
        createMemberExpression(
          createMemberExpression(createIdentifier('a'), createIdentifier('b')),
          createIdentifier('c'),
        ),
        createIdentifier('d'),
      )
      const deepRight = createMemberExpression(
        createMemberExpression(
          createMemberExpression(createIdentifier('a'), createIdentifier('b')),
          createIdentifier('c'),
        ),
        createIdentifier('d'),
      )
      visitor.AssignmentExpression(createAssignmentExpression(deepLeft, deepRight))

      expect(reports.length).toBe(1)
    })

    test('should report compound self assignment a += a', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '+=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report compound self assignment a -= a', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '-=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report compound self assignment a *= a', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '*=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report compound self assignment a /= a', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '/=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report compound self assignment a %= a', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '%=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report compound self assignment a **= a', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '**=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report compound self assignment a <<= a', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '<<=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report compound self assignment a >>= a', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '>>=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report compound self assignment a >>>= a', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '>>>=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 8 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report compound self assignment a &= a', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '&=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report compound self assignment a |= a', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '|=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report compound self assignment a ^= a', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '^=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 6 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report same node reference for left and right', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const id = createIdentifier('x')
      const node = createAssignmentExpression(id, id)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report two separate self-assignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createIdentifier('a')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createIdentifier('b')),
      )

      expect(reports.length).toBe(2)
    })

    test('should report only self-assignments in mixed batch', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createIdentifier('a')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createIdentifier('c')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('d'), createIdentifier('d')),
      )

      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('Self assignment')
      expect(reports[1].message).toContain('Self assignment')
    })
  })

  describe('message content', () => {
    test('message should contain Self assignment', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createIdentifier('a')),
      )

      expect(reports[0].message).toContain('Self assignment')
    })

    test('message should contain no effect', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createIdentifier('a')),
      )

      expect(reports[0].message.toLowerCase()).toContain('no effect')
    })

    test('message should be non-empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createIdentifier('a')),
      )

      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('message should be exact expected text', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createIdentifier('a')),
      )

      expect(reports[0].message).toBe('Self assignment has no effect.')
    })

    test('message should end with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createIdentifier('x')),
      )

      expect(reports[0].message.endsWith('.')).toBe(true)
    })
  })

  describe('location reporting', () => {
    test('should report correct start line', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('a'), createIdentifier('a'), 7, 3)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('should report correct start column', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('a'), createIdentifier('a'), 1, 5)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createIdentifier('a')),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct end line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createIdentifier('a')),
      )

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(5)
    })

    test('should report location at high line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('z'), createIdentifier('z'), 999, 50)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(999)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('a'), createIdentifier('a'), 0, 0)
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should provide default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('a'), createIdentifier('a'))
      delete (node as Record<string, unknown>).loc

      visitor.AssignmentExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should provide default location when loc is null', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: null,
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc).toBeDefined()
    })

    test('should handle loc with missing start gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { end: { line: 1, column: 5 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with missing end gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 3, column: 2 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should handle loc with non-numeric line', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 'one', column: 0 }, end: { line: 'two', column: 5 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle loc with non-numeric column', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: 'zero' }, end: { line: 1, column: 'five' } },
      }
      visitor.AssignmentExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report different locations for different self-assignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createIdentifier('a'), 2, 0),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createIdentifier('b'), 5, 10),
      )

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without left property', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        right: createIdentifier('a'),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without right property', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('a'),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property (provides default location)', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('a'), createIdentifier('a'))
      delete (node as Record<string, unknown>).loc

      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle non-AssignmentExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'Identifier',
        name: 'a',
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty object as node', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      expect(() => visitor.AssignmentExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null left', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: null,
        right: createIdentifier('a'),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with null right', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('a'),
        right: null,
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined left', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: undefined,
        right: createIdentifier('a'),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined right', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('a'),
        right: undefined,
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with string left', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: 'a',
        right: createIdentifier('a'),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with string right', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('a'),
        right: 'a',
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric left', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: 42,
        right: createIdentifier('a'),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric right', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('a'),
        right: 42,
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with array left', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: [createIdentifier('a')],
        right: createIdentifier('a'),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with array right', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('a'),
        right: [createIdentifier('a')],
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        operator: '=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      expect(() => visitor.AssignmentExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      expect(() => visitor.AssignmentExpression('node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with both null left and right', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: null,
        right: null,
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with empty string identifier name', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const emptyId = { type: 'Identifier', name: '' }
      const node = createAssignmentExpression(emptyId, emptyId)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with empty left and right objects', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: {},
        right: {},
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node where left type does not match right type', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('a'), {
        type: 'SomeOtherType',
        name: 'a',
      })
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle identifier without name property', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const idNoName = { type: 'Identifier' }
      const node = createAssignmentExpression(idNoName, idNoName)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle member expression without object property', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const memberNoObj = { type: 'MemberExpression', property: createIdentifier('x') }
      const node = createAssignmentExpression(memberNoObj, memberNoObj)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle member expression without property', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const memberNoProp = { type: 'MemberExpression', object: createIdentifier('obj') }
      const node = createAssignmentExpression(memberNoProp, memberNoProp)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle missing operator in node', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with numeric type', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 42,
        left: createIdentifier('a'),
        right: createIdentifier('a'),
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle deeply equal but distinct member expression objects', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const left = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))
      const right = createMemberExpression(createIdentifier('obj'), createIdentifier('prop'))

      expect(left).not.toBe(right)

      const node = createAssignmentExpression(left, right)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('export verification', () => {
    test('should export noSelfAssignRule as named export', () => {
      expect(noSelfAssignRule).toBeDefined()
    })

    test('should have meta property', () => {
      expect(noSelfAssignRule).toHaveProperty('meta')
    })

    test('should have create property', () => {
      expect(noSelfAssignRule).toHaveProperty('create')
    })

    test('should have exactly meta and create properties', () => {
      const keys = Object.keys(noSelfAssignRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })

    test('should be an object', () => {
      expect(typeof noSelfAssignRule).toBe('object')
      expect(noSelfAssignRule).not.toBeNull()
    })
  })

  describe('visitor independence', () => {
    test('different contexts should track reports independently', () => {
      const ctx1 = createMockRuleContext({ source: 'a = a' })
      const ctx2 = createMockRuleContext({ source: 'a = a' })
      const visitor1 = noSelfAssignRule.create(ctx1.context)
      const visitor2 = noSelfAssignRule.create(ctx2.context)

      visitor1.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createIdentifier('a')),
      )
      visitor2.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createIdentifier('c')),
      )

      expect(ctx1.reports.length).toBe(1)
      expect(ctx2.reports.length).toBe(0)
    })

    test('same visitor can process multiple nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier('a'), createIdentifier('a')),
        )
      }

      expect(reports.length).toBe(10)
    })

    test('visitor accumulates reports correctly across mixed calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createIdentifier('a')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('b'), createIdentifier('c')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('d'), createIdentifier('d')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('e'), createIdentifier('f')),
      )

      expect(reports.length).toBe(2)
    })

    test('visitor from separate create calls are independent', () => {
      const ctx1 = createMockRuleContext({ source: 'a = a' })
      const ctx2 = createMockRuleContext({ source: 'a = a' })
      const visitor1 = noSelfAssignRule.create(ctx1.context)
      const visitor2 = noSelfAssignRule.create(ctx2.context)

      visitor1.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createIdentifier('x')),
      )
      visitor2.AssignmentExpression(
        createAssignmentExpression(createIdentifier('y'), createIdentifier('y')),
      )

      expect(ctx1.reports.length).toBe(1)
      expect(ctx2.reports.length).toBe(1)
      expect(ctx1.reports[0].message).toBe('Self assignment has no effect.')
      expect(ctx2.reports[0].message).toBe('Self assignment has no effect.')
    })
  })

  describe('areNodesEqual behavior', () => {
    test('should detect equal simple identifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const left = createIdentifier('test')
      const right = createIdentifier('test')
      visitor.AssignmentExpression(createAssignmentExpression(left, right))

      expect(reports.length).toBe(1)
    })

    test('should not report identifiers differing only by case', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const left = createIdentifier('Test')
      const right = createIdentifier('test')
      visitor.AssignmentExpression(createAssignmentExpression(left, right))

      expect(reports.length).toBe(0)
    })

    test('should not report identifiers with different lengths', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const left = createIdentifier('a')
      const right = createIdentifier('ab')
      visitor.AssignmentExpression(createAssignmentExpression(left, right))

      expect(reports.length).toBe(0)
    })

    test('should detect equal single-level member expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const left = createMemberExpression(createIdentifier('a'), createIdentifier('b'))
      const right = createMemberExpression(createIdentifier('a'), createIdentifier('b'))
      visitor.AssignmentExpression(createAssignmentExpression(left, right))

      expect(reports.length).toBe(1)
    })

    test('should detect equal two-level member expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const innerLeft = createMemberExpression(createIdentifier('a'), createIdentifier('b'))
      const innerRight = createMemberExpression(createIdentifier('a'), createIdentifier('b'))
      const left = createMemberExpression(innerLeft, createIdentifier('c'))
      const right = createMemberExpression(innerRight, createIdentifier('c'))
      visitor.AssignmentExpression(createAssignmentExpression(left, right))

      expect(reports.length).toBe(1)
    })

    test('should not report when member expression objects differ', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const left = createMemberExpression(createIdentifier('a'), createIdentifier('b'))
      const right = createMemberExpression(createIdentifier('c'), createIdentifier('b'))
      visitor.AssignmentExpression(createAssignmentExpression(left, right))

      expect(reports.length).toBe(0)
    })

    test('should not report when member expression properties differ', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const left = createMemberExpression(createIdentifier('a'), createIdentifier('b'))
      const right = createMemberExpression(createIdentifier('a'), createIdentifier('c'))
      visitor.AssignmentExpression(createAssignmentExpression(left, right))

      expect(reports.length).toBe(0)
    })

    test('should not report when left is member and right is identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const left = createMemberExpression(createIdentifier('a'), createIdentifier('b'))
      const right = createIdentifier('ab')
      visitor.AssignmentExpression(createAssignmentExpression(left, right))

      expect(reports.length).toBe(0)
    })

    test('should not report when left is identifier and right is member', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const left = createIdentifier('ab')
      const right = createMemberExpression(createIdentifier('a'), createIdentifier('b'))
      visitor.AssignmentExpression(createAssignmentExpression(left, right))

      expect(reports.length).toBe(0)
    })

    test('should not report when both sides are unknown node types', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const unknownNode = { type: 'UnknownType', value: 'same' }
      const node = createAssignmentExpression(unknownNode, unknownNode)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report when both sides are same member expression reference', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const member = createMemberExpression(createIdentifier('obj'), createIdentifier('x'))
      const node = createAssignmentExpression(member, member)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('special identifiers', () => {
    test('should report self assignment of this = this style identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('self'), createIdentifier('self'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report self assignment of single underscore identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('_'), createIdentifier('_'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report self assignment of double underscore identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('__'), createIdentifier('__'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report self assignment of dollar sign identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('$'), createIdentifier('$'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report self assignment of unicode identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('π'), createIdentifier('π'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report different unicode identifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(createIdentifier('π'), createIdentifier('θ'))
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('context interaction', () => {
    test('should not call report for valid assignment', () => {
      let reportCalled = false
      const context = {
        report: () => {
          reportCalled = true
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'a = b',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noSelfAssignRule.create(context)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createIdentifier('b')),
      )

      expect(reportCalled).toBe(false)
    })

    test('should call report exactly once for self assignment', () => {
      let reportCount = 0
      const context = {
        report: () => {
          reportCount++
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'a = a',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noSelfAssignRule.create(context)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createIdentifier('a')),
      )

      expect(reportCount).toBe(1)
    })

    test('should call report with message property', () => {
      const captured: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          captured.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'a = a',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noSelfAssignRule.create(context)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createIdentifier('a')),
      )

      expect(captured.length).toBe(1)
      expect(captured[0]).toHaveProperty('message')
    })

    test('should call report with loc property', () => {
      const captured: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          captured.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'a = a',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noSelfAssignRule.create(context)
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createIdentifier('a')),
      )

      expect(captured[0]).toHaveProperty('loc')
    })

    test('should not call report for non-AssignmentExpression type', () => {
      let reportCalled = false
      const context = {
        report: () => {
          reportCalled = true
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'a',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noSelfAssignRule.create(context)
      visitor.AssignmentExpression({ type: 'Identifier', name: 'a' })

      expect(reportCalled).toBe(false)
    })
  })

  describe('repeated invocations', () => {
    test('should report on 50 consecutive self-assignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.AssignmentExpression(
          createAssignmentExpression(createIdentifier('x'), createIdentifier('x')),
        )
      }

      expect(reports.length).toBe(50)
    })

    test('should handle alternating valid and invalid assignments', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          visitor.AssignmentExpression(
            createAssignmentExpression(createIdentifier('a'), createIdentifier('a')),
          )
        } else {
          visitor.AssignmentExpression(
            createAssignmentExpression(createIdentifier('a'), createIdentifier('b')),
          )
        }
      }

      expect(reports.length).toBe(10)
    })

    test('should handle valid assignment after error without contamination', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('a'), createIdentifier('a')),
      )
      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('x'), createIdentifier('y')),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('member expression nesting levels', () => {
    test('should report three-level deep equal member expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const buildThreeLevel = () =>
        createMemberExpression(
          createMemberExpression(
            createMemberExpression(createIdentifier('a'), createIdentifier('b')),
            createIdentifier('c'),
          ),
          createIdentifier('d'),
        )

      const left = buildThreeLevel()
      const right = buildThreeLevel()
      visitor.AssignmentExpression(createAssignmentExpression(left, right))

      expect(reports.length).toBe(1)
    })

    test('should not report three-level deep when middle differs', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const left = createMemberExpression(
        createMemberExpression(
          createMemberExpression(createIdentifier('a'), createIdentifier('b')),
          createIdentifier('X'),
        ),
        createIdentifier('d'),
      )
      const right = createMemberExpression(
        createMemberExpression(
          createMemberExpression(createIdentifier('a'), createIdentifier('b')),
          createIdentifier('Y'),
        ),
        createIdentifier('d'),
      )
      visitor.AssignmentExpression(createAssignmentExpression(left, right))

      expect(reports.length).toBe(0)
    })

    test('should report four-level deep equal member expressions', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const buildFourLevel = () =>
        createMemberExpression(
          createMemberExpression(
            createMemberExpression(
              createMemberExpression(createIdentifier('a'), createIdentifier('b')),
              createIdentifier('c'),
            ),
            createIdentifier('d'),
          ),
          createIdentifier('e'),
        )

      const left = buildFourLevel()
      const right = buildFourLevel()
      visitor.AssignmentExpression(createAssignmentExpression(left, right))

      expect(reports.length).toBe(1)
    })

    test('should report equal member expressions with numeric-like property names', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const left = createMemberExpression(createIdentifier('arr'), createIdentifier('0'))
      const right = createMemberExpression(createIdentifier('arr'), createIdentifier('0'))
      visitor.AssignmentExpression(createAssignmentExpression(left, right))

      expect(reports.length).toBe(1)
    })
  })

  describe('rule definition structure', () => {
    test('meta should have correct number of properties', () => {
      const metaKeys = Object.keys(noSelfAssignRule.meta)
      expect(metaKeys.length).toBeGreaterThanOrEqual(4)
    })

    test('create should return RuleVisitor type', () => {
      const { context } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      expect(typeof visitor).toBe('object')
      for (const key of Object.keys(visitor)) {
        expect(typeof visitor[key]).toBe('function')
      }
    })

    test('rule should conform to RuleDefinition interface', () => {
      expect(noSelfAssignRule).toHaveProperty('meta')
      expect(noSelfAssignRule).toHaveProperty('create')
      expect(typeof noSelfAssignRule.meta).toBe('object')
      expect(typeof noSelfAssignRule.create).toBe('function')
    })

    test('schema should be an array', () => {
      expect(Array.isArray(noSelfAssignRule.meta.schema)).toBe(true)
    })

    test('schema should be empty (no options)', () => {
      expect(noSelfAssignRule.meta.schema).toHaveLength(0)
    })
  })

  describe('loc handling edge cases', () => {
    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: undefined, end: { line: 1, column: 5 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 3, column: 2 }, end: undefined },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should handle loc with zero values', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle very large line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = createAssignmentExpression(
        createIdentifier('a'),
        createIdentifier('a'),
        10000,
        9999,
      )
      visitor.AssignmentExpression(node)

      expect(reports[0].loc?.start.line).toBe(10000)
      expect(reports[0].loc?.start.column).toBe(9999)
    })

    test('should handle negative line number gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: -1, column: 0 }, end: { line: -1, column: 5 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(-1)
    })

    test('should handle negative column number gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: { start: { line: 1, column: -5 }, end: { line: 1, column: -1 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(-5)
    })

    test('should handle loc as empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        loc: {},
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('additional coverage', () => {
    test('should handle self-assignment with property named length', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const left = createMemberExpression(createIdentifier('arr'), createIdentifier('length'))
      const right = createMemberExpression(createIdentifier('arr'), createIdentifier('length'))
      visitor.AssignmentExpression(createAssignmentExpression(left, right))

      expect(reports.length).toBe(1)
    })

    test('should handle self-assignment with property named constructor', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const left = createMemberExpression(createIdentifier('obj'), createIdentifier('constructor'))
      const right = createMemberExpression(createIdentifier('obj'), createIdentifier('constructor'))
      visitor.AssignmentExpression(createAssignmentExpression(left, right))

      expect(reports.length).toBe(1)
    })

    test('should not report when left is Literal and right is Literal with same value', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const literal = { type: 'Literal', value: 42 }
      const node = createAssignmentExpression(literal, literal)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is CallExpression and right is same CallExpression reference', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const callExpr = { type: 'CallExpression', callee: createIdentifier('fn'), arguments: [] }
      const node = createAssignmentExpression(callExpr, callExpr)
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const node = {
        type: 'AssignmentExpression',
        operator: '=',
        left: createIdentifier('a'),
        right: createIdentifier('a'),
        extra: true,
        range: [0, 5],
        comments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      visitor.AssignmentExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle self-assignment with property named prototype', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      const left = createMemberExpression(createIdentifier('Fn'), createIdentifier('prototype'))
      const right = createMemberExpression(createIdentifier('Fn'), createIdentifier('prototype'))
      visitor.AssignmentExpression(createAssignmentExpression(left, right))

      expect(reports.length).toBe(1)
    })

    test('should handle identifier with numeric-like name', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('item0'), createIdentifier('item0')),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report when left identifier name differs by trailing digit', () => {
      const { context, reports } = createMockRuleContext({ source: 'a = a' })
      const visitor = noSelfAssignRule.create(context)

      visitor.AssignmentExpression(
        createAssignmentExpression(createIdentifier('var1'), createIdentifier('var2')),
      )

      expect(reports.length).toBe(0)
    })
  })
})

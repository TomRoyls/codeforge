import { describe, test, expect, vi } from 'vitest'
import { preferExponentiationOperatorRule } from '../../../../src/rules/patterns/prefer-exponentiation-operator.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createCallExpression(callee: unknown, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createMemberExpression(object: unknown, property: string): unknown {
  return {
    type: 'MemberExpression',
    object,
    property: createIdentifier(property),
    computed: false,
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

describe('prefer-exponentiation-operator rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferExponentiationOperatorRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferExponentiationOperatorRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferExponentiationOperatorRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferExponentiationOperatorRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferExponentiationOperatorRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(preferExponentiationOperatorRule.meta.fixable).toBe('code')
    })

    test('should mention ** operator in description', () => {
      expect(preferExponentiationOperatorRule.meta.docs?.description).toContain('**')
    })

    test('should mention Math.pow in description', () => {
      expect(preferExponentiationOperatorRule.meta.docs?.description).toContain('Math.pow')
    })

    test('should have a docs url', () => {
      expect(preferExponentiationOperatorRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs url containing rule name', () => {
      expect(preferExponentiationOperatorRule.meta.docs?.url).toContain(
        'prefer-exponentiation-operator',
      )
    })

    test('should have description as a non-empty string', () => {
      expect(typeof preferExponentiationOperatorRule.meta.docs?.description).toBe('string')
      expect(preferExponentiationOperatorRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(preferExponentiationOperatorRule.meta.schema)).toBe(true)
    })

    test('should not be deprecated', () => {
      expect(preferExponentiationOperatorRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(preferExponentiationOperatorRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(preferExponentiationOperatorRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('meta should be a plain object', () => {
      expect(typeof preferExponentiationOperatorRule.meta).toBe('object')
      expect(preferExponentiationOperatorRule.meta).not.toBeNull()
    })

    test('meta.docs should be defined', () => {
      expect(preferExponentiationOperatorRule.meta.docs).toBeDefined()
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      expect(visitor).not.toBeNull()
      expect(visitor).toBeDefined()
    })

    test('CallExpression should be a function', () => {
      const { context } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('create should be a function', () => {
      expect(typeof preferExponentiationOperatorRule.create).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor1 = preferExponentiationOperatorRule.create(context)
      const visitor2 = preferExponentiationOperatorRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context and return object', () => {
      const { context } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      expect(typeof visitor).toBe('object')
    })
  })

  describe('detecting Math.pow() calls', () => {
    test('should report Math.pow(2, 3)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('**')
    })

    test('should report Math.pow(x, y)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createIdentifier('x'), createIdentifier('y')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow(2, 0.5)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(0.5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow(base, exponent)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [
        createIdentifier('base'),
        createIdentifier('exponent'),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow(0, 0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(0)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow(1, 1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(1), createLiteral(1)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow with negative exponent', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(-1)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow with large numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(999999), createLiteral(10)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow with fractional base', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(0.5), createLiteral(2)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow(Math.PI, 2)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const mathPI = createMemberExpression(createIdentifier('Math'), 'PI')
      const node = createCallExpression(callee, [mathPI, createLiteral(2)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow(n, 2) for squaring', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createIdentifier('n'), createLiteral(2)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow(n, 3) for cubing', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createIdentifier('n'), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow(x, 0.5) for square root', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createIdentifier('x'), createLiteral(0.5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow(2, 10)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(10)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow with string literal base', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral('2'), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report nested Math.pow calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const innerCallee = createMemberExpression(createIdentifier('Math'), 'pow')
      const innerCall = createCallExpression(innerCallee, [createLiteral(2), createLiteral(3)])

      const outerCallee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(outerCallee, [innerCall, createLiteral(2)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow(null, null)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(null), createLiteral(null)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow(undefined, undefined)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [
        createLiteral(undefined),
        createLiteral(undefined),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow(true, false)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(true), createLiteral(false)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow with single argument and still report', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow with three arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [
        createLiteral(2),
        createLiteral(3),
        createLiteral(4),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting valid code', () => {
    test('should not report Math.sqrt()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'sqrt')
      const node = createCallExpression(callee, [createLiteral(4)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.max()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'max')
      const node = createCallExpression(callee, [createLiteral(1), createLiteral(2)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.min()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'min')
      const node = createCallExpression(callee, [createLiteral(1), createLiteral(2)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report pow() without Math object', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = createCallExpression(createIdentifier('pow'), [
        createLiteral(2),
        createLiteral(3),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report myMath.pow()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('myMath'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.pow accessed via computed property', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('Math'),
          property: createLiteral('pow'),
          computed: true,
        },
        arguments: [createLiteral(2), createLiteral(3)],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.abs()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'abs')
      const node = createCallExpression(callee, [createLiteral(-5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.ceil()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'ceil')
      const node = createCallExpression(callee, [createLiteral(4.2)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.floor()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'floor')
      const node = createCallExpression(callee, [createLiteral(4.8)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.round()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'round')
      const node = createCallExpression(callee, [createLiteral(4.5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.random()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'random')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.log()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'log')
      const node = createCallExpression(callee, [createLiteral(10)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.sin()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'sin')
      const node = createCallExpression(callee, [createLiteral(1)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.cos()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'cos')
      const node = createCallExpression(callee, [createLiteral(1)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.tan()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'tan')
      const node = createCallExpression(callee, [createLiteral(1)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.exp()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'exp')
      const node = createCallExpression(callee, [createLiteral(1)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report aMath.pow() with lowercase math-like name', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('aMath'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.powPow() different method', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'powPow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report foo.bar()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('foo'), 'bar')
      const node = createCallExpression(callee, [createLiteral(1)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report a standalone function call', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = createCallExpression(createIdentifier('calculate'), [
        createLiteral(2),
        createLiteral(3),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report console.log()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('console'), 'log')
      const node = createCallExpression(callee, [createLiteral('hello')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Array.from()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Array'), 'from')
      const node = createCallExpression(callee, [createIdentifier('items')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report MATH.pow() with all-caps MATH', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('MATH'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report math.pow() with lowercase math', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createLiteral(2), createLiteral(3)],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)], 42, 10)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(3)]))

      expect(reports.length).toBe(1)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createLiteral(2), createLiteral(3)],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(() => visitor.CallExpression(false)).not.toThrow()
    })

    test('should handle number node', () => {
      const { context } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      expect(() => visitor.CallExpression(0)).not.toThrow()
      expect(() => visitor.CallExpression(-1)).not.toThrow()
      expect(() => visitor.CallExpression(3.14)).not.toThrow()
    })

    test('should handle empty string node', () => {
      const { context } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      expect(() => visitor.CallExpression('')).not.toThrow()
    })

    test('should handle node with empty arguments array', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with undefined arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with null arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle callee as plain identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: createIdentifier('someFunc'),
        arguments: [createLiteral(1)],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee with non-identifier object', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createLiteral('Math'),
          property: createIdentifier('pow'),
          computed: false,
        },
        arguments: [createLiteral(2), createLiteral(3)],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle location at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)], 0, 0)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle very large line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)], 99999, 500)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(99999)
      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should handle node type that is not CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: createLiteral(1),
        right: createLiteral(2),
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee with null object', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: createIdentifier('pow'),
          computed: false,
        },
        arguments: [createLiteral(2), createLiteral(3)],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee with undefined object', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: undefined,
          property: createIdentifier('pow'),
          computed: false,
        },
        arguments: [createLiteral(2), createLiteral(3)],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee with non-identifier property', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('Math'),
          property: createLiteral('pow'),
          computed: false,
        },
        arguments: [createLiteral(2), createLiteral(3)],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee property being a CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const innerCallee = createMemberExpression(createIdentifier('Math'), 'pow')
      const property = createCallExpression(innerCallee, [createLiteral(2), createLiteral(3)])

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('Math'),
          property,
          computed: false,
        },
        arguments: [createLiteral(2), createLiteral(3)],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      expect(() => visitor.CallExpression([])).not.toThrow()
    })

    test('should handle deeply nested Math.pow', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const innerArg = createCallExpression(callee, [createLiteral(2), createLiteral(3)])
      const node = createCallExpression(callee, [innerArg, createLiteral(4)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        ...createCallExpression(callee, [createLiteral(2), createLiteral(3)]),
        extra: true,
        another: 'property',
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with Symbol properties', () => {
      const { context } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const sym = Symbol('test')
      const node = { [sym]: 'value' }

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })
  })

  describe('location accuracy', () => {
    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)], 1, 0)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 5 column 20', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)], 5, 20)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report location at line 100 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)], 100, 0)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)], 1, 5)

      visitor.CallExpression(node)

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should report location with loc undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createLiteral(2), createLiteral(3)],
      }

      visitor.CallExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should use default location when loc is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createLiteral(2), createLiteral(3)],
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle partial location (only start)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createLiteral(2), createLiteral(3)],
        loc: {
          start: { line: 10, column: 5 },
        },
      }

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('message quality', () => {
    test('should mention ** operator in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(3)]))

      expect(reports[0].message).toContain('**')
    })

    test('should mention Math.pow in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(3)]))

      expect(reports[0].message).toContain('Math.pow')
    })

    test('should have consistent message format', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(3)]))

      expect(reports[0].message).toContain('Use the ** operator instead of Math.pow()')
    })

    test('should mention exponentiation in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(3)]))

      expect(reports[0].message).toMatch(/exponentiation/i)
    })

    test('should return a string message', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(3)]))

      expect(typeof reports[0].message).toBe('string')
    })

    test('should have a non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(3)]))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should produce same message for different Math.pow calls', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor1 = preferExponentiationOperatorRule.create(ctx1)
      const visitor2 = preferExponentiationOperatorRule.create(ctx2)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor1.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(3)]))
      visitor2.CallExpression(
        createCallExpression(callee, [createIdentifier('x'), createLiteral(10)]),
      )

      expect(r1[0].message).toBe(r2[0].message)
    })
  })

  describe('auto-fix', () => {
    test('should provide fix for Math.pow(2, 3)', () => {
      const source = 'Math.pow(2, 3)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [
          { type: 'Literal', value: 2, range: [9, 10] },
          { type: 'Literal', value: 3, range: [12, 13] },
        ],
        range: [0, 14] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe('2 ** 3')
      expect(reports[0].fix?.range).toEqual([0, 14])
    })

    test('should provide fix for Math.pow(x, y)', () => {
      const source = 'Math.pow(x, y)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [
          { type: 'Identifier', name: 'x', range: [9, 10] },
          { type: 'Identifier', name: 'y', range: [12, 13] },
        ],
        range: [0, 14] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('x ** y')
    })

    test('should provide fix for Math.pow(base + 1, 2)', () => {
      const source = 'Math.pow(base + 1, 2)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [
          { type: 'BinaryExpression', range: [9, 17] },
          { type: 'Literal', value: 2, range: [19, 20] },
        ],
        range: [0, 21] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 21 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('base + 1 ** 2')
    })

    test('should provide fix with correct range for Math.pow(10, 5)', () => {
      const source = 'Math.pow(10, 5)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [
          { type: 'Literal', value: 10, range: [9, 11] },
          { type: 'Literal', value: 5, range: [13, 14] },
        ],
        range: [0, 15] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.range).toEqual([0, 15])
      expect(reports[0].fix?.text).toBe('10 ** 5')
    })

    test('should provide fix for Math.pow(n, 2)', () => {
      const source = 'Math.pow(n, 2)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [
          { type: 'Identifier', name: 'n', range: [9, 10] },
          { type: 'Literal', value: 2, range: [12, 13] },
        ],
        range: [0, 14] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('n ** 2')
    })

    test('should provide fix for Math.pow(a * b, c + d)', () => {
      const source = 'Math.pow(a * b, c + d)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [
          { type: 'BinaryExpression', range: [9, 14] },
          { type: 'BinaryExpression', range: [16, 21] },
        ],
        range: [0, 22] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 22 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('a * b ** c + d')
    })

    test('should provide fix for Math.pow at non-zero offset', () => {
      const source = 'const x = Math.pow(2, 3)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [
          { type: 'Literal', value: 2, range: [19, 20] },
          { type: 'Literal', value: 3, range: [22, 23] },
        ],
        range: [10, 24] as [number, number],
        loc: { start: { line: 1, column: 10 }, end: { line: 1, column: 24 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.range).toEqual([10, 24])
      expect(reports[0].fix?.text).toBe('2 ** 3')
    })

    test('should provide fix with empty base and exponent source when args have no range', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe(' ** ')
    })

    test('should provide fix that replaces entire Math.pow call', () => {
      const source = 'Math.pow(2, 3)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [
          { type: 'Literal', value: 2, range: [9, 10] },
          { type: 'Literal', value: 3, range: [12, 13] },
        ],
        range: [0, 14] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(node)

      const fix = reports[0].fix
      expect(fix).toBeDefined()
      expect(fix!.range[1] - fix!.range[0]).toBe(14)
    })

    test('should handle fix when first arg has no range', () => {
      const source = 'Math.pow(x, 3)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createIdentifier('x'), { type: 'Literal', value: 3, range: [12, 13] }],
        range: [0, 14] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('**')
    })

    test('should handle fix when second arg has no range', () => {
      const source = 'Math.pow(2, y)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [{ type: 'Literal', value: 2, range: [9, 10] }, createIdentifier('y')],
        range: [0, 14] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toContain('**')
    })

    test('should handle fix when both args have no range', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createLiteral(2), createLiteral(3)],
        range: [0, 14] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix).toBeDefined()
      expect(reports[0].fix?.text).toBe(' ** ')
    })

    test('should provide fix that includes ** between base and exponent', () => {
      const source = 'Math.pow(4, 2)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [
          { type: 'Literal', value: 4, range: [9, 10] },
          { type: 'Literal', value: 2, range: [12, 13] },
        ],
        range: [0, 14] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toContain('**')
      expect(reports[0].fix?.text).toBe('4 ** 2')
    })
  })

  describe('multiple invocations', () => {
    test('should report each Math.pow call separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node1 = createCallExpression(callee, [createLiteral(2), createLiteral(3)])
      const node2 = createCallExpression(callee, [createLiteral(4), createLiteral(5)])

      visitor.CallExpression(node1)
      visitor.CallExpression(node2)

      expect(reports.length).toBe(2)
    })

    test('should report three Math.pow calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(1), createLiteral(1)]))
      visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(2)]))
      visitor.CallExpression(createCallExpression(callee, [createLiteral(3), createLiteral(3)]))

      expect(reports.length).toBe(3)
    })

    test('should report Math.pow mixed with other calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const powCallee = createMemberExpression(createIdentifier('Math'), 'pow')
      const sqrtCallee = createMemberExpression(createIdentifier('Math'), 'sqrt')

      visitor.CallExpression(createCallExpression(sqrtCallee, [createLiteral(4)]))
      visitor.CallExpression(createCallExpression(powCallee, [createLiteral(2), createLiteral(3)]))
      visitor.CallExpression(createCallExpression(sqrtCallee, [createLiteral(9)]))

      expect(reports.length).toBe(1)
    })

    test('should accumulate reports across multiple visitor calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const powCallee = createMemberExpression(createIdentifier('Math'), 'pow')

      for (let i = 0; i < 10; i++) {
        visitor.CallExpression(
          createCallExpression(powCallee, [createLiteral(i), createLiteral(2)]),
        )
      }

      expect(reports.length).toBe(10)
    })

    test('should handle alternating Math.pow and other calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const powCallee = createMemberExpression(createIdentifier('Math'), 'pow')
      const maxCallee = createMemberExpression(createIdentifier('Math'), 'max')

      visitor.CallExpression(createCallExpression(powCallee, [createLiteral(2), createLiteral(3)]))
      visitor.CallExpression(createCallExpression(maxCallee, [createLiteral(1), createLiteral(2)]))
      visitor.CallExpression(createCallExpression(powCallee, [createLiteral(4), createLiteral(5)]))

      expect(reports.length).toBe(2)
    })
  })

  describe('context interaction', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);', filePath: '/project/src/utils/math.ts' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(3)]))

      expect(reports.length).toBe(1)
    })

    test('should work with .js file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);', filePath: '/project/src/math.js' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(3)]))

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const source = 'const result = Math.pow(x, y);'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(
        createCallExpression(callee, [createIdentifier('x'), createIdentifier('y')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(3)]))

      expect(reports.length).toBe(1)
    })

    test('should work with complex source code', () => {
      const source = 'function calculate() { return Math.pow(2, 10); }'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(10)]))

      expect(reports.length).toBe(1)
    })

    test('should not throw with context having undefined config', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'Math.pow(2, 3)',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      expect(() =>
        visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(3)])),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('single argument Math.pow', () => {
    test('should report Math.pow with one argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not provide fix for single argument Math.pow', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2)])

      visitor.CallExpression(node)

      expect(reports[0].fix).toBeUndefined()
    })

    test('should still report correct message for single argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createIdentifier('x')])

      visitor.CallExpression(node)

      expect(reports[0].message).toContain('**')
      expect(reports[0].message).toContain('Math.pow')
    })
  })

  describe('exports', () => {
    test('should export rule as default export', () => {
      const defaultExport = preferExponentiationOperatorRule
      expect(defaultExport).toBeDefined()
      expect(defaultExport.meta).toBeDefined()
      expect(defaultExport.create).toBeDefined()
    })

    test('should have create method that accepts RuleContext', () => {
      const { context } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      expect(() => preferExponentiationOperatorRule.create(context)).not.toThrow()
    })

    test('should have consistent meta across imports', () => {
      const meta = preferExponentiationOperatorRule.meta
      expect(meta.type).toBe('suggestion')
      expect(meta.severity).toBe('warn')
      expect(meta.fixable).toBe('code')
    })
  })

  describe('argument types', () => {
    test('should report Math.pow with CallExpression arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const arg1 = createCallExpression(createIdentifier('getValue'), [])
      const arg2 = createCallExpression(createIdentifier('getExp'), [])
      const node = createCallExpression(callee, [arg1, arg2])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow with MemberExpression arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const arg1 = createMemberExpression(createIdentifier('obj'), 'base')
      const arg2 = createMemberExpression(createIdentifier('obj'), 'exp')
      const node = createCallExpression(callee, [arg1, arg2])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow with mixed argument types', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [
        createMemberExpression(createIdentifier('obj'), 'val'),
        createLiteral(2),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow with negative literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(-5), createLiteral(2)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow with zero exponent', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createIdentifier('x'), createLiteral(0)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report Math.pow with one exponent', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createIdentifier('x'), createLiteral(1)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('visitor method coverage', () => {
    test('should not throw for node with missing type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = { callee: createIdentifier('test'), arguments: [] }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type OtherExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = { type: 'OtherExpression' }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with string callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: 'Math.pow',
        arguments: [createLiteral(2), createLiteral(3)],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with number callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: 42,
        arguments: [createLiteral(2), createLiteral(3)],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with null callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [createLiteral(2), createLiteral(3)],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with callee as MemberExpression with numeric property', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('Math'),
          property: { type: 'Literal', value: 0 },
          computed: true,
        },
        arguments: [createLiteral(2), createLiteral(3)],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('fix text content', () => {
    test('should generate fix with space around ** for literals', () => {
      const source = 'Math.pow(3, 4)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [
          { type: 'Literal', value: 3, range: [9, 10] },
          { type: 'Literal', value: 4, range: [12, 13] },
        ],
        range: [0, 14] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 14 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toMatch(/\d+ \*\* \d+/)
    })

    test('should generate fix preserving original base source', () => {
      const source = 'Math.pow(arr[0], 2)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [
          { type: 'MemberExpression', range: [9, 15] },
          { type: 'Literal', value: 2, range: [17, 18] },
        ],
        range: [0, 19] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 19 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toContain('**')
      expect(reports[0].fix?.text).toBe('arr[0] ** 2')
    })

    test('should generate fix preserving original exponent source', () => {
      const source = 'Math.pow(2, x + 1)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [
          { type: 'Literal', value: 2, range: [9, 10] },
          { type: 'BinaryExpression', range: [12, 17] },
        ],
        range: [0, 18] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 18 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('2 ** x + 1')
    })

    test('should generate fix with longer expression', () => {
      const source = 'Math.pow(getValue(), getExponent())'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [
          { type: 'CallExpression', range: [9, 19] },
          { type: 'CallExpression', range: [21, 34] },
        ],
        range: [0, 35] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 35 } },
      }

      visitor.CallExpression(node)

      expect(reports[0].fix?.text).toBe('getValue() ** getExponent()')
    })
  })

  describe('schema and configuration', () => {
    test('should work with options containing extra fields', () => {
      const { context, reports } = createMockRuleContext({ options: [{ extra: true, ignore: ['test'] }], source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(3)]))

      expect(reports.length).toBe(1)
    })

    test('should work with null options', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'Math.pow(2, 3)',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [null] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferExponentiationOperatorRule.create(context)
      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(3)]))

      expect(reports.length).toBe(1)
    })

    test('should work with undefined options', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'Math.pow(2, 3)',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [undefined] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferExponentiationOperatorRule.create(context)
      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(3)]))

      expect(reports.length).toBe(1)
    })

    test('should work with empty config', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'Math.pow(2, 3)',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferExponentiationOperatorRule.create(context)
      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(3)]))

      expect(reports.length).toBe(1)
    })

    test('schema should be empty array (no config options)', () => {
      expect(preferExponentiationOperatorRule.meta.schema).toEqual([])
    })
  })

  describe('report descriptor structure', () => {
    test('should have message in report', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      visitor.CallExpression(createCallExpression(callee, [createLiteral(2), createLiteral(3)]))

      expect(reports[0]).toHaveProperty('message')
    })

    test('should have loc in report when node has location', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)], 3, 7)

      visitor.CallExpression(node)

      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0].loc).toBeDefined()
    })

    test('report loc should have start and end', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)], 1, 0)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('report loc start should have line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)], 5, 3)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBeTypeOf('number')
      expect(reports[0].loc?.start.column).toBeTypeOf('number')
    })

    test('report loc end should have line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)], 5, 3)

      visitor.CallExpression(node)

      expect(reports[0].loc?.end.line).toBeTypeOf('number')
      expect(reports[0].loc?.end.column).toBeTypeOf('number')
    })
  })

  describe('additional callee variations', () => {
    test('should not report when object is a Literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createLiteral('Math'),
          property: createIdentifier('pow'),
          computed: false,
        },
        arguments: [createLiteral(2), createLiteral(3)],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when object is a number', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createLiteral(42),
          property: createIdentifier('pow'),
          computed: false,
        },
        arguments: [createLiteral(2), createLiteral(3)],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when property is empty string identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), '')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is a ThisExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'ThisExpression' },
        arguments: [createLiteral(2), createLiteral(3)],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report Math.Power', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'Power')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report POW (uppercase)', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'POW')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report powobj.pow()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('powobj'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report chained Math.pow.call()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const mathPow = createMemberExpression(createIdentifier('Math'), 'pow')
      const callee = createMemberExpression(mathPow, 'call')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report window.Math.pow()', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const windowMath = createMemberExpression(createIdentifier('window'), 'Math')
      const callee = createMemberExpression(windowMath, 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report Math.pow with negative fractional exponent', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(-0.5)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('rule definition properties', () => {
    test('should have exactly one visitor method', () => {
      const { context } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)
      const keys = Object.keys(visitor)

      expect(keys.length).toBe(1)
      expect(keys).toContain('CallExpression')
    })

    test('rule meta should have readonly-like properties', () => {
      const meta = preferExponentiationOperatorRule.meta
      expect(meta.type).toBe('suggestion')
      expect(meta.severity).toBe('warn')
      expect(meta.fixable).toBe('code')
    })

    test('meta.severity should be one of valid severities', () => {
      const validSeverities = ['off', 'warn', 'error']
      expect(validSeverities).toContain(preferExponentiationOperatorRule.meta.severity)
    })

    test('meta.type should be one of valid types', () => {
      const validTypes = ['problem', 'suggestion', 'layout']
      expect(validTypes).toContain(preferExponentiationOperatorRule.meta.type)
    })

    test('meta.fixable should be code or whitespace', () => {
      const validFixable = ['code', 'whitespace']
      expect(validFixable).toContain(preferExponentiationOperatorRule.meta.fixable)
    })

    test('should have a docs object with all required fields', () => {
      const docs = preferExponentiationOperatorRule.meta.docs
      expect(docs).toBeDefined()
      expect(docs?.description).toBeDefined()
      expect(docs?.category).toBeDefined()
      expect(docs?.recommended).toBeDefined()
    })
  })

  describe('additional edge cases for robustness', () => {
    test('should handle CallExpression with extra arguments beyond 2', () => {
      const source = 'Math.pow(2, 3, 4, 5)'
      const { context, reports } = createMockRuleContext({ source: source, filePath: '/src/file.ts' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [
          { type: 'Literal', value: 2, range: [9, 10] },
          { type: 'Literal', value: 3, range: [12, 13] },
          { type: 'Literal', value: 4, range: [15, 16] },
          { type: 'Literal', value: 5, range: [18, 19] },
        ],
        range: [0, 20] as [number, number],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].fix?.text).toBe('2 ** 3')
    })

    test('should handle SpreadElement arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [
        { type: 'SpreadElement', argument: createIdentifier('args') },
        createLiteral(2),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc as null', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createLiteral(2), createLiteral(3)],
        loc: null,
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with loc containing non-numeric values', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = {
        type: 'CallExpression',
        callee,
        arguments: [createLiteral(2), createLiteral(3)],
        loc: {
          start: { line: 'one' as unknown as number, column: 'zero' as unknown as number },
          end: { line: 'one' as unknown as number, column: 'ten' as unknown as number },
        },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle being called multiple times with same node', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [createLiteral(2), createLiteral(3)])

      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)

      expect(reports.length).toBe(3)
    })

    test('should handle Math.pow with template literal args', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [
        { type: 'TemplateLiteral' },
        { type: 'TemplateLiteral' },
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle Math.pow with ArrowFunctionExpression args', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [
        { type: 'ArrowFunctionExpression', body: createLiteral(1) },
        { type: 'ArrowFunctionExpression', body: createLiteral(2) },
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle Math.pow with ObjectExpression args', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [
        { type: 'ObjectExpression', properties: [] },
        { type: 'ObjectExpression', properties: [] },
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle Math.pow with ArrayExpression args', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [
        { type: 'ArrayExpression', elements: [] },
        { type: 'ArrayExpression', elements: [] },
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle Math.pow with ConditionalExpression args', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [
        { type: 'ConditionalExpression' },
        { type: 'ConditionalExpression' },
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle Math.pow with UnaryExpression args', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [
        { type: 'UnaryExpression', operator: '-', argument: createIdentifier('x') },
        createLiteral(2),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle Math.pow with UpdateExpression args', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [
        { type: 'UpdateExpression', operator: '++', argument: createIdentifier('x') },
        createLiteral(2),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle Math.pow with AssignmentExpression args', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [
        {
          type: 'AssignmentExpression',
          operator: '=',
          left: createIdentifier('x'),
          right: createLiteral(1),
        },
        createLiteral(2),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle Math.pow with SequenceExpression args', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [
        { type: 'SequenceExpression', expressions: [] },
        createLiteral(2),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle Math.pow with NewExpression args', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [
        { type: 'NewExpression', callee: createIdentifier('Map'), arguments: [] },
        createLiteral(2),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle Math.pow with FunctionExpression args', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [
        {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        createLiteral(2),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle Math.pow with TaggedTemplateExpression args', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [
        { type: 'TaggedTemplateExpression' },
        createLiteral(2),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle Math.pow with AwaitExpression args', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [
        {
          type: 'AwaitExpression',
          argument: createCallExpression(createIdentifier('getValue'), []),
        },
        createLiteral(2),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle Math.pow with YieldExpression args', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const callee = createMemberExpression(createIdentifier('Math'), 'pow')
      const node = createCallExpression(callee, [
        { type: 'YieldExpression', argument: createLiteral(1) },
        createLiteral(2),
      ])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle callee property as null identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('Math'),
          property: { type: 'Identifier', name: null },
          computed: false,
        },
        arguments: [createLiteral(2), createLiteral(3)],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee property as undefined identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'Math.pow(2, 3);' })
      const visitor = preferExponentiationOperatorRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: createIdentifier('Math'),
          property: { type: 'Identifier', name: undefined },
          computed: false,
        },
        arguments: [createLiteral(2), createLiteral(3)],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })
})

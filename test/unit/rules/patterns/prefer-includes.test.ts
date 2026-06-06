import { describe, test, expect, vi } from 'vitest'
import { preferIncludesRule } from '../../../../src/rules/patterns/prefer-includes.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createBinaryExpression(
  left: unknown,
  right: unknown,
  operator: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    left,
    right,
    operator,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createIndexOfCall(objectName: string, line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: objectName,
      },
      property: {
        type: 'Identifier',
        name: 'indexOf',
      },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createLiteral(value: number, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

describe('prefer-includes rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferIncludesRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferIncludesRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferIncludesRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferIncludesRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferIncludesRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(preferIncludesRule.meta.fixable).toBeUndefined()
    })

    test('should mention includes in description', () => {
      expect(preferIncludesRule.meta.docs?.description.toLowerCase()).toContain('includes')
    })

    test('should have a non-empty description', () => {
      expect(preferIncludesRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have meta object defined', () => {
      expect(preferIncludesRule.meta).toBeDefined()
      expect(typeof preferIncludesRule.meta).toBe('object')
    })

    test('should have docs property defined', () => {
      expect(preferIncludesRule.meta.docs).toBeDefined()
    })

    test('should have docs.url defined', () => {
      expect(preferIncludesRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs.url as a string', () => {
      expect(typeof preferIncludesRule.meta.docs?.url).toBe('string')
    })

    test('should have docs.url containing codeforge', () => {
      expect(preferIncludesRule.meta.docs?.url).toContain('codeforge')
    })

    test('should mention indexOf in description', () => {
      expect(preferIncludesRule.meta.docs?.description.toLowerCase()).toContain('indexof')
    })

    test('should mention .includes() in description', () => {
      expect(preferIncludesRule.meta.docs?.description).toContain('.includes()')
    })

    test('should mention .indexOf() in description', () => {
      expect(preferIncludesRule.meta.docs?.description).toContain('.indexOf()')
    })

    test('should have type as a string', () => {
      expect(typeof preferIncludesRule.meta.type).toBe('string')
    })

    test('should have severity as a string', () => {
      expect(typeof preferIncludesRule.meta.severity).toBe('string')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(preferIncludesRule.meta.schema)).toBe(true)
    })

    test('should have empty schema array', () => {
      expect(preferIncludesRule.meta.schema).toEqual([])
    })

    test('should have docs.description as a string', () => {
      expect(typeof preferIncludesRule.meta.docs?.description).toBe('string')
    })

    test('should have docs.category as a string', () => {
      expect(typeof preferIncludesRule.meta.docs?.category).toBe('string')
    })

    test('should have docs.recommended as a boolean', () => {
      expect(typeof preferIncludesRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should not be deprecated', () => {
      expect(preferIncludesRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(preferIncludesRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(preferIncludesRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should have valid type value', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(preferIncludesRule.meta.type)
    })

    test('should have valid severity value', () => {
      expect(['off', 'warn', 'error']).toContain(preferIncludesRule.meta.severity)
    })

    test('should have docs.url starting with https://', () => {
      expect(preferIncludesRule.meta.docs?.url).toMatch(/^https:\/\//)
    })

    test('should have docs.url ending with prefer-includes', () => {
      expect(preferIncludesRule.meta.docs?.url).toMatch(/prefer-includes$/)
    })

    test('should mention better readability in description', () => {
      expect(preferIncludesRule.meta.docs?.description.toLowerCase()).toContain('readability')
    })

    test('should mention array.includes in description', () => {
      expect(preferIncludesRule.meta.docs?.description).toContain('array.includes')
    })

    test('should have description longer than 40 characters', () => {
      expect(preferIncludesRule.meta.docs!.description.length).toBeGreaterThan(40)
    })

    test('should have meta.docs as a non-null object', () => {
      expect(typeof preferIncludesRule.meta.docs).toBe('object')
      expect(preferIncludesRule.meta.docs).not.toBeNull()
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should return BinaryExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor1 = preferIncludesRule.create(context)
      const visitor2 = preferIncludesRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should create visitor that does not throw on valid input', () => {
      const { context } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      expect(() =>
        visitor.BinaryExpression(
          createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
        ),
      ).not.toThrow()
    })

    test('should create independent visitors with separate reports', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor1 = preferIncludesRule.create(ctx1)
      const visitor2 = preferIncludesRule.create(ctx2)

      visitor1.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })
  })

  describe('detecting indexOf >= 0', () => {
    test('should report indexOf >= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('includes')
    })

    test('should report indexOf !== -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '!==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report indexOf > -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '>')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report indexOf < 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '<')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when left is not indexOf call', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression({ type: 'Identifier', name: 'x' }, createLiteral(0), '>=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when operator is wrong', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report 0 >= indexOf(x) (right side indexOf)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createLiteral(0), createIndexOfCall('arr'), '>=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report -1 !== indexOf(x) (right side indexOf)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createLiteral(-1), createIndexOfCall('arr'), '!==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report -1 > indexOf(x) (right side indexOf with > operator)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createLiteral(-1), createIndexOfCall('arr'), '>')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report indexOf == 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report indexOf != -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '!=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report 0 == indexOf(x) (right side indexOf)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createLiteral(0), createIndexOfCall('arr'), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report -1 != indexOf(x) (right side indexOf)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createLiteral(-1), createIndexOfCall('arr'), '!=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report indexOf >= 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(1), '>=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report indexOf >= -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '>=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report indexOf > 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report indexOf !== 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '!==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report indexOf(x) >= 0 with different array names', () => {
      const arrayNames = ['arr', 'items', 'list', 'data', 'result', 'numbers', 'strings', 'values']
      for (const name of arrayNames) {
        const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
        const visitor = preferIncludesRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression(createIndexOfCall(name), createLiteral(0), '>='),
        )

        expect(reports.length).toBe(1)
      }
    })

    test('should not report with === operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report with <= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '<=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('right side indexOf patterns', () => {
    test('should report 0 >= indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createLiteral(0), createIndexOfCall('arr'), '>=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report -1 !== indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createLiteral(-1), createIndexOfCall('arr'), '!==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report -1 < indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createLiteral(-1), createIndexOfCall('arr'), '<')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report 1 >= indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createLiteral(1), createIndexOfCall('arr'), '>=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report -2 !== indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createLiteral(-2), createIndexOfCall('arr'), '!==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report indexOf(x) > -1 (left side indexOf)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '>')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report 0 == indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createLiteral(0), createIndexOfCall('arr'), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report random right side expression with >=', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(
        createLiteral(0),
        { type: 'Identifier', name: 'foo' },
        '>=',
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('literal value edge cases', () => {
    test('should report indexOf >= 0 with zero literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report indexOf >= -1 with minus one literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '>=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report indexOf >= 2', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(2), '>=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf >= -2', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(-2), '>=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf >= 100', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(100), '>=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when right side is not a literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(
        createIndexOfCall('arr'),
        { type: 'Identifier', name: 'zero' },
        '>=',
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when right side is a string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(
        createIndexOfCall('arr'),
        { type: 'Literal', value: '0' },
        '>=',
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when right side is boolean literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(
        createIndexOfCall('arr'),
        { type: 'Literal', value: false },
        '>=',
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when right side is null literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(
        createIndexOfCall('arr'),
        { type: 'Literal', value: null },
        '>=',
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report with 0.0 literal since 0.0 === 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(createIndexOfCall('arr'), createLiteral(0.0), '>=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report with NaN literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(
        createIndexOfCall('arr'),
        { type: 'Literal', value: NaN },
        '>=',
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should match negative zero as zero', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-0), '>='),
      )

      expect(reports.length).toBe(1)
    })

    test('should not match when value is a string "0"', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), { type: 'Literal', value: '0' }, '>='),
      )

      expect(reports.length).toBe(0)
    })

    test('should not match when value is a string "-1"', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), { type: 'Literal', value: '-1' }, '!=='),
      )

      expect(reports.length).toBe(0)
    })

    test('should not match when literal type is not Literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          createIndexOfCall('arr'),
          { type: 'Identifier', name: 'zero' },
          '>=',
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not match when literal has no value property', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), { type: 'Literal' }, '>='),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('callee structure edge cases', () => {
    test('should not report when callee is not MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(
        {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'indexOf' },
          arguments: [],
        },
        createLiteral(0),
        '>=',
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when property is not indexOf', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'lastIndexOf' },
          },
          arguments: [],
        },
        createLiteral(0),
        '>=',
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when property is includes', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'includes' },
          },
          arguments: [],
        },
        createLiteral(0),
        '>=',
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when property is findIndex', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'findIndex' },
          },
          arguments: [],
        },
        createLiteral(0),
        '>=',
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when property type is not Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Literal', value: 'indexOf' },
          },
          arguments: [],
        },
        createLiteral(0),
        '>=',
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report when object is a nested member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'arr' },
            },
            property: { type: 'Identifier', name: 'indexOf' },
          },
          arguments: [],
        },
        createLiteral(0),
        '>=',
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report when object is this', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(
        {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'ThisExpression' },
            property: { type: 'Identifier', name: 'indexOf' },
          },
          arguments: [],
        },
        createLiteral(0),
        '>=',
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report when call type is not CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(
        {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'indexOf' },
        },
        createLiteral(0),
        '>=',
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'indexOf' },
          },
          arguments: [],
        },
        right: { type: 'Literal', value: 0 },
        operator: '>=',
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(
        createIndexOfCall('arr', 10, 5),
        createLiteral(0, 10, 20),
        '>=',
        10,
        5,
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({
            message: descriptor.message,
            loc: descriptor.loc,
          })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'arr.indexOf(x) >= 0;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = preferIncludesRule.create(context)

      expect(() =>
        visitor.BinaryExpression(
          createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
        ),
      ).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      expect(() => visitor.BinaryExpression(true)).not.toThrow()
      expect(() => visitor.BinaryExpression(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      expect(() => visitor.BinaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression({ type: 'ExpressionStatement' })

      expect(reports.length).toBe(0)
    })

    test('should handle node with missing left property', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression({
        type: 'BinaryExpression',
        right: createLiteral(0),
        operator: '>=',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with missing right property', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: createIndexOfCall('arr'),
        operator: '>=',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with missing operator property', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: createIndexOfCall('arr'),
        right: createLiteral(0),
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with null left', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: null,
        right: createLiteral(0),
        operator: '>=',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with null right', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: createIndexOfCall('arr'),
        right: null,
        operator: '>=',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle undefined left in BinaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: undefined,
        right: createLiteral(0),
        operator: '>=',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle undefined right in BinaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: createIndexOfCall('arr'),
        right: undefined,
        operator: '>=',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle loc with null values', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIndexOfCall('arr'),
        right: createLiteral(0),
        operator: '>=',
        loc: null,
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      expect(() => visitor.BinaryExpression([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee being null', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: {
          type: 'CallExpression',
          callee: null,
          arguments: [],
        },
        right: createLiteral(0),
        operator: '>=',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle callee being undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: {
          type: 'CallExpression',
          callee: undefined,
          arguments: [],
        },
        right: createLiteral(0),
        operator: '>=',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle property name being non-string', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 123 },
          },
          arguments: [],
        },
        right: createLiteral(0),
        operator: '>=',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle both sides being indexOf', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = createBinaryExpression(
        createIndexOfCall('arr'),
        createIndexOfCall('other'),
        '>=',
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report location at line 1, column 0 by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should report location at custom line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          createIndexOfCall('arr', 5, 10),
          createLiteral(0, 5, 30),
          '>=',
          5,
          10,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location for indexOf !== -1 pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(
          createIndexOfCall('arr', 3, 8),
          createLiteral(-1, 3, 20),
          '!==',
          3,
          8,
        ),
      )

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report location for indexOf > -1 pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr', 7, 2), createLiteral(-1, 7, 15), '>', 7, 2),
      )

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should provide default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createIndexOfCall('arr'),
        right: createLiteral(0),
        operator: '>=',
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('message content', () => {
    test('should mention includes in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(reports[0].message.toLowerCase()).toContain('includes')
    })

    test('should mention readability in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(reports[0].message.toLowerCase()).toContain('readable')
    })

    test('should mention indexOf in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(reports[0].message).toContain('indexOf')
    })

    test('should include operator in message for >=', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(reports[0].message).toContain('>=')
    })

    test('should include operator in message for !==', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '!=='),
      )

      expect(reports[0].message).toContain('!==')
    })

    test('should include operator in message for >', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '>'),
      )

      expect(reports[0].message).toContain('>')
    })

    test('should have consistent message format for >= operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(reports[0].message).toBe(
        'Prefer .includes() over .indexOf() >= for more readable code.',
      )
    })

    test('should have consistent message format for !== operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '!=='),
      )

      expect(reports[0].message).toBe(
        'Prefer .includes() over .indexOf() !== for more readable code.',
      )
    })

    test('should have consistent message format for > operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '>'),
      )

      expect(reports[0].message).toBe(
        'Prefer .includes() over .indexOf() > for more readable code.',
      )
    })

    test('should have consistent message format for == operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '=='),
      )

      expect(reports[0].message).toBe(
        'Prefer .includes() over .indexOf() == for more readable code.',
      )
    })

    test('should have consistent message format for != operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '!='),
      )

      expect(reports[0].message).toBe(
        'Prefer .includes() over .indexOf() != for more readable code.',
      )
    })

    test('should start message with Prefer', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(reports[0].message).toContain('Prefer')
    })
  })

  describe('multiple reports', () => {
    test('should report for each matching node separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('items'), createLiteral(0), '>='),
      )

      expect(reports.length).toBe(2)
    })

    test('should report for different operator patterns in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '!=='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '>'),
      )

      expect(reports.length).toBe(3)
    })

    test('should maintain separate report messages', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '!=='),
      )

      expect(reports[0].message).toContain('>=')
      expect(reports[1].message).toContain('!==')
    })

    test('should track locations separately for multiple reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr', 1, 0), createLiteral(0, 1, 20), '>=', 1, 0),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr', 5, 3), createLiteral(0, 5, 23), '>=', 5, 3),
      )

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('should only report for matching patterns in a mix', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '==='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '!=='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(1), '>='),
      )

      expect(reports.length).toBe(2)
    })
  })

  describe('export verification', () => {
    test('should export rule as default export', () => {
      const defaultExport = preferIncludesRule
      expect(defaultExport).toBeDefined()
      expect(defaultExport.meta).toBeDefined()
      expect(defaultExport.create).toBeDefined()
    })

    test('should export rule with create method', () => {
      expect(typeof preferIncludesRule.create).toBe('function')
    })

    test('should export rule with meta property', () => {
      expect(preferIncludesRule.meta).toBeDefined()
    })

    test('should have RuleDefinition shape', () => {
      expect(preferIncludesRule).toHaveProperty('meta')
      expect(preferIncludesRule).toHaveProperty('create')
    })

    test('create should accept RuleContext parameter', () => {
      const { context } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      expect(() => preferIncludesRule.create(context)).not.toThrow()
    })

    test('create should return visitor with only BinaryExpression', () => {
      const { context } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      const keys = Object.keys(visitor)

      expect(keys).toContain('BinaryExpression')
      expect(keys.length).toBe(1)
    })
  })

  describe('all operator combinations', () => {
    const positiveCases = [
      { operator: '>=', value: 0, description: 'indexOf(x) >= 0' },
      { operator: '>=', value: -1, description: 'indexOf(x) >= -1' },
      { operator: '!==', value: 0, description: 'indexOf(x) !== 0' },
      { operator: '!==', value: -1, description: 'indexOf(x) !== -1' },
      { operator: '==', value: 0, description: 'indexOf(x) == 0' },
      { operator: '==', value: -1, description: 'indexOf(x) == -1' },
      { operator: '>', value: -1, description: 'indexOf(x) > -1' },
      { operator: '!=', value: -1, description: 'indexOf(x) != -1' },
    ]

    for (const { operator, value, description } of positiveCases) {
      test(`should report ${description}`, () => {
        const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
        const visitor = preferIncludesRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression(createIndexOfCall('arr'), createLiteral(value), operator),
        )

        expect(reports.length).toBe(1)
      })
    }

    const negativeCases = [
      { operator: '<', value: 0, description: 'indexOf(x) < 0' },
      { operator: '<=', value: 0, description: 'indexOf(x) <= 0' },
      { operator: '===', value: 0, description: 'indexOf(x) === 0' },
      { operator: '===', value: -1, description: 'indexOf(x) === -1' },
      { operator: '>', value: 0, description: 'indexOf(x) > 0' },
      { operator: '!=', value: 0, description: 'indexOf(x) != 0' },
      { operator: '>=', value: 1, description: 'indexOf(x) >= 1' },
      { operator: '>=', value: -2, description: 'indexOf(x) >= -2' },
      { operator: '+', value: 0, description: 'indexOf(x) + 0' },
      { operator: '-', value: 0, description: 'indexOf(x) - 0' },
    ]

    for (const { operator, value, description } of negativeCases) {
      test(`should not report ${description}`, () => {
        const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
        const visitor = preferIncludesRule.create(context)

        visitor.BinaryExpression(
          createBinaryExpression(createIndexOfCall('arr'), createLiteral(value), operator),
        )

        expect(reports.length).toBe(0)
      })
    }
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;', filePath: '/project/src/utils.ts' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = arr.indexOf(y) >= 0;', filePath: '/src/file.ts' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with config options present', () => {
      const { context, reports } = createMockRuleContext({ options: [{ strictMode: true }], source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(reports.length).toBe(1)
    })

    test('should work with multiple config options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ strictMode: true, maxErrors: 10 }], source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('visitor robustness', () => {
    test('should handle being called many times without issues', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.BinaryExpression(
          createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>=', i + 1, 0),
        )
      }

      expect(reports.length).toBe(50)
    })

    test('should handle mixed valid and invalid nodes', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      for (let i = 0; i < 25; i++) {
        if (i % 2 === 0) {
          visitor.BinaryExpression(
            createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
          )
        } else {
          visitor.BinaryExpression(null)
        }
      }

      expect(reports.length).toBe(13)
    })

    test('should not accumulate state between calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports.length).toBe(1)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '==='),
      )
      expect(reports.length).toBe(1)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports.length).toBe(2)
    })
  })

  describe('visitor return value', () => {
    test('should return undefined from BinaryExpression for matching node', () => {
      const { context } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const result = visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(result).toBeUndefined()
    })

    test('should return undefined from BinaryExpression for non-matching node', () => {
      const { context } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const result = visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '==='),
      )

      expect(result).toBeUndefined()
    })

    test('should return undefined from BinaryExpression for null node', () => {
      const { context } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      const result = visitor.BinaryExpression(null)

      expect(result).toBeUndefined()
    })
  })

  describe('report descriptor structure', () => {
    test('should always include both start and end in loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should provide message as non-empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })
  })

  describe('operator != edge case', () => {
    test('should not report indexOf != 0 since != only checks minusOne', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '!='),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report 0 != indexOf since != only checks minusOne', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIndexOfCall('arr'), '!='),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('visitor does not leak between instances', () => {
    test('should not share reports between different visitors', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })

      const visitor1 = preferIncludesRule.create(ctx1)
      const visitor2 = preferIncludesRule.create(ctx2)

      visitor1.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      visitor2.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '==='),
      )

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })
  })

  describe('additional operator coverage', () => {
    test('should not report indexOf ** 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '**'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf || 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '||'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf && 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '&&'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf ?? 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '??'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf << 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '<<'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf >> 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>>'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf * 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '*'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf / 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '/'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf % 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '%'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf & 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '&'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf | 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '|'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf ^ 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '^'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf in 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), 'in'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf instanceof 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), 'instanceof'),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('specific detection patterns', () => {
    test('should detect arr.indexOf(x) >= 0 with .includes() in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.includes()')
    })

    test('should detect arr.indexOf(x) !== -1 with .includes() in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '!=='),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.includes()')
    })

    test('should detect arr.indexOf(x) > -1 with .includes() in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '>'),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.includes()')
    })

    test('should detect arr.indexOf(x) != -1 with .includes() in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '!='),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.includes()')
    })

    test('should detect arr.indexOf(x) == 0 with .includes() in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '=='),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.includes()')
    })

    test('should detect arr.indexOf(x) == -1 with .includes() in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '=='),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('.includes()')
    })

    test('should detect 0 >= arr.indexOf(x) (reversed operands)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)

      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIndexOfCall('arr'), '>='),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('meta immutability', () => {
    test('should have meta.type as readonly suggestion', () => {
      expect(preferIncludesRule.meta.type).toBe('suggestion')
      expect(preferIncludesRule.meta.type).not.toBe('problem')
      expect(preferIncludesRule.meta.type).not.toBe('layout')
    })

    test('should have meta.severity as readonly warn', () => {
      expect(preferIncludesRule.meta.severity).toBe('warn')
      expect(preferIncludesRule.meta.severity).not.toBe('error')
      expect(preferIncludesRule.meta.severity).not.toBe('off')
    })

    test('should have consistent docs.description across multiple reads', () => {
      const desc1 = preferIncludesRule.meta.docs?.description
      const desc2 = preferIncludesRule.meta.docs?.description
      expect(desc1).toBe(desc2)
    })

    test('should have docs.category as patterns and not other categories', () => {
      expect(preferIncludesRule.meta.docs?.category).toBe('patterns')
      expect(preferIncludesRule.meta.docs?.category).not.toBe('security')
      expect(preferIncludesRule.meta.docs?.category).not.toBe('performance')
      expect(preferIncludesRule.meta.docs?.category).not.toBe('complexity')
    })

    test('should have meta.schema as empty array with length zero', () => {
      expect(preferIncludesRule.meta.schema).toEqual([])
      expect(preferIncludesRule.meta.schema!.length).toBe(0)
    })
  })

  describe('indexOf call detection - left side various names', () => {
    test('should detect arr.indexOf(x) >= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect items.indexOf(x) >= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('items'), createLiteral(0), '>='),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect list.indexOf(x) >= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('list'), createLiteral(0), '>='),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect data.indexOf(x) >= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('data'), createLiteral(0), '>='),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect result.indexOf(x) >= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('result'), createLiteral(0), '>='),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect myArray.indexOf(x) !== -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('myArray'), createLiteral(-1), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect collection.indexOf(x) > -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('collection'), createLiteral(-1), '>'),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect values.indexOf(x) == 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('values'), createLiteral(0), '=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect nums.indexOf(x) != -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('nums'), createLiteral(-1), '!='),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect strings.indexOf(x) >= -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('strings'), createLiteral(-1), '>='),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect x.indexOf(y) !== 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('x'), createLiteral(0), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect foo.indexOf(bar) == -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('foo'), createLiteral(-1), '=='),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('indexOf call detection - right side various names', () => {
    test('should detect 0 >= arr.indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIndexOfCall('arr'), '>='),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect 0 >= items.indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIndexOfCall('items'), '>='),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect -1 !== list.indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(-1), createIndexOfCall('list'), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect -1 > data.indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(-1), createIndexOfCall('data'), '>'),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect 0 == result.indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIndexOfCall('result'), '=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect -1 != myArray.indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(-1), createIndexOfCall('myArray'), '!='),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect -1 >= collection.indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(-1), createIndexOfCall('collection'), '>='),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect 0 !== values.indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIndexOfCall('values'), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect -1 == nums.indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(-1), createIndexOfCall('nums'), '=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should detect -1 !== strings.indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(-1), createIndexOfCall('strings'), '!=='),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('operator == with various operand positions', () => {
    test('should report indexOf(x) == 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should report indexOf(x) == -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should report 0 == indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIndexOfCall('arr'), '=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should report -1 == indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(-1), createIndexOfCall('arr'), '=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report indexOf(x) == 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(1), '=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf(x) == -2', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-2), '=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report 1 == indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(1), createIndexOfCall('arr'), '=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report -2 == indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(-2), createIndexOfCall('arr'), '=='),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('operator != with various operand positions', () => {
    test('should report indexOf(x) != -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '!='),
      )
      expect(reports.length).toBe(1)
    })

    test('should report -1 != indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(-1), createIndexOfCall('arr'), '!='),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report indexOf(x) != 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '!='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report 0 != indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIndexOfCall('arr'), '!='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf(x) != 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(1), '!='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf(x) != -2', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-2), '!='),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('operator > with various operand positions', () => {
    test('should report indexOf(x) > -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '>'),
      )
      expect(reports.length).toBe(1)
    })

    test('should report -1 > indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(-1), createIndexOfCall('arr'), '>'),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report indexOf(x) > 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report 0 > indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIndexOfCall('arr'), '>'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf(x) > -2', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-2), '>'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf(x) > 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(1), '>'),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('operator >= with various operand positions', () => {
    test('should report indexOf(x) >= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports.length).toBe(1)
    })

    test('should report indexOf(x) >= -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '>='),
      )
      expect(reports.length).toBe(1)
    })

    test('should report 0 >= indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIndexOfCall('arr'), '>='),
      )
      expect(reports.length).toBe(1)
    })

    test('should report -1 >= indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(-1), createIndexOfCall('arr'), '>='),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report indexOf(x) >= 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(1), '>='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf(x) >= -2', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-2), '>='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report 1 >= indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(1), createIndexOfCall('arr'), '>='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report -2 >= indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(-2), createIndexOfCall('arr'), '>='),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('operator !== with various operand positions', () => {
    test('should report indexOf(x) !== 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should report indexOf(x) !== -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should report 0 !== indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIndexOfCall('arr'), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should report -1 !== indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(-1), createIndexOfCall('arr'), '!=='),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report indexOf(x) !== 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(1), '!=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf(x) !== -2', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-2), '!=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report 1 !== indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(1), createIndexOfCall('arr'), '!=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report -2 !== indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(-2), createIndexOfCall('arr'), '!=='),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('negative operators should not report', () => {
    test('should not report indexOf(x) < 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '<'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf(x) < -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '<'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report 0 < indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIndexOfCall('arr'), '<'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf(x) <= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '<='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report 0 <= indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIndexOfCall('arr'), '<='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf(x) === 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf(x) === -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report 0 === indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIndexOfCall('arr'), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report -1 === indexOf(x)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(-1), createIndexOfCall('arr'), '==='),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('non-indexOf method calls on arrays', () => {
    test('should not report arr.includes(x) >= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'includes' },
          },
          arguments: [],
        },
        right: createLiteral(0),
        operator: '>=',
      })
      expect(reports.length).toBe(0)
    })

    test('should not report arr.findIndex(x) >= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'findIndex' },
          },
          arguments: [],
        },
        right: createLiteral(0),
        operator: '>=',
      })
      expect(reports.length).toBe(0)
    })

    test('should not report arr.lastIndexOf(x) >= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'lastIndexOf' },
          },
          arguments: [],
        },
        right: createLiteral(0),
        operator: '>=',
      })
      expect(reports.length).toBe(0)
    })

    test('should not report arr.map(x) >= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'map' },
          },
          arguments: [],
        },
        right: createLiteral(0),
        operator: '>=',
      })
      expect(reports.length).toBe(0)
    })

    test('should not report arr.filter(x) >= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'filter' },
          },
          arguments: [],
        },
        right: createLiteral(0),
        operator: '>=',
      })
      expect(reports.length).toBe(0)
    })

    test('should not report arr.forEach(x) >= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'forEach' },
          },
          arguments: [],
        },
        right: createLiteral(0),
        operator: '>=',
      })
      expect(reports.length).toBe(0)
    })

    test('should not report str.search(x) >= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'str' },
            property: { type: 'Identifier', name: 'search' },
          },
          arguments: [],
        },
        right: createLiteral(0),
        operator: '>=',
      })
      expect(reports.length).toBe(0)
    })

    test('should not report arr.findIndex(x) !== -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Identifier', name: 'findIndex' },
          },
          arguments: [],
        },
        right: createLiteral(-1),
        operator: '!==',
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('computed and nested member expressions', () => {
    test('should not report when property is computed indexOf', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'arr' },
            property: { type: 'Literal', value: 'indexOf' },
            computed: true,
          },
          arguments: [],
        },
        right: createLiteral(0),
        operator: '>=',
      })
      expect(reports.length).toBe(0)
    })

    test('should report obj.arr.indexOf(x) >= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'arr' },
            },
            property: { type: 'Identifier', name: 'indexOf' },
          },
          arguments: [],
        },
        right: createLiteral(0),
        operator: '>=',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report this.items.indexOf(x) >= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: { type: 'ThisExpression' },
              property: { type: 'Identifier', name: 'items' },
            },
            property: { type: 'Identifier', name: 'indexOf' },
          },
          arguments: [],
        },
        right: createLiteral(0),
        operator: '>=',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should report a.b.c.indexOf(x) >= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: 'a' },
                property: { type: 'Identifier', name: 'b' },
              },
              property: { type: 'Identifier', name: 'c' },
            },
            property: { type: 'Identifier', name: 'indexOf' },
          },
          arguments: [],
        },
        right: createLiteral(0),
        operator: '>=',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(1)
    })

    test('should detect indexOf on call expression result object', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'getArray' },
              arguments: [],
            },
            property: { type: 'Identifier', name: 'indexOf' },
          },
          arguments: [],
        },
        right: createLiteral(0),
        operator: '>=',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })
      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting detailed', () => {
    test('should report start line 1, column 0 for default node', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>=', 1, 0),
      )
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report end location from node loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>=', 1, 0),
      )
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('should report correct location at line 42, column 15', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createIndexOfCall('arr', 42, 15),
          createLiteral(0, 42, 35),
          '>=',
          42,
          15,
        ),
      )
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report correct location at line 100, column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createIndexOfCall('arr', 100, 50),
          createLiteral(0, 100, 70),
          '>=',
          100,
          50,
        ),
      )
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report default location when loc is undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      const node = {
        type: 'BinaryExpression',
        left: createIndexOfCall('arr'),
        right: createLiteral(0),
        operator: '>=',
        loc: undefined,
      }
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct end for line 5, column 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createIndexOfCall('arr', 5, 10),
          createLiteral(0, 5, 30),
          '>=',
          5,
          10,
        ),
      )
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('should report location for !== pattern at line 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          createIndexOfCall('arr', 10, 5),
          createLiteral(-1, 10, 25),
          '!==',
          10,
          5,
        ),
      )
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('should report location for > pattern at line 7', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr', 7, 2), createLiteral(-1, 7, 15), '>', 7, 2),
      )
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
    })
  })

  describe('message content detailed checks', () => {
    test('should contain Prefer in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports[0].message).toContain('Prefer')
    })

    test('should contain .includes() in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports[0].message).toContain('.includes()')
    })

    test('should contain .indexOf() in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports[0].message).toContain('.indexOf()')
    })

    test('should contain readable in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports[0].message.toLowerCase()).toContain('readable')
    })

    test('should end message with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports[0].message).toMatch(/\.$/)
    })

    test('should have same message regardless of array name', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor1 = preferIncludesRule.create(ctx1)
      const visitor2 = preferIncludesRule.create(ctx2)
      visitor1.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      visitor2.BinaryExpression(
        createBinaryExpression(createIndexOfCall('items'), createLiteral(0), '>='),
      )
      expect(reports1[0].message).toBe(reports2[0].message)
    })

    test('should have same message for left and right side indexOf', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor1 = preferIncludesRule.create(ctx1)
      const visitor2 = preferIncludesRule.create(ctx2)
      visitor1.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      visitor2.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIndexOfCall('arr'), '>='),
      )
      expect(reports1[0].message).toBe(reports2[0].message)
    })

    test('should have correct message for == operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '=='),
      )
      expect(reports[0].message).toBe(
        'Prefer .includes() over .indexOf() == for more readable code.',
      )
    })

    test('should have correct message for != operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '!='),
      )
      expect(reports[0].message).toBe(
        'Prefer .includes() over .indexOf() != for more readable code.',
      )
    })

    test('should have correct message for > operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '>'),
      )
      expect(reports[0].message).toBe(
        'Prefer .includes() over .indexOf() > for more readable code.',
      )
    })
  })

  describe('multiple reports detailed', () => {
    test('should accumulate reports correctly for same pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      for (let i = 0; i < 10; i++) {
        visitor.BinaryExpression(
          createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>=', i + 1, 0),
        )
      }
      expect(reports.length).toBe(10)
    })

    test('should accumulate reports for mixed operators', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '!=='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '>'),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '=='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '!='),
      )
      expect(reports.length).toBe(5)
    })

    test('should accumulate reports for both left and right indexOf', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), createIndexOfCall('arr'), '>='),
      )
      expect(reports.length).toBe(2)
    })

    test('should maintain correct message order for mixed operators', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '!=='),
      )
      expect(reports[0].message).toContain('>=')
      expect(reports[1].message).toContain('!==')
    })

    test('should not report non-matching patterns mixed with matching', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '==='),
      )
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports.length).toBe(2)
    })

    test('should handle 100 rapid calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      for (let i = 0; i < 100; i++) {
        visitor.BinaryExpression(
          createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
        )
      }
      expect(reports.length).toBe(100)
    })
  })

  describe('report descriptor completeness', () => {
    test('should always have message property', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports[0]).toHaveProperty('message')
    })

    test('should always have loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports[0]).toHaveProperty('loc')
    })

    test('should have loc.start with line and column as numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have loc.end with line and column as numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should have message as string type', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(typeof reports[0].message).toBe('string')
    })

    test('should have message with length greater than 20', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports[0].message.length).toBeGreaterThan(20)
    })
  })

  describe('visitor isolation between instances', () => {
    test('visitor1 should not see visitor2 reports', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor1 = preferIncludesRule.create(ctx1)
      const visitor2 = preferIncludesRule.create(ctx2)
      visitor1.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      visitor2.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '==='),
      )
      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('visitor2 should not see visitor1 reports', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor1 = preferIncludesRule.create(ctx1)
      const visitor2 = preferIncludesRule.create(ctx2)
      visitor1.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '==='),
      )
      visitor2.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports1.length).toBe(0)
      expect(reports2.length).toBe(1)
    })

    test('three visitors should be fully isolated', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const { context: ctx3, reports: reports3 } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor1 = preferIncludesRule.create(ctx1)
      const visitor2 = preferIncludesRule.create(ctx2)
      const visitor3 = preferIncludesRule.create(ctx3)
      visitor1.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      visitor2.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      visitor2.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      visitor3.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '==='),
      )
      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(2)
      expect(reports3.length).toBe(0)
    })
  })

  describe('create method behavior', () => {
    test('should return visitor with exactly one key', () => {
      const { context } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      expect(Object.keys(visitor).length).toBe(1)
    })

    test('should return visitor where BinaryExpression is callable', () => {
      const { context } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('should return a new object on each call', () => {
      const { context } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const v1 = preferIncludesRule.create(context)
      const v2 = preferIncludesRule.create(context)
      const v3 = preferIncludesRule.create(context)
      expect(v1).not.toBe(v2)
      expect(v2).not.toBe(v3)
      expect(v1).not.toBe(v3)
    })

    test('should accept context and not throw', () => {
      const { context } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      expect(() => preferIncludesRule.create(context)).not.toThrow()
    })

    test('should return object with only BinaryExpression key', () => {
      const { context } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      const keys = Object.keys(visitor)
      expect(keys).toEqual(['BinaryExpression'])
    })
  })

  describe('node type guard checks', () => {
    test('should not report UnaryExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({ type: 'UnaryExpression' })
      expect(reports.length).toBe(0)
    })

    test('should not report LogicalExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({ type: 'LogicalExpression' })
      expect(reports.length).toBe(0)
    })

    test('should not report AssignmentExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({ type: 'AssignmentExpression' })
      expect(reports.length).toBe(0)
    })

    test('should not report ConditionalExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({ type: 'ConditionalExpression' })
      expect(reports.length).toBe(0)
    })

    test('should not report CallExpression node', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({ type: 'CallExpression' })
      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: createIndexOfCall('arr'),
        right: createLiteral(0),
        operator: '>=',
        extra: true,
        range: [0, 20],
      })
      expect(reports.length).toBe(1)
    })
  })

  describe('literal type edge cases', () => {
    test('should not match when left type is not Literal for value check', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= zero;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: createIndexOfCall('arr'),
        right: { type: 'Identifier', name: 'zero' },
        operator: '>=',
      })
      expect(reports.length).toBe(0)
    })

    test('should match when literal value is negative zero (equals 0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: createIndexOfCall('arr'),
        right: { type: 'Literal', value: -0 },
        operator: '>=',
      })
      expect(reports.length).toBe(1)
    })

    test('should not match when literal value is Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: createIndexOfCall('arr'),
        right: { type: 'Literal', value: Infinity },
        operator: '>=',
      })
      expect(reports.length).toBe(0)
    })

    test('should not match when literal value is -Infinity', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: createIndexOfCall('arr'),
        right: { type: 'Literal', value: -Infinity },
        operator: '>=',
      })
      expect(reports.length).toBe(0)
    })

    test('should not match when literal value is undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression({
        type: 'BinaryExpression',
        left: createIndexOfCall('arr'),
        right: { type: 'Literal' },
        operator: '>=',
      })
      expect(reports.length).toBe(0)
    })
  })

  describe('no indexOf on either side', () => {
    test('should not report when both sides are identifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          { type: 'Identifier', name: 'x' },
          { type: 'Identifier', name: 'y' },
          '>=',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when left is function call and right is literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(
          { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
          createLiteral(0),
          '>=',
        ),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when left is literal and right is identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createLiteral(0), { type: 'Identifier', name: 'y' }, '>='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report when both sides are literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(createBinaryExpression(createLiteral(0), createLiteral(0), '>='))
      expect(reports.length).toBe(0)
    })
  })

  describe('export and rule shape verification', () => {
    test('should have exactly meta and create properties', () => {
      const keys = Object.keys(preferIncludesRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })

    test('should have meta as a non-null object', () => {
      expect(typeof preferIncludesRule.meta).toBe('object')
      expect(preferIncludesRule.meta).not.toBeNull()
    })

    test('should have create as a function', () => {
      expect(typeof preferIncludesRule.create).toBe('function')
    })

    test('should have meta.type defined', () => {
      expect(preferIncludesRule.meta.type).toBeDefined()
    })

    test('should have meta.severity defined', () => {
      expect(preferIncludesRule.meta.severity).toBeDefined()
    })

    test('should have meta.docs defined', () => {
      expect(preferIncludesRule.meta.docs).toBeDefined()
    })

    test('should have meta.docs.description defined', () => {
      expect(preferIncludesRule.meta.docs?.description).toBeDefined()
    })

    test('should have meta.schema defined', () => {
      expect(preferIncludesRule.meta.schema).toBeDefined()
    })
  })

  describe('context with different configs', () => {
    test('should work with undefined config options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'arr.indexOf(x) >= 0;',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with null options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'arr.indexOf(x) >= 0;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: null },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with long file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;', filePath: '/very/long/path/to/some/deeply/nested/directory/structure/src/components/utils/file.ts' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with .js file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;', filePath: '/src/file.js' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;', filePath: '/src/component.tsx' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with .jsx file extension', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;', filePath: '/src/component.jsx' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports.length).toBe(1)
    })

    test('should work with multi-line source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = 1;\nconst y = arr.indexOf(z) >= 0;\nconsole.log(y);', filePath: '/src/file.ts' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>='),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('parametrized all positive operators both sides', () => {
    const cases: Array<{ op: string; val: number; desc: string }> = [
      { op: '>=', val: 0, desc: '>= 0' },
      { op: '>=', val: -1, desc: '>= -1' },
      { op: '!==', val: 0, desc: '!== 0' },
      { op: '!==', val: -1, desc: '!== -1' },
      { op: '==', val: 0, desc: '== 0' },
      { op: '==', val: -1, desc: '== -1' },
      { op: '>', val: -1, desc: '> -1' },
      { op: '!=', val: -1, desc: '!= -1' },
    ]

    for (const { op, val, desc } of cases) {
      test(`should report indexOf(x) ${desc} (left indexOf)`, () => {
        const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
        const visitor = preferIncludesRule.create(context)
        visitor.BinaryExpression(
          createBinaryExpression(createIndexOfCall('arr'), createLiteral(val), op),
        )
        expect(reports.length).toBe(1)
      })

      test(`should report ${val} ${op} indexOf(x) (right indexOf)`, () => {
        const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
        const visitor = preferIncludesRule.create(context)
        visitor.BinaryExpression(
          createBinaryExpression(createLiteral(val), createIndexOfCall('arr'), op),
        )
        expect(reports.length).toBe(1)
      })
    }
  })

  describe('parametrized negative operators and values', () => {
    test('should not report indexOf === 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf === -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '==='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf < -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '<'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf <= 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '<='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf <= -1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-1), '<='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf > 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '>'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf != 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(0), '!='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf >= 2', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(2), '>='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf >= -2', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-2), '>='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf !== 2', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(2), '!=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf !== -2', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-2), '!=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf == 2', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(2), '=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf == -2', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-2), '=='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf > 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(1), '>'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf > -2', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-2), '>'),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf != 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(1), '!='),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report indexOf != -2', () => {
      const { context, reports } = createMockRuleContext({ source: 'arr.indexOf(x) >= 0;' })
      const visitor = preferIncludesRule.create(context)
      visitor.BinaryExpression(
        createBinaryExpression(createIndexOfCall('arr'), createLiteral(-2), '!='),
      )
      expect(reports.length).toBe(0)
    })
  })
})

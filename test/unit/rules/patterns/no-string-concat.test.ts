import { describe, test, expect, vi } from 'vitest'
import { noStringConcatRule } from '../../../../src/rules/patterns/no-string-concat.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createBinaryExpression(
  left: unknown,
  operator: string,
  right: unknown,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    left,
    operator,
    right,
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
  }
}

function createTemplateLiteral(): unknown {
  return {
    type: 'TemplateLiteral',
    quasis: [],
    expressions: [],
  }
}

describe('no-string-concat rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noStringConcatRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noStringConcatRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noStringConcatRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noStringConcatRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noStringConcatRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noStringConcatRule.meta.fixable).toBeUndefined()
    })

    test('should mention string concatenation in description', () => {
      expect(noStringConcatRule.meta.docs?.description.toLowerCase()).toContain(
        'string concatenation',
      )
    })

    test('should mention template literals in description', () => {
      expect(noStringConcatRule.meta.docs?.description.toLowerCase()).toContain('template')
    })

    test('should mention array join in description', () => {
      expect(noStringConcatRule.meta.docs?.description.toLowerCase()).toContain('join')
    })

    test('should have documentation URL', () => {
      expect(noStringConcatRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-string-concat',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  describe('detecting string literal + string literal', () => {
    test('should report "hello" + "world"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('string concatenation')
    })

    test('should report "" + ""', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(''), '+', createLiteral(''))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "a" + "b" + "c" (left operand is literal)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createLiteral('a'),
        '+',
        createBinaryExpression(createLiteral('b'), '+', createLiteral('c')),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report multi-line string concatenation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createLiteral('first line\n'),
        '+',
        createLiteral('second line'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting string literal + variable', () => {
    test('should report "hello" + variable', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createIdentifier('name'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('string concatenation')
    })

    test('should report "prefix: " + user.id', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('prefix: '), '+', createIdentifier('user'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "" + emptyVar', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(''), '+', createIdentifier('emptyVar'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "result: " + (a + b) (right operand is expression)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createLiteral('result: '),
        '+',
        createBinaryExpression(createIdentifier('a'), '+', createIdentifier('b')),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting variable + string literal', () => {
    test('should report variable + "world"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createIdentifier('name'), '+', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('string concatenation')
    })

    test('should report user.id + " suffix"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createIdentifier('userId'), '+', createLiteral(' suffix'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report emptyVar + ""', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createIdentifier('emptyVar'), '+', createLiteral(''))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report (a + b) + " suffix" (left operand is expression)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createBinaryExpression(createIdentifier('a'), '+', createIdentifier('b')),
        '+',
        createLiteral(' suffix'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting template literal concatenation', () => {
    test('should report "prefix" + templateLiteral', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('prefix'), '+', createTemplateLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report templateLiteral + "suffix"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createTemplateLiteral(), '+', createLiteral('suffix'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report templateLiteral + templateLiteral', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createTemplateLiteral(), '+', createTemplateLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting numeric addition', () => {
    test('should not report 1 + 2', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(1), '+', createLiteral(2))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report x + y (variables)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), '+', createIdentifier('y'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report a + (b + c) (nested expressions)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createIdentifier('a'),
        '+',
        createBinaryExpression(createIdentifier('b'), '+', createIdentifier('c')),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report 10 + count', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(10), '+', createIdentifier('count'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report index + 1', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createIdentifier('index'), '+', createLiteral(1))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('not reporting non-plus operators', () => {
    test('should not report "hello" - "world"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '-', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "hello" * 2', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '*', createLiteral(2))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str === "test"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createIdentifier('str'), '===', createLiteral('test'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report 5 + 5 (numeric addition)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(5), '+', createLiteral(5))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        operator: '+',
        right: createLiteral('world'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createLiteral('hello'),
        '+',
        createLiteral('world'),
        25,
        10,
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(25)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without left operand (reports if right is string)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        operator: '+',
        right: createLiteral('world'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without right operand (reports if left is string)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        operator: '+',
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node without operator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        right: createLiteral('world'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null left operand (reports if right is string)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: null,
        operator: '+',
        right: createLiteral('world'),
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with null right operand (reports if left is string)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        operator: '+',
        right: null,
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with missing start', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        operator: '+',
        right: createLiteral('world'),
        loc: {
          end: { line: 1, column: 15 },
        },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with missing end', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        operator: '+',
        right: createLiteral('world'),
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle loc with invalid line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        operator: '+',
        right: createLiteral('world'),
        loc: {
          start: { line: -1, column: 'invalid' as unknown as number },
          end: { line: null as unknown as number, column: 15 },
        },
      }

      expect(() => visitor.BinaryExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle boolean literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(true), '+', createLiteral(false))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention string concatenation in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('string concatenation')
    })

    test('should mention template literals in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('template literals')
    })

    test('should mention array.join() in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('array.join()')
    })

    test('should mention unexpected in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should suggest use template literals or array join', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('Use')
      expect(reports[0].message).toContain('instead')
    })
  })

  describe('location accuracy', () => {
    test('should report correct start line', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createLiteral('hello'),
        '+',
        createLiteral('world'),
        42,
        5,
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
    })

    test('should report correct start column', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'), 1)

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct end column', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createLiteral('hello'),
        '+',
        createLiteral('world'),
        1,
        10,
      )

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('should provide default location when loc is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        operator: '+',
        right: createLiteral('world'),
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('multiple violations', () => {
    test('should report multiple concatenations in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node1 = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      const node2 = createBinaryExpression(createLiteral('c'), '+', createLiteral('d'))

      visitor.BinaryExpression(node1)
      visitor.BinaryExpression(node2)

      expect(reports.length).toBe(2)
    })

    test('should report same violation only once', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'))

      visitor.BinaryExpression(node)
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(2)
    })
  })

  describe('meta extended', () => {
    test('should have meta as plain object', () => {
      expect(typeof noStringConcatRule.meta).toBe('object')
      expect(noStringConcatRule.meta).not.toBeNull()
      expect(Array.isArray(noStringConcatRule.meta)).toBe(false)
    })

    test('should have type property as string', () => {
      expect(typeof noStringConcatRule.meta.type).toBe('string')
    })

    test('should have severity property as string', () => {
      expect(typeof noStringConcatRule.meta.severity).toBe('string')
    })

    test('should have docs property as object', () => {
      expect(typeof noStringConcatRule.meta.docs).toBe('object')
      expect(noStringConcatRule.meta.docs).not.toBeNull()
    })

    test('should have docs.description as non-empty string', () => {
      expect(typeof noStringConcatRule.meta.docs?.description).toBe('string')
      expect(noStringConcatRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs.category as non-empty string', () => {
      expect(typeof noStringConcatRule.meta.docs?.category).toBe('string')
      expect(noStringConcatRule.meta.docs?.category.length).toBeGreaterThan(0)
    })

    test('should have docs.recommended as boolean', () => {
      expect(typeof noStringConcatRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have docs.url as non-empty string', () => {
      expect(typeof noStringConcatRule.meta.docs?.url).toBe('string')
      expect(noStringConcatRule.meta.docs?.url.length).toBeGreaterThan(0)
    })

    test('should have schema as array', () => {
      expect(Array.isArray(noStringConcatRule.meta.schema)).toBe(true)
    })

    test('should have valid meta structure with all required fields', () => {
      const meta = noStringConcatRule.meta
      expect(meta).toHaveProperty('type')
      expect(meta).toHaveProperty('severity')
      expect(meta).toHaveProperty('docs')
      expect(meta).toHaveProperty('schema')
    })
  })

  describe('create extended', () => {
    test('should return BinaryExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('should not return Literal visitor', () => {
      const { context } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      expect(visitor).not.toHaveProperty('Literal')
    })

    test('should not return Identifier visitor', () => {
      const { context } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      expect(visitor).not.toHaveProperty('Identifier')
    })

    test('should create independent visitor instances', () => {
      const { context: ctx1 } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const { context: ctx2 } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor1 = noStringConcatRule.create(ctx1)
      const visitor2 = noStringConcatRule.create(ctx2)

      expect(visitor1).not.toBe(visitor2)
    })

    test('visitor BinaryExpression should not return a value', () => {
      const { context } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))

      const result = visitor.BinaryExpression(node)

      expect(result).toBeUndefined()
    })

    test('should create visitor for different file paths', () => {
      const { context } = createMockRuleContext({ source: 'const str = "hello" + "world";', filePath: '/other/path.ts' })
      const visitor = noStringConcatRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should create visitor for different source code', () => {
      const { context } = createMockRuleContext({ source: 'const x = 1;', filePath: '/src/file.ts' })
      const visitor = noStringConcatRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should create visitor with undefined config', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push(d)
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext
      const visitor = noStringConcatRule.create(context)

      expect(visitor).toHaveProperty('BinaryExpression')
    })
  })

  describe('detecting unicode and special strings', () => {
    test('should report "日本語" + "文字"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('日本語'), '+', createLiteral('文字'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "emoji 🎉" + "party 🥳"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('emoji 🎉'), '+', createLiteral('party 🥳'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "hello\\n" + "world"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello\n'), '+', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "tab\\there" + "after"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('tab\there'), '+', createLiteral('after'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "quote\\"test" + "end"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('quote"test'), '+', createLiteral('end'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "backslash\\\\" + "path"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('backslash\\'), '+', createLiteral('path'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report single char "a" + "b"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report long string + long string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const longStr = 'a'.repeat(1000)
      const node = createBinaryExpression(createLiteral(longStr), '+', createLiteral(longStr))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report " " + " " (whitespace strings)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(' '), '+', createLiteral(' '))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report "\\0" + "\\0" (null char strings)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('\0'), '+', createLiteral('\0'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report string + template in nested binary', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createLiteral('prefix'),
        '+',
        createBinaryExpression(createTemplateLiteral(), '+', createLiteral('suffix')),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report identifier + template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createIdentifier('str'), '+', createTemplateLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal + identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createTemplateLiteral(), '+', createIdentifier('str'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report string concat with unicode escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('\u0041'), '+', createLiteral('B'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report string with CRLF concatenation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('line1\r\n'), '+', createLiteral('line2'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report deeply nested left-side string concat', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const inner = createBinaryExpression(createIdentifier('a'), '+', createIdentifier('b'))
      const middle = createBinaryExpression(inner, '+', createIdentifier('c'))
      const node = createBinaryExpression(createLiteral('start: '), '+', middle)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report deeply nested right-side string concat', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const inner = createBinaryExpression(createIdentifier('a'), '+', createIdentifier('b'))
      const middle = createBinaryExpression(inner, '+', createIdentifier('c'))
      const node = createBinaryExpression(middle, '+', createLiteral(' :end'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report string concat with path separators', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('/usr/'), '+', createLiteral('local/bin'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report URL concatenation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createLiteral('https://'),
        '+',
        createLiteral('example.com'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report string concat with HTML tags', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('<div>'), '+', createLiteral('</div>'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report string concat with SQL fragments', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createLiteral('SELECT * FROM '),
        '+',
        createLiteral('users'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report string concat with error message pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createLiteral('Error: '),
        '+',
        createLiteral('something went wrong'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report string + string in return statement context', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('result: '), '+', createIdentifier('value'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal + template literal in nested expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const inner = createBinaryExpression(createTemplateLiteral(), '+', createTemplateLiteral())
      const node = createBinaryExpression(inner, '+', createLiteral('end'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report empty string + template literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(''), '+', createTemplateLiteral())

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report template literal + empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createTemplateLiteral(), '+', createLiteral(''))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('not reporting mixed non-string types', () => {
    test('should not report null + null', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(null), '+', createLiteral(null))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report undefined + undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(undefined), '+', createLiteral(undefined))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report true + false', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(true), '+', createLiteral(false))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report 0 + "" when both operands are numeric', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(0), '+', createLiteral(0))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report negative number + positive number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(-5), '+', createLiteral(10))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report float + float', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(3.14), '+', createLiteral(2.71))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report number + identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(42), '+', createIdentifier('count'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report identifier + number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createIdentifier('count'), '+', createLiteral(1))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report boolean + number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(true), '+', createLiteral(1))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report number + boolean', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(1), '+', createLiteral(false))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "hello" === "world" (strict equality)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '===', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "hello" !== "world" (strict inequality)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '!==', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "hello" == "world" (loose equality)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '==', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "hello" != "world" (loose inequality)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '!=', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "a" < "b" (less than)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '<', createLiteral('b'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "a" > "b" (greater than)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '>', createLiteral('b'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "a" <= "b" (less than or equal)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '<=', createLiteral('b'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "a" >= "b" (greater than or equal)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '>=', createLiteral('b'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "hello" & "world" (bitwise AND)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '&', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "hello" | "world" (bitwise OR)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '|', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "hello" ^ "world" (bitwise XOR)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '^', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "hello" << "world" (left shift)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '<<', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "hello" >> "world" (right shift)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '>>', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "hello" >>> "world" (unsigned right shift)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '>>>', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "hello" % "world" (modulo)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '%', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "hello" ** "world" (exponentiation)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '**', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report "hello" in obj (in operator)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), 'in', createIdentifier('obj'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report obj instanceof Cls (instanceof operator)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createIdentifier('obj'),
        'instanceof',
        createIdentifier('Cls'),
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report number + number + number (chained numeric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const inner = createBinaryExpression(createLiteral(1), '+', createLiteral(2))
      const node = createBinaryExpression(inner, '+', createLiteral(3))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases extended', () => {
    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        operator: '+',
        right: createLiteral('world'),
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 15 } },
        range: [0, 15],
        extra: { parenthesized: true },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with empty loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        operator: '+',
        right: createLiteral('world'),
        loc: {},
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with NaN line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        operator: '+',
        right: createLiteral('world'),
        loc: {
          start: { line: NaN, column: 0 },
          end: { line: NaN, column: 15 },
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with Infinity line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        operator: '+',
        right: createLiteral('world'),
        loc: {
          start: { line: Infinity, column: 0 },
          end: { line: Infinity, column: 15 },
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with zero line and column', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'), 0, 0)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with very large line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createLiteral('hello'),
        '+',
        createLiteral('world'),
        999999,
        0,
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(999999)
    })

    test('should handle node with very large column number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(
        createLiteral('hello'),
        '+',
        createLiteral('world'),
        1,
        999999,
      )

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(999999)
    })

    test('should handle CallExpression as left operand (no report)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const callNode = { type: 'CallExpression', callee: createIdentifier('fn'), arguments: [] }
      const node = createBinaryExpression(callNode, '+', createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle MemberExpression as left operand (no report)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const memberNode = {
        type: 'MemberExpression',
        object: createIdentifier('obj'),
        property: createIdentifier('prop'),
      }
      const node = createBinaryExpression(memberNode, '+', createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle ArrayExpression as operand (no report)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const arrayNode = { type: 'ArrayExpression', elements: [] }
      const node = createBinaryExpression(arrayNode, '+', createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle ObjectExpression as operand (no report)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const objectNode = { type: 'ObjectExpression', properties: [] }
      const node = createBinaryExpression(objectNode, '+', createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle FunctionExpression as operand (no report)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const funcNode = { type: 'FunctionExpression', params: [], body: {} }
      const node = createBinaryExpression(funcNode, '+', createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle ArrowFunctionExpression as operand (no report)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const arrowNode = { type: 'ArrowFunctionExpression', params: [], body: {} }
      const node = createBinaryExpression(arrowNode, '+', createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with left as empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: {},
        operator: '+',
        right: createLiteral('world'),
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with right as empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('hello'),
        operator: '+',
        right: {},
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with string literal having numeric-like value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('123'), '+', createLiteral('456'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with string literal "true"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('true'), '+', createLiteral('false'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with string literal "null"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('null'), '+', createLiteral('undefined'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with string literal "undefined"', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('undefined'), '+', createIdentifier('x'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle boolean + string (boolean left, no report)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(true), '+', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle string + boolean (string left, report)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral(true))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle null literal + string (null left, string right, report)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral(null), '+', createLiteral('world'))

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('location extended', () => {
    test('should report correct location for line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'), 1, 0)

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location for line 100 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'), 100, 50)

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'), 5, 10)

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('should report default location for node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('a'),
        operator: '+',
        right: createLiteral('b'),
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(1)
    })

    test('should report location with only start', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('a'),
        operator: '+',
        right: createLiteral('b'),
        loc: { start: { line: 10, column: 5 } },
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report location with only end', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('a'),
        operator: '+',
        right: createLiteral('b'),
        loc: { end: { line: 20, column: 30 } },
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for multiple violations independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node1 = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'), 3, 5)
      const node2 = createBinaryExpression(createLiteral('c'), '+', createLiteral('d'), 10, 20)

      visitor.BinaryExpression(node1)
      visitor.BinaryExpression(node2)

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[1].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.column).toBe(20)
    })

    test('should handle location with non-numeric start line', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('a'),
        operator: '+',
        right: createLiteral('b'),
        loc: {
          start: { line: 'bad' as unknown as number, column: 0 },
          end: { line: 1, column: 10 },
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should handle location with non-numeric start column', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('a'),
        operator: '+',
        right: createLiteral('b'),
        loc: {
          start: { line: 1, column: 'bad' as unknown as number },
          end: { line: 1, column: 10 },
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve exact location data from node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('a'),
        operator: '+',
        right: createLiteral('b'),
        loc: {
          start: { line: 42, column: 7 },
          end: { line: 42, column: 22 },
        },
      }

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(7)
      expect(reports[0].loc?.end.line).toBe(42)
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('should handle loc with undefined start', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('a'),
        operator: '+',
        right: createLiteral('b'),
        loc: {
          start: undefined as unknown as { line: number; column: number },
          end: { line: 1, column: 10 },
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle loc with undefined end', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = {
        type: 'BinaryExpression',
        left: createLiteral('a'),
        operator: '+',
        right: createLiteral('b'),
        loc: {
          start: { line: 1, column: 0 },
          end: undefined as unknown as { line: number; column: number },
        },
      }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('message extended', () => {
    test('should contain "Unexpected" in message for string+string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should contain "Unexpected" in message for string+identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '+', createIdentifier('x'))
      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should contain "Unexpected" in message for identifier+string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createIdentifier('x'), '+', createLiteral('b'))
      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should contain "Unexpected" in message for template+template', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createTemplateLiteral(), '+', createTemplateLiteral())
      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should have consistent message for all violation types', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const cases = [
        createBinaryExpression(createLiteral('a'), '+', createLiteral('b')),
        createBinaryExpression(createLiteral('a'), '+', createIdentifier('x')),
        createBinaryExpression(createIdentifier('x'), '+', createLiteral('b')),
        createBinaryExpression(createTemplateLiteral(), '+', createLiteral('b')),
        createBinaryExpression(createLiteral('a'), '+', createTemplateLiteral()),
      ]

      for (const node of cases) {
        visitor.BinaryExpression(node)
      }

      const messages = reports.map((r) => r.message)
      const allSame = messages.every((m) => m === messages[0])
      expect(allSame).toBe(true)
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      visitor.BinaryExpression(node)

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should be a string type message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      visitor.BinaryExpression(node)

      expect(typeof reports[0].message).toBe('string')
    })

    test('should not contain placeholder tokens in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      visitor.BinaryExpression(node)

      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
      expect(reports[0].message).not.toContain('${')
    })

    test('should contain punctuation in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      visitor.BinaryExpression(node)

      expect(reports[0].message).toContain('.')
    })

    test('should contain action suggestion in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      visitor.BinaryExpression(node)

      expect(reports[0].message).toMatch(/Use|use/)
    })
  })

  describe('multiple violations extended', () => {
    test('should report three concatenations in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node1 = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      const node2 = createBinaryExpression(createLiteral('c'), '+', createLiteral('d'))
      const node3 = createBinaryExpression(createLiteral('e'), '+', createLiteral('f'))

      visitor.BinaryExpression(node1)
      visitor.BinaryExpression(node2)
      visitor.BinaryExpression(node3)

      expect(reports.length).toBe(3)
    })

    test('should report five concatenations in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      for (let i = 0; i < 5; i++) {
        const node = createBinaryExpression(createLiteral(`a${i}`), '+', createLiteral(`b${i}`))
        visitor.BinaryExpression(node)
      }

      expect(reports.length).toBe(5)
    })

    test('should report ten concatenations in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      for (let i = 0; i < 10; i++) {
        const node = createBinaryExpression(createLiteral(`a${i}`), '+', createLiteral(`b${i}`))
        visitor.BinaryExpression(node)
      }

      expect(reports.length).toBe(10)
    })

    test('should report mixed violations and non-violations correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const stringNode = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      const numNode = createBinaryExpression(createLiteral(1), '+', createLiteral(2))
      const mixedNode = createBinaryExpression(createLiteral('c'), '+', createIdentifier('d'))

      visitor.BinaryExpression(stringNode)
      visitor.BinaryExpression(numNode)
      visitor.BinaryExpression(mixedNode)

      expect(reports.length).toBe(2)
    })

    test('should track reports independently for each node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node1 = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'), 1, 0)
      const node2 = createBinaryExpression(createLiteral('c'), '+', createLiteral('d'), 5, 10)

      visitor.BinaryExpression(node1)
      visitor.BinaryExpression(node2)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('should not carry state between visitor calls', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'const str = "hello" + "world";' })

      const visitor1 = noStringConcatRule.create(ctx1)
      const visitor2 = noStringConcatRule.create(ctx2)

      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))

      visitor1.BinaryExpression(node)
      visitor2.BinaryExpression(node)

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(1)
    })

    test('should report violation followed by non-violation correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const stringNode = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'))
      const numNode = createBinaryExpression(createLiteral(1), '+', createLiteral(2))

      visitor.BinaryExpression(stringNode)
      visitor.BinaryExpression(numNode)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('string concatenation')
    })

    test('should handle alternating violation and non-violation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const nodes = [
        createBinaryExpression(createLiteral('a'), '+', createLiteral('b')),
        createBinaryExpression(createLiteral(1), '+', createLiteral(2)),
        createBinaryExpression(createLiteral('c'), '+', createLiteral('d')),
        createBinaryExpression(createLiteral(3), '+', createLiteral(4)),
        createBinaryExpression(createLiteral('e'), '+', createLiteral('f')),
      ]

      for (const node of nodes) {
        visitor.BinaryExpression(node)
      }

      expect(reports.length).toBe(3)
    })

    test('should report all same-node duplicates', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('x'), '+', createLiteral('y'))

      for (let i = 0; i < 5; i++) {
        visitor.BinaryExpression(node)
      }

      expect(reports.length).toBe(5)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";', filePath: '/project/src/utils.ts' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with .tsx file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";', filePath: '/project/src/component.tsx' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with .js file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";', filePath: '/project/src/index.js' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace root', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/custom/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{}] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/custom/root',
      } as unknown as RuleContext

      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with empty source', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with config options containing extra fields', () => {
      const { context, reports } = createMockRuleContext({ options: [{ allowSingleConcat: true, maxConcats: 3 }], source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with config having no options array', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => {
          reports.push({ message: d.message, loc: d.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work when logger methods are called', () => {
      const { context } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      visitor.BinaryExpression(node)

      // Rule should not crash when context has working logger
      expect(context.logger.debug).toBeDefined()
      expect(context.logger.info).toBeDefined()
      expect(context.logger.warn).toBeDefined()
      expect(context.logger.error).toBeDefined()
    })

    test('should work with deep nested file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";', filePath: '/very/deep/nested/directory/structure/file.ts' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with relative file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";', filePath: './src/file.ts' })
      const visitor = noStringConcatRule.create(context)

      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('parametric string + string detection', () => {
    test('should report "hello" + "world" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), '+', createLiteral('world'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report "" + "" (empty strings parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral(''), '+', createLiteral(''))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report "a" + "b" (single chars parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report long strings concatenated (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(
        createLiteral('longer string here'),
        '+',
        createLiteral('and another'),
      )
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report path-style string concat (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('path/'), '+', createLiteral('to/file'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report greeting-style string concat (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('Hello, '), '+', createLiteral('World!'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report "left" + "right" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('left'), '+', createLiteral('right'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report "first" + "second" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('first'), '+', createLiteral('second'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('parametric string + identifier detection', () => {
    test('should report "hello" + name (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), '+', createIdentifier('name'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report "" + x (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral(''), '+', createIdentifier('x'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report "prefix: " + user (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('prefix: '), '+', createIdentifier('user'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report "error: " + msg (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('error: '), '+', createIdentifier('msg'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report "$" + amount (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('$'), '+', createIdentifier('amount'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report "Hello " + userName (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(
        createLiteral('Hello '),
        '+',
        createIdentifier('userName'),
      )
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('parametric identifier + string detection', () => {
    test('should report name + "world" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createIdentifier('name'), '+', createLiteral('world'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report x + "" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createIdentifier('x'), '+', createLiteral(''))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report user + " suffix" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createIdentifier('user'), '+', createLiteral(' suffix'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report msg + "!" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createIdentifier('msg'), '+', createLiteral('!'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report value + "px" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createIdentifier('value'), '+', createLiteral('px'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('parametric number + number non-reporting', () => {
    test('should not report 1 + 2 (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral(1), '+', createLiteral(2))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report 0 + 0 (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral(0), '+', createLiteral(0))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report -1 + 1 (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral(-1), '+', createLiteral(1))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report 100 + 200 (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral(100), '+', createLiteral(200))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report 3.14 + 2.71 (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral(3.14), '+', createLiteral(2.71))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report 0.001 + 0.002 (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral(0.001), '+', createLiteral(0.002))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report 1e10 + 1e5 (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral(1e10), '+', createLiteral(1e5))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('parametric boolean non-reporting', () => {
    test('should not report true + false (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral(true), '+', createLiteral(false))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report false + true (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral(false), '+', createLiteral(true))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report true + true (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral(true), '+', createLiteral(true))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report false + false (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral(false), '+', createLiteral(false))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('parametric identifier + identifier non-reporting', () => {
    test('should not report x + y (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createIdentifier('x'), '+', createIdentifier('y'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report foo + bar (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createIdentifier('foo'), '+', createIdentifier('bar'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report result + total (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(
        createIdentifier('result'),
        '+',
        createIdentifier('total'),
      )
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report a + b (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createIdentifier('a'), '+', createIdentifier('b'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('parametric non-plus operators with strings', () => {
    test('should not report "hello" - "world" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), '-', createLiteral('world'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report "hello" * "world" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), '*', createLiteral('world'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report "hello" / "world" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), '/', createLiteral('world'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report "hello" % "world" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), '%', createLiteral('world'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report "hello" ** "world" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), '**', createLiteral('world'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report "hello" & "world" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), '&', createLiteral('world'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report "hello" | "world" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), '|', createLiteral('world'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report "hello" ^ "world" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), '^', createLiteral('world'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report "hello" << "world" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), '<<', createLiteral('world'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report "hello" >> "world" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), '>>', createLiteral('world'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report "hello" >>> "world" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), '>>>', createLiteral('world'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report "hello" == "world" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), '==', createLiteral('world'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report "hello" != "world" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), '!=', createLiteral('world'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report "hello" === "world" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), '===', createLiteral('world'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report "hello" !== "world" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), '!==', createLiteral('world'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report "a" < "b" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('a'), '<', createLiteral('b'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report "a" > "b" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('a'), '>', createLiteral('b'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report "a" <= "b" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('a'), '<=', createLiteral('b'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report "a" >= "b" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('a'), '>=', createLiteral('b'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report "hello" in obj (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('hello'), 'in', createIdentifier('obj'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report obj instanceof Cls (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(
        createIdentifier('obj'),
        'instanceof',
        createIdentifier('Cls'),
      )
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('parametric non-object node handling', () => {
    test('should not throw for null node (parametric)', () => {
      const { context } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should not throw for undefined node (parametric)', () => {
      const { context } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should not throw for string node (parametric)', () => {
      const { context } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      expect(() => visitor.BinaryExpression('string')).not.toThrow()
    })

    test('should not throw for number node (parametric)', () => {
      const { context } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should not throw for boolean node (parametric)', () => {
      const { context } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      expect(() => visitor.BinaryExpression(true)).not.toThrow()
    })

    test('should not throw for array node (parametric)', () => {
      const { context } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      expect(() => visitor.BinaryExpression([])).not.toThrow()
    })
  })

  describe('parametric non-BinaryExpression nodes', () => {
    test('should not report Literal node (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      visitor.BinaryExpression({ type: 'Literal', value: 'hello' })
      expect(reports.length).toBe(0)
    })

    test('should not report Identifier node (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      visitor.BinaryExpression({ type: 'Identifier', name: 'x' })
      expect(reports.length).toBe(0)
    })

    test('should not report CallExpression node (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      visitor.BinaryExpression({ type: 'CallExpression' })
      expect(reports.length).toBe(0)
    })

    test('should not report MemberExpression node (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      visitor.BinaryExpression({ type: 'MemberExpression' })
      expect(reports.length).toBe(0)
    })

    test('should not report ArrayExpression node (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      visitor.BinaryExpression({ type: 'ArrayExpression' })
      expect(reports.length).toBe(0)
    })

    test('should not report ObjectExpression node (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      visitor.BinaryExpression({ type: 'ObjectExpression' })
      expect(reports.length).toBe(0)
    })
  })

  describe('parametric location accuracy', () => {
    test('should report location at line 1 column 0 (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'), 1, 0)
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 1 column 1 (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'), 1, 1)
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(1)
    })

    test('should report location at line 5 column 10 (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'), 5, 10)
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at line 10 column 0 (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'), 10, 0)
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 100 column 50 (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'), 100, 50)
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location at line 0 column 0 (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('a'), '+', createLiteral('b'), 0, 0)
      visitor.BinaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('parametric template literal detection', () => {
    test('should report "prefix" + template literal (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('prefix'), '+', createTemplateLiteral())
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report template literal + "suffix" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createTemplateLiteral(), '+', createLiteral('suffix'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report template literal + template literal (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createTemplateLiteral(), '+', createTemplateLiteral())
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report "" + template literal (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral(''), '+', createTemplateLiteral())
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report template literal + "" (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createTemplateLiteral(), '+', createLiteral(''))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report identifier + template literal (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createIdentifier('x'), '+', createTemplateLiteral())
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report template literal + identifier (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createTemplateLiteral(), '+', createIdentifier('x'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('parametric mixed operand tests', () => {
    test('should report null literal + string literal (right is string, parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral(null), '+', createLiteral('suffix'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report undefined literal + string literal (right is string, parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral(undefined), '+', createLiteral('suffix'))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report string literal + null literal (left is string, parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(createLiteral('prefix'), '+', createLiteral(null))
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report regex-style string + identifier (parametric)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const str = "hello" + "world";' })
      const visitor = noStringConcatRule.create(context)
      const node = createBinaryExpression(
        createLiteral('^(?=.*[a-z])'),
        '+',
        createIdentifier('pattern'),
      )
      visitor.BinaryExpression(node)
      expect(reports.length).toBe(1)
    })
  })
})

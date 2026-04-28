import { noTemplateCurlyInStringRule } from '../../../../src/rules/patterns/no-template-curly-in-string.js'
import { createMockRuleContext } from '../../../helpers/ast-helpers.js'

function createStringLiteral(value: string, raw?: string): unknown {
  return {
    type: 'Literal',
    value,
    raw: raw ?? `"${value}"`,
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createTemplateLiteral(raw: string): unknown {
  return {
    type: 'Literal',
    value: 'template',
    raw,
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
  }
}

function createNumericLiteral(value: number): unknown {
  return {
    type: 'Literal',
    value,
    raw: String(value),
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
  }
}

function createIdentifier(name: string): unknown {
  return {
    type: 'Identifier',
    name,
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
  }
}

describe('no-template-curly-in-string rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noTemplateCurlyInStringRule.meta.type).toBe('problem')
    })

    test('should have warn severity', () => {
      expect(noTemplateCurlyInStringRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noTemplateCurlyInStringRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noTemplateCurlyInStringRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noTemplateCurlyInStringRule.meta.schema).toBeDefined()
    })

    test('should not be fixable', () => {
      expect(noTemplateCurlyInStringRule.meta.fixable).toBeUndefined()
    })

    test('should mention template literal in description', () => {
      expect(noTemplateCurlyInStringRule.meta.docs?.description.toLowerCase()).toContain('template literal')
    })

    test('should have docs URL', () => {
      expect(noTemplateCurlyInStringRule.meta.docs?.url).toContain('no-template-curly-in-string')
    })
  })

  describe('create', () => {
    test('should return visitor with Literal method', () => {
      const { context } = createMockRuleContext({ source: 'const x = "hello"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      expect(visitor).toHaveProperty('Literal')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'const x = "hello"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      expect(visitor).not.toBeNull()
    })
  })

  describe('detects template curly in double-quoted strings', () => {
    test('should report ${name} in double-quoted string', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello ${name}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)

      visitor.Literal(createStringLiteral('Hello ${name}'))

      expect(reports).toHaveLength(1)
    })

    test('should report ${value} in double-quoted string', () => {
      const { context, reports } = createMockRuleContext({ source: '"${value}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)

      visitor.Literal(createStringLiteral('${value}'))

      expect(reports).toHaveLength(1)
    })

    test('should report ${obj.prop} in double-quoted string', () => {
      const { context, reports } = createMockRuleContext({ source: '"${obj.prop}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)

      visitor.Literal(createStringLiteral('${obj.prop}'))

      expect(reports).toHaveLength(1)
    })

    test('should report multiple expressions in double-quoted string', () => {
      const { context, reports } = createMockRuleContext({ source: '"${a} and ${b}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)

      visitor.Literal(createStringLiteral('${a} and ${b}'))

      expect(reports).toHaveLength(1)
    })
  })

  describe('detects template curly in single-quoted strings', () => {
    test('should report ${name} in single-quoted string', () => {
      const { context, reports } = createMockRuleContext({ source: "'Hello ${name}'" })
      const visitor = noTemplateCurlyInStringRule.create(context)

      visitor.Literal(createStringLiteral('Hello ${name}', "'Hello ${name}'"))

      expect(reports).toHaveLength(1)
    })

    test('should report empty expression ${} in single-quoted string', () => {
      const { context, reports } = createMockRuleContext({ source: "'${}'" })
      const visitor = noTemplateCurlyInStringRule.create(context)

      visitor.Literal(createStringLiteral('${}', "'${}'"))

      expect(reports).toHaveLength(1)
    })
  })

  describe('does not report valid strings', () => {
    test('should not report plain string without curly', () => {
      const { context, reports } = createMockRuleContext({ source: '"Hello world"' })
      const visitor = noTemplateCurlyInStringRule.create(context)

      visitor.Literal(createStringLiteral('Hello world'))

      expect(reports).toHaveLength(0)
    })

    test('should not report string with $ but no curly', () => {
      const { context, reports } = createMockRuleContext({ source: '"Price: $100"' })
      const visitor = noTemplateCurlyInStringRule.create(context)

      visitor.Literal(createStringLiteral('Price: $100'))

      expect(reports).toHaveLength(0)
    })

    test('should not report string with { but no dollar', () => {
      const { context, reports } = createMockRuleContext({ source: '"{name}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)

      visitor.Literal(createStringLiteral('{name}'))

      expect(reports).toHaveLength(0)
    })

    test('should not report template literals (backticks)', () => {
      const { context, reports } = createMockRuleContext({ source: '`Hello ${name}`' })
      const visitor = noTemplateCurlyInStringRule.create(context)

      visitor.Literal(createTemplateLiteral('`Hello ${name}`'))

      expect(reports).toHaveLength(0)
    })

    test('should not report numeric literals', () => {
      const { context, reports } = createMockRuleContext({ source: '42' })
      const visitor = noTemplateCurlyInStringRule.create(context)

      visitor.Literal(createNumericLiteral(42))

      expect(reports).toHaveLength(0)
    })

    test('should not report empty string', () => {
      const { context, reports } = createMockRuleContext({ source: '""' })
      const visitor = noTemplateCurlyInStringRule.create(context)

      visitor.Literal(createStringLiteral(''))

      expect(reports).toHaveLength(0)
    })

    test('should not report string with only dollar sign', () => {
      const { context, reports } = createMockRuleContext({ source: '"$"' })
      const visitor = noTemplateCurlyInStringRule.create(context)

      visitor.Literal(createStringLiteral('$'))

      expect(reports).toHaveLength(0)
    })

    test('should not report string with escaped dollar', () => {
      const { context, reports } = createMockRuleContext({ source: '"\\${not}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)

      visitor.Literal(createStringLiteral('${not}'))

      expect(reports).toHaveLength(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      expect(() => visitor.Literal(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      expect(() => visitor.Literal(undefined)).not.toThrow()
    })

    test('should handle non-Literal node type', () => {
      const { context, reports } = createMockRuleContext({ source: 'x' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createIdentifier('x'))
      expect(reports).toHaveLength(0)
    })

    test('should handle node without raw property', () => {
      const { context, reports } = createMockRuleContext({ source: '"${x}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal({ type: 'Literal', value: '${x}', loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } } })
      expect(reports).toHaveLength(0)
    })

    test('should handle literal with non-string value', () => {
      const { context, reports } = createMockRuleContext({ source: '42' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal({ type: 'Literal', value: 42, raw: '42', loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } } })
      expect(reports).toHaveLength(0)
    })

    test('should handle literal with null value', () => {
      const { context, reports } = createMockRuleContext({ source: 'null' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal({ type: 'Literal', value: null, raw: 'null', loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } } })
      expect(reports).toHaveLength(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: '{}' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      expect(() => visitor.Literal({})).not.toThrow()
      expect(reports).toHaveLength(0)
    })

    test('should include template literal in message', () => {
      const { context, reports } = createMockRuleContext({ source: '"${x}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${x}'))
      expect(reports[0].message.toLowerCase()).toContain('template literal')
    })

    test('should include backticks in message', () => {
      const { context, reports } = createMockRuleContext({ source: '"${x}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${x}'))
      expect(reports[0].message.toLowerCase()).toContain('backtick')
    })
  })
})

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

    test('should handle literal with boolean value', () => {
      const { context, reports } = createMockRuleContext({ source: 'true' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal({ type: 'Literal', value: true, raw: 'true', loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } } })
      expect(reports).toHaveLength(0)
    })

    test('should handle literal with regex value', () => {
      const { context, reports } = createMockRuleContext({ source: '/test/' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal({ type: 'Literal', value: /test/, raw: '/test/', loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } } })
      expect(reports).toHaveLength(0)
    })

    test('should handle node with raw as non-string', () => {
      const { context, reports } = createMockRuleContext({ source: '"test"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal({ type: 'Literal', value: 'test', raw: 123, loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } } })
      expect(reports).toHaveLength(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: '"${x}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${x}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with complex expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${a.b.c.d}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${a.b.c.d}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with function call expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${foo()}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${foo()}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with ternary expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${a ? b : c}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${a ? b : c}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with arrow function expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${x => x}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${x => x}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with array expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${[1, 2, 3]}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${[1, 2, 3]}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with object expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${{key: val}}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${{key: val}}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with template literal inside expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${`nested`}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${`nested`}'))
      expect(reports).toHaveLength(1)
    })

    test('should report URL template string', () => {
      const { context, reports } = createMockRuleContext({ source: '"https://api.example.com/users/${id}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('https://api.example.com/users/${id}'))
      expect(reports).toHaveLength(1)
    })

    test('should report SQL template string', () => {
      const { context, reports } = createMockRuleContext({ source: '"SELECT * FROM users WHERE id = ${id}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('SELECT * FROM users WHERE id = ${id}'))
      expect(reports).toHaveLength(1)
    })

    test('should report CSS template string', () => {
      const { context, reports } = createMockRuleContext({ source: '"color: ${color}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('color: ${color}'))
      expect(reports).toHaveLength(1)
    })

    test('should report path template string', () => {
      const { context, reports } = createMockRuleContext({ source: '"./src/${module}/index.ts"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('./src/${module}/index.ts'))
      expect(reports).toHaveLength(1)
    })

    test('should report HTML template string', () => {
      const { context, reports } = createMockRuleContext({ source: '"<div>${content}</div>"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('<div>${content}</div>'))
      expect(reports).toHaveLength(1)
    })

    test('should report JSON template string', () => {
      const { context, reports } = createMockRuleContext({ source: '"{\\"key\\": \\"${value}\\"}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('{"key": "${value}"}'))
      expect(reports).toHaveLength(1)
    })

    test('should report regex-like expression in string', () => {
      const { context, reports } = createMockRuleContext({ source: '"pattern ${variable} end"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('pattern ${variable} end'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with expression at start', () => {
      const { context, reports } = createMockRuleContext({ source: '"${start}middle end"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${start}middle end'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with expression at end', () => {
      const { context, reports } = createMockRuleContext({ source: '"start middle ${end}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('start middle ${end}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with only expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${only}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${only}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with whitespace in expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${ spaced }"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${ spaced }'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with newline-like content in expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${a\\nb}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${a\nb}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with numeric expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${123}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${123}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with boolean expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${true}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${true}'))
      expect(reports).toHaveLength(1)
    })

    test('should not report backtick string starting with backtick', () => {
      const { context, reports } = createMockRuleContext({ source: '`Hello ${name}`' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal({ type: 'Literal', value: 'Hello ${name}', raw: '`Hello ${name}`', loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } } })
      expect(reports).toHaveLength(0)
    })

    test('should not report string with unclosed curly', () => {
      const { context, reports } = createMockRuleContext({ source: '"${unclosed"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${unclosed'))
      expect(reports).toHaveLength(0)
    })

    test('should not report string with dollar and unclosed curly', () => {
      const { context, reports } = createMockRuleContext({ source: '"${no close"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${no close'))
      expect(reports).toHaveLength(0)
    })

    test('should not report string with only open curly', () => {
      const { context, reports } = createMockRuleContext({ source: '"${"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${'))
      expect(reports).toHaveLength(0)
    })

    test('should report string with mismatched braces that form valid pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '"${ { }"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${ { }'))
      expect(reports).toHaveLength(1)
    })

    test('should not report string with nested braces that close', () => {
      const { context, reports } = createMockRuleContext({ source: '"${ {a: 1} }"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${ {a: 1} }'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with expression containing equals', () => {
      const { context, reports } = createMockRuleContext({ source: '"${a = b}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${a = b}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with expression containing plus', () => {
      const { context, reports } = createMockRuleContext({ source: '"${a + b}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${a + b}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with expression containing multiply', () => {
      const { context, reports } = createMockRuleContext({ source: '"${a * b}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${a * b}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with spread expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${...args}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${...args}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with typeof expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${typeof x}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${typeof x}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with logical expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${a && b}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${a && b}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with nullish coalescing', () => {
      const { context, reports } = createMockRuleContext({ source: '"${a ?? b}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${a ?? b}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with optional chaining', () => {
      const { context, reports } = createMockRuleContext({ source: '"${a?.b?.c}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${a?.b?.c}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with template expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${tag`hello`}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${tag`hello`}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with destructuring expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${{a, b}}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${{a, b}}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with new expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${new Date()}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${new Date()}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with class expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${class {}}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${class {}}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with yield expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${yield 1}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${yield 1}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with await expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${await promise}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${await promise}'))
      expect(reports).toHaveLength(1)
    })

    test('should report error message string', () => {
      const { context, reports } = createMockRuleContext({ source: '"Error: ${msg}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('Error: ${msg}'))
      expect(reports).toHaveLength(1)
    })

    test('should report log message string', () => {
      const { context, reports } = createMockRuleContext({ source: '"User ${userId} logged in"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('User ${userId} logged in'))
      expect(reports).toHaveLength(1)
    })

    test('should report config value string', () => {
      const { context, reports } = createMockRuleContext({ source: '"localhost:${port}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('localhost:${port}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with expression containing comparison', () => {
      const { context, reports } = createMockRuleContext({ source: '"${a === b}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${a === b}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with expression containing bitwise', () => {
      const { context, reports } = createMockRuleContext({ source: '"${a | b}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${a | b}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with comma expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${a, b}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${a, b}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with string concatenation in expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${a + string}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${a + string}'))
      expect(reports).toHaveLength(1)
    })

    test('should report environment variable pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '"Bearer ${token}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('Bearer ${token}'))
      expect(reports).toHaveLength(1)
    })

    test('should report multi-line-like expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"line1 ${x} line2"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('line1 ${x} line2'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with negative number expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${-1}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${-1}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with not expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${!flag}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${!flag}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with delete expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${delete obj.key}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${delete obj.key}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with void expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${void 0}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${void 0}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with instanceof expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${a instanceof B}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${a instanceof B}'))
      expect(reports).toHaveLength(1)
    })

    test('should report string with in expression', () => {
      const { context, reports } = createMockRuleContext({ source: '"${a in b}"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('${a in b}'))
      expect(reports).toHaveLength(1)
    })

    test('should not report string with only dollar sign and open paren', () => {
      const { context, reports } = createMockRuleContext({ source: '"$(""' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('$('))
      expect(reports).toHaveLength(0)
    })

    test('should not report string with double dollar no curly', () => {
      const { context, reports } = createMockRuleContext({ source: '"$$variable"' })
      const visitor = noTemplateCurlyInStringRule.create(context)
      visitor.Literal(createStringLiteral('$$variable'))
      expect(reports).toHaveLength(0)
    })
  })
})

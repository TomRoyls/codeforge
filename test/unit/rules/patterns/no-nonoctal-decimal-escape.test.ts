import { describe, test, expect, vi } from 'vitest'
import { noNonoctalDecimalEscapeRule } from '../../../../src/rules/patterns/no-nonoctal-decimal-escape.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createLiteral(value: unknown, raw: string, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    raw,
    loc: {
      start: { line, column },
      end: { line, column: raw.length },
    },
  }
}

function createNonLiteralNode(line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name: 'x',
    loc: {
      start: { line, column },
      end: { line, column: column + 1 },
    },
  }
}

describe('no-nonoctal-decimal-escape rule', () => {
  describe('meta', () => {
    test('should have meta property', () => {
      expect(noNonoctalDecimalEscapeRule).toHaveProperty('meta')
    })

    test('should have problem type', () => {
      expect(noNonoctalDecimalEscapeRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noNonoctalDecimalEscapeRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noNonoctalDecimalEscapeRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noNonoctalDecimalEscapeRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention escape sequences in description', () => {
      expect(noNonoctalDecimalEscapeRule.meta.docs?.description.toLowerCase()).toContain('escape')
    })

    test('should mention \\8 in description', () => {
      expect(noNonoctalDecimalEscapeRule.meta.docs?.description).toContain('\\8')
    })

    test('should mention \\9 in description', () => {
      expect(noNonoctalDecimalEscapeRule.meta.docs?.description).toContain('\\9')
    })

    test('should have non-empty description', () => {
      expect(noNonoctalDecimalEscapeRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have description as string type', () => {
      expect(typeof noNonoctalDecimalEscapeRule.meta.docs?.description).toBe('string')
    })

    test('should have docs property', () => {
      expect(noNonoctalDecimalEscapeRule.meta).toHaveProperty('docs')
    })

    test('should have schema as empty array', () => {
      expect(noNonoctalDecimalEscapeRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noNonoctalDecimalEscapeRule.meta.fixable).toBeUndefined()
    })

    test('should not be deprecated', () => {
      expect(noNonoctalDecimalEscapeRule.meta.deprecated).toBeUndefined()
    })

    test('meta.type should be a valid RuleType', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noNonoctalDecimalEscapeRule.meta.type)
    })

    test('docs.recommended should be true boolean', () => {
      expect(noNonoctalDecimalEscapeRule.meta.docs?.recommended).toBe(true)
      expect(typeof noNonoctalDecimalEscapeRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should not have replacedBy', () => {
      expect(noNonoctalDecimalEscapeRule.meta.replacedBy).toBeUndefined()
    })

    test('docs.description should start with uppercase letter', () => {
      const desc = noNonoctalDecimalEscapeRule.meta.docs?.description ?? ''
      expect(desc[0]).toBe(desc[0].toUpperCase())
    })
  })

  describe('create', () => {
    test('should return visitor with Literal method', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      expect(visitor).toHaveProperty('Literal')
    })

    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('visitor should have Literal key', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      expect(Object.keys(visitor)).toContain('Literal')
    })

    test('Literal should be a function', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      expect(typeof visitor.Literal).toBe('function')
    })

    test('create called multiple times returns new visitor objects', () => {
      const { context: ctx1 } = createMockRuleContext({ source: 'const x = "test"' })
      const { context: ctx2 } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor1 = noNonoctalDecimalEscapeRule.create(ctx1)
      const visitor2 = noNonoctalDecimalEscapeRule.create(ctx2)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should not have TemplateLiteral visitor', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      expect(visitor).not.toHaveProperty('TemplateLiteral')
    })

    test('should not throw with valid context', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test"' })

      expect(() => noNonoctalDecimalEscapeRule.create(context)).not.toThrow()
    })

    test('visitor Literal should accept a single argument', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      expect(visitor.Literal.length).toBe(1)
    })

    test('should not have Program visitor', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      expect(visitor).not.toHaveProperty('Program')
    })

    test('should not have ExpressionStatement visitor', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      expect(visitor).not.toHaveProperty('ExpressionStatement')
    })
  })

  describe('detecting \\8 escape sequences', () => {
    test('should report string with \\8 escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\8', '"test\\8"', 1, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\8')
      expect(reports[0].message).toContain('escape')
    })

    test('should report string with multiple \\8 escapes', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8\\8\\8', '"\\8\\8\\8"', 1, 10))

      expect(reports.length).toBe(1)
    })

    test('should report string with \\8 at start', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8test', '"\\8test"', 1, 10))

      expect(reports.length).toBe(1)
    })

    test('should report string with \\8 at end', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\8', '"test\\8"', 1, 10))

      expect(reports.length).toBe(1)
    })

    test('should report string with \\8 in middle of text', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('foo\\8bar', '"foo\\8bar"', 1, 10))

      expect(reports.length).toBe(1)
    })

    test('should report string containing only \\8', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8', '"\\8"', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report \\8 preceded by valid escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\n\\8', '"\\n\\8"', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report \\8 followed by valid escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8\\n', '"\\8\\n"', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report \\8 with surrounding spaces', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral(' \\8 ', '" \\8 "', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report \\8 in long string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(
        createLiteral('abcdefghijklmnopqrstuvwxyz\\8', '"abcdefghijklmnopqrstuvwxyz\\8"', 1, 0),
      )

      expect(reports.length).toBe(1)
    })

    test('should report \\8 with Unicode content before', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\u0041\\8', '"\\u0041\\8"', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report \\8 with hex escape before', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\x41\\8', '"\\x41\\8"', 1, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting \\9 escape sequences', () => {
    test('should report string with \\9 escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\9', '"test\\9"', 1, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\9')
      expect(reports[0].message).toContain('escape')
    })

    test('should report string with multiple \\9 escapes', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\9\\9\\9', '"\\9\\9\\9"', 1, 10))

      expect(reports.length).toBe(1)
    })

    test('should report string with \\9 at start', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\9test', '"\\9test"', 1, 10))

      expect(reports.length).toBe(1)
    })

    test('should report string with \\9 at end', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\9', '"test\\9"', 1, 10))

      expect(reports.length).toBe(1)
    })

    test('should report string with \\9 in middle of text', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('foo\\9bar', '"foo\\9bar"', 1, 10))

      expect(reports.length).toBe(1)
    })

    test('should report string containing only \\9', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\9', '"\\9"', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report \\9 preceded by valid escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\n\\9', '"\\n\\9"', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report \\9 followed by valid escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\9\\n', '"\\9\\n"', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report \\9 with surrounding spaces', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral(' \\9 ', '" \\9 "', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report \\9 in long string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(
        createLiteral('abcdefghijklmnopqrstuvwxyz\\9', '"abcdefghijklmnopqrstuvwxyz\\9"', 1, 0),
      )

      expect(reports.length).toBe(1)
    })

    test('should report \\9 with Unicode content before', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\u0041\\9', '"\\u0041\\9"', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report \\9 with hex escape before', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\x41\\9', '"\\x41\\9"', 1, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting mixed \\8 and \\9 escapes', () => {
    test('should report string with both \\8 and \\9', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8\\9', '"\\8\\9"', 1, 10))

      expect(reports.length).toBe(1)
    })

    test('should report string with alternating \\8 and \\9', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8\\9\\8\\9', '"\\8\\9\\8\\9"', 1, 10))

      expect(reports.length).toBe(1)
    })

    test('should report \\8 followed by \\9', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('a\\8b\\9c', '"a\\8b\\9c"', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report \\9 followed by \\8', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('a\\9b\\8c', '"a\\9b\\8c"', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report string with \\8\\9\\8 pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8\\9\\8', '"\\8\\9\\8"', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should report string with many mixed escapes', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8\\9\\8\\9\\8\\9\\8\\9', '"\\8\\9\\8\\9\\8\\9\\8\\9"', 1, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('valid escape sequences (should not report)', () => {
    test('should not report string with \\n escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\n', '"test\\n"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\t escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\t', '"test\\t"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\r escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\r', '"test\\r"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\b escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\b', '"test\\b"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\f escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\f', '"test\\f"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with single quote escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral("test'", '"test\\\'"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with double quote escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test"', '"test\\""', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\" escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\"', '"test\\""', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\\\ escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\\\', '"test\\\\"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\0 escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\0', '"test\\0"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\1 escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\1', '"test\\1"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\7 escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\7', '"test\\7"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\u escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\u0041', '"test\\u0041"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\x escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\x41', '"test\\x41"', 1, 10))

      expect(reports.length).toBe(0)
    })
  })

  describe('valid octal escape sequences (test.each)', () => {
    test.each([
      ['\\0', '"\\0"'],
      ['\\1', '"\\1"'],
      ['\\2', '"\\2"'],
      ['\\3', '"\\3"'],
      ['\\4', '"\\4"'],
      ['\\5', '"\\5"'],
      ['\\6', '"\\6"'],
      ['\\7', '"\\7"'],
    ] as const)('should not report octal escape %s', (_name, raw) => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test', raw, 1, 0))

      expect(reports.length).toBe(0)
    })
  })

  describe('valid non-octal escapes (test.each)', () => {
    test.each([
      ['newline \\n', '"test\\n"'],
      ['tab \\t', '"test\\t"'],
      ['carriage return \\r', '"test\\r"'],
      ['backspace \\b', '"test\\b"'],
      ['form feed \\f', '"test\\f"'],
      ['backslash \\\\', '"test\\\\"'],
      ["single quote \\'", '"test\\\'"'],
      ['double quote \\"', '"test\\""'],
      ['unicode \\u0041', '"test\\u0041"'],
      ['hex \\x41', '"test\\x41"'],
      ['unicode brace \\u{0041}', '"test\\u{0041}"'],
      ['vertical tab \\v', '"test\\v"'],
      ['null \\0', '"test\\0"'],
      ['line feed \\n in middle', '"te\\nst"'],
      ['mixed valid escapes', '"\\n\\t\\r"'],
    ] as const)('should not report %s escape', (_name, raw) => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test', raw, 1, 0))

      expect(reports.length).toBe(0)
    })
  })

  describe('safe strings with no escapes (test.each)', () => {
    test.each([
      ['empty string', '""', ''],
      ['single character', '"a"', 'a'],
      ['plain text', '"hello world"', 'hello world'],
      ['numbers', '"12345"', '12345'],
      ['special chars', '"!@#$%^&*()"', '!@#$%^&*()'],
      ['spaces only', '"   "', '   '],
      ['camelCase', '"myVariableName"', 'myVariableName'],
      ['snake_case', '"my_variable_name"', 'my_variable_name'],
      ['kebab-case', '"my-variable-name"', 'my-variable-name'],
      ['dot notation', '"obj.prop.nested"', 'obj.prop.nested'],
      ['path', '"/usr/local/bin"', '/usr/local/bin'],
      ['url', '"https://example.com"', 'https://example.com'],
      ['email', '"user@example.com"', 'user@example.com'],
      ['json-like', '"key: value"', 'key: value'],
      ['html tag', '"<div>content</div>"', '<div>content</div>'],
      ['single char a', '"a"', 'a'],
      ['single char z', '"z"', 'z'],
      ['single digit', '"5"', '5'],
      ['parentheses', '"(test)"', '(test)'],
      ['brackets', '"[test]"', '[test]'],
    ] as const)('should not report safe string: %s', (_name, raw, value) => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral(value, raw, 1, 0))

      expect(reports.length).toBe(0)
    })
  })

  describe('non-string literals', () => {
    test('should not report number literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral(123, '123', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report boolean literal true', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral(true, 'true', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report boolean literal false', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral(false, 'false', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report null literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral(null, 'null', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report regular expression literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral(/test/, '/test/', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report integer 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral(0, '0', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report negative number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral(-42, '-42', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report float number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral(3.14, '3.14', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should not report node with object value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      const node = {
        type: 'Literal',
        value: { key: 'val' },
        raw: '42',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should not report node with array value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      const node = {
        type: 'Literal',
        value: [1, 2, 3],
        raw: '42',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('non-matching literals (test.each)', () => {
    test.each([
      ['number 0', 0, '0'],
      ['number 1', 1, '1'],
      ['number -1', -1, '-1'],
      ['number 99', 99, '99'],
      ['number 3.14', 3.14, '3.14'],
      ['boolean true', true, 'true'],
      ['boolean false', false, 'false'],
      ['null', null, 'null'],
      ['regex /abc/', /abc/, '/abc/'],
      ['regex /test/i', /test/i, '/test/i'],
      ['regex with digits /\\d/', /\d/, '/\\d/'],
      ['number 8 (matching digit but not string)', 8, '8'],
      ['number 9 (matching digit but not string)', 9, '9'],
      ['number 89', 89, '89'],
      ['number 98', 98, '98'],
    ] as const)('should not report %s literal', (_name, value, raw) => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral(value, String(raw), 1, 0))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      expect(() => visitor.Literal(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      expect(() => visitor.Literal(undefined)).not.toThrow()
    })

    test('should handle non-Literal node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createNonLiteralNode())

      expect(reports.length).toBe(0)
    })

    test('should handle empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('', '""', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should handle node with only type property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      const node = { type: 'Literal' }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty raw', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('', '', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle node with loc but no start', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      const node = {
        type: 'Literal',
        value: 'test\\8',
        raw: '"test\\8"',
        loc: {},
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with loc but no end', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      const node = {
        type: 'Literal',
        value: 'test\\8',
        raw: '"test\\8"',
        loc: { start: { line: 1, column: 0 } },
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial start (missing column)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      const node = {
        type: 'Literal',
        value: 'test\\8',
        raw: '"test\\8"',
        loc: { start: { line: 1 }, end: { line: 1, column: 7 } },
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial end (missing line)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      const node = {
        type: 'Literal',
        value: 'test\\8',
        raw: '"test\\8"',
        loc: { start: { line: 1, column: 0 }, end: { column: 7 } },
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node where value is string but raw has no escapes', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test value', '"test value"', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      const node = {
        type: 'Literal',
        value: 'test\\8',
        raw: '"test\\8"',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
        extra: 'some data',
        parent: {},
        range: [0, 7],
      }

      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should handle template literal type', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      const node = {
        type: 'TemplateLiteral',
        value: 'test\\8',
        raw: '"test\\8"',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with whitespace-only raw', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('   ', '"   "', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle node with very long raw string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      const longContent = 'a'.repeat(10000) + '\\8'
      visitor.Literal(createLiteral(longContent, '"' + longContent + '"', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should handle node with numeric string value but valid raw', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('12345', '"12345"', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle node with raw containing only quotes', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('', '""', 1, 0))

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      const node = {
        type: 'Literal',
        value: 'test\\8',
        raw: '"test\\8"',
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with string raw but non-string value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      const node = {
        type: 'Literal',
        value: 42,
        raw: '"test\\8"',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with string value but non-string raw', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      const node = {
        type: 'Literal',
        value: 'test\\8',
        raw: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct location at line 1 col 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\8', '"test\\8"', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\8', '"test\\8"', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      const raw = '"test\\8"'
      visitor.Literal(createLiteral('test\\8', raw, 1, 0))

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(raw.length)
    })

    test('should report correct location at high line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8', '"\\8"', 500, 100))

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(100)
    })

    test('should report location at col 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8', '"\\8"', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default location when loc is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      const node = {
        type: 'Literal',
        value: 'test\\8',
        raw: '"test\\8"',
      }

      visitor.Literal(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should use default location when loc.start is missing column', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      const node = {
        type: 'Literal',
        value: 'test\\8',
        raw: '"test\\8"',
        loc: { start: {}, end: { line: 1, column: 7 } },
      }

      visitor.Literal(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle location at different positions in file', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\9', '"\\9"', 42, 17))

      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(17)
    })

    test('should report both start and end loc for \\8', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\8', '"test\\8"', 3, 4))

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report correct end column', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      const raw = '"\\8"'
      visitor.Literal(createLiteral('\\8', raw, 1, 0))

      expect(reports[0].loc?.end.column).toBe(raw.length)
    })
  })

  describe('message content', () => {
    test('should have exact message for \\8 escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\8', '"test\\8"', 1, 0))

      expect(reports[0].message).toBe("Invalid escape sequence '\\8' or '\\9' in string literal.")
    })

    test('should have exact message for \\9 escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\9', '"test\\9"', 1, 0))

      expect(reports[0].message).toBe("Invalid escape sequence '\\8' or '\\9' in string literal.")
    })

    test('message should contain Invalid', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8', '"\\8"', 1, 0))

      expect(reports[0].message).toContain('Invalid')
    })

    test('message should contain escape sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8', '"\\8"', 1, 0))

      expect(reports[0].message).toContain('escape sequence')
    })

    test('message should contain string literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8', '"\\8"', 1, 0))

      expect(reports[0].message).toContain('string literal')
    })

    test('message should be identical for \\8 and \\9', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'const x = "test"' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor1 = noNonoctalDecimalEscapeRule.create(ctx1)
      const visitor2 = noNonoctalDecimalEscapeRule.create(ctx2)

      visitor1.Literal(createLiteral('\\8', '"\\8"', 1, 0))
      visitor2.Literal(createLiteral('\\9', '"\\9"', 1, 0))

      expect(reports1[0].message).toBe(reports2[0].message)
    })

    test('message should contain both \\8 and \\9', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8', '"\\8"', 1, 0))

      expect(reports[0].message).toContain('\\8')
      expect(reports[0].message).toContain('\\9')
    })

    test('message should end with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8', '"\\8"', 1, 0))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })
  })

  describe('multiple reports', () => {
    test('should report each string with \\8 separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('a\\8', '"a\\8"', 1, 0))
      visitor.Literal(createLiteral('b\\8', '"b\\8"', 2, 0))

      expect(reports.length).toBe(2)
    })

    test('should report three strings in sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8', '"\\8"', 1, 0))
      visitor.Literal(createLiteral('\\9', '"\\9"', 2, 0))
      visitor.Literal(createLiteral('\\8\\9', '"\\8\\9"', 3, 0))

      expect(reports.length).toBe(3)
    })

    test('should report same string twice when called twice', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      const node = createLiteral('\\8', '"\\8"', 1, 0)
      visitor.Literal(node)
      visitor.Literal(node)

      expect(reports.length).toBe(2)
    })

    test('should handle alternating valid and invalid', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8', '"\\8"', 1, 0))
      visitor.Literal(createLiteral('plain', '"plain"', 2, 0))
      visitor.Literal(createLiteral('\\9', '"\\9"', 3, 0))
      visitor.Literal(createLiteral('\\n', '"\\n"', 4, 0))
      visitor.Literal(createLiteral('\\8', '"\\8"', 5, 0))

      expect(reports.length).toBe(3)
    })

    test('should accumulate reports across many calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.Literal(createLiteral('\\8', '"\\8"', i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('fresh context should have no reports', () => {
      const { reports } = createMockRuleContext({ source: 'const x = "test"' })

      expect(reports.length).toBe(0)
    })

    test('should report strings with \\8 at different lines', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8', '"\\8"', 1, 0))
      visitor.Literal(createLiteral('\\8', '"\\8"', 5, 0))
      visitor.Literal(createLiteral('\\8', '"\\8"', 100, 0))

      expect(reports.length).toBe(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[2].loc?.start.line).toBe(100)
    })

    test('should track correct messages for each report', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8', '"\\8"', 1, 0))
      visitor.Literal(createLiteral('\\9', '"\\9"', 2, 0))

      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  describe('context variations', () => {
    test('should work with different file path', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/different/path.ts',
        getAST: () => null,
        getSource: () => 'const x = "test"',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = noNonoctalDecimalEscapeRule.create(context)
      visitor.Literal(createLiteral('\\8', '"\\8"', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with empty source code', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/empty.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noNonoctalDecimalEscapeRule.create(context)
      visitor.Literal(createLiteral('\\8', '"\\8"', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with multiline source code', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/multi.ts',
        getAST: () => null,
        getSource: () => 'line1\nline2\nline3',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noNonoctalDecimalEscapeRule.create(context)
      visitor.Literal(createLiteral('\\8', '"\\8"', 2, 5))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace root', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/home/user/project/file.ts',
        getAST: () => null,
        getSource: () => 'const x = "test"',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/home/user/project',
      } as unknown as RuleContext

      const visitor = noNonoctalDecimalEscapeRule.create(context)
      visitor.Literal(createLiteral('\\8', '"\\8"', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should work with config options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = "test"',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [{ strict: true }] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noNonoctalDecimalEscapeRule.create(context)
      visitor.Literal(createLiteral('\\8', '"\\8"', 1, 0))

      expect(reports.length).toBe(1)
    })

    test('should not use context.getFilePath during detection', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const getFilePathSpy = vi.spyOn(context, 'getFilePath')
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8', '"\\8"', 1, 0))

      expect(reports.length).toBe(1)
      expect(getFilePathSpy).not.toHaveBeenCalled()
    })

    test('should not use context.getSource during detection', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const getSourceSpy = vi.spyOn(context, 'getSource')
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8', '"\\8"', 1, 0))

      expect(reports.length).toBe(1)
      expect(getSourceSpy).not.toHaveBeenCalled()
    })

    test('should not use context logger during detection', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8', '"\\8"', 1, 0))

      expect(reports.length).toBe(1)
      expect(context.logger.debug).not.toHaveBeenCalled()
      expect(context.logger.info).not.toHaveBeenCalled()
      expect(context.logger.warn).not.toHaveBeenCalled()
      expect(context.logger.error).not.toHaveBeenCalled()
    })
  })

  describe('detection with various raw formats', () => {
    test.each([
      ['\\8 alone', '"\\8"'],
      ['\\8 with prefix', '"abc\\8"'],
      ['\\8 with suffix', '"\\8abc"'],
      ['\\8 surrounded', '"ab\\8cd"'],
      ['multiple \\8', '"\\8\\8\\8"'],
      ['\\8 with spaces', '" \\8 "'],
      ['\\8 at end of long', '"abcdefghij\\8"'],
    ] as const)('should detect %s', (_name, raw) => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test', raw, 1, 0))

      expect(reports.length).toBe(1)
    })
  })

  describe('detection with \\9 various raw formats', () => {
    test.each([
      ['\\9 alone', '"\\9"'],
      ['\\9 with prefix', '"abc\\9"'],
      ['\\9 with suffix', '"\\9abc"'],
      ['\\9 surrounded', '"ab\\9cd"'],
      ['multiple \\9', '"\\9\\9\\9"'],
      ['\\9 with spaces', '" \\9 "'],
      ['\\9 at end of long', '"abcdefghij\\9"'],
    ] as const)('should detect %s', (_name, raw) => {
      const { context, reports } = createMockRuleContext({ source: 'const x = "test"' })
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test', raw, 1, 0))

      expect(reports.length).toBe(1)
    })
  })
})

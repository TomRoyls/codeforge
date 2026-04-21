import { describe, test, expect } from 'vitest'
import { noUselessEscapeRule } from '../../../../src/rules/patterns/no-useless-escape.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createStringLiteral(raw: string, value: string, line = 1, column = 0): unknown {
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

function createRegexLiteral(pattern: string, raw: string, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value: new RegExp(pattern),
    regex: {
      pattern,
      flags: '',
    },
    raw,
    loc: {
      start: { line, column },
      end: { line, column: raw.length },
    },
  }
}

function createRegexLiteralWithFlags(
  pattern: string,
  flags: string,
  raw: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'Literal',
    value: new RegExp(pattern, flags),
    regex: {
      pattern,
      flags,
    },
    raw,
    loc: {
      start: { line, column },
      end: { line, column: raw.length },
    },
  }
}

function createNumberLiteral(value: number, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    raw: value.toString(),
    loc: {
      start: { line, column },
      end: { line, column: value.toString().length },
    },
  }
}

function createBooleanLiteral(value: boolean, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    raw: value.toString(),
    loc: {
      start: { line, column },
      end: { line, column: value.toString().length },
    },
  }
}

function createNullLiteral(line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value: null,
    raw: 'null',
    loc: {
      start: { line, column },
      end: { line, column: 4 },
    },
  }
}

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

describe('no-useless-escape rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUselessEscapeRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUselessEscapeRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUselessEscapeRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUselessEscapeRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention escape in description', () => {
      expect(noUselessEscapeRule.meta.docs?.description.toLowerCase()).toContain('escape')
    })

    test('should have empty schema', () => {
      expect(noUselessEscapeRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noUselessEscapeRule.meta.fixable).toBeUndefined()
    })

    test('should have a meta object', () => {
      expect(noUselessEscapeRule.meta).toBeDefined()
      expect(typeof noUselessEscapeRule.meta).toBe('object')
    })

    test('should have docs property', () => {
      expect(noUselessEscapeRule.meta.docs).toBeDefined()
      expect(typeof noUselessEscapeRule.meta.docs).toBe('object')
    })

    test('should have description in docs', () => {
      expect(noUselessEscapeRule.meta.docs?.description).toBeDefined()
      expect(typeof noUselessEscapeRule.meta.docs?.description).toBe('string')
    })

    test('should have a non-empty description', () => {
      expect(noUselessEscapeRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should mention unnecessary in description', () => {
      expect(noUselessEscapeRule.meta.docs?.description.toLowerCase()).toContain('unnecessary')
    })

    test('should have type as one of valid types', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noUselessEscapeRule.meta.type)
    })

    test('should have severity as one of valid severities', () => {
      expect(['off', 'warn', 'error']).toContain(noUselessEscapeRule.meta.severity)
    })

    test('should have recommended as boolean true', () => {
      expect(noUselessEscapeRule.meta.docs?.recommended).toBe(true)
    })

    test('should have category as a string', () => {
      expect(typeof noUselessEscapeRule.meta.docs?.category).toBe('string')
    })

    test('should not be deprecated', () => {
      expect(noUselessEscapeRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noUselessEscapeRule.meta.replacedBy).toBeUndefined()
    })

    test('should not have requiresTypeChecking', () => {
      expect(noUselessEscapeRule.meta.requiresTypeChecking).toBeUndefined()
    })

    test('should not have url in docs', () => {
      expect(noUselessEscapeRule.meta.docs?.url).toBeUndefined()
    })

    test('should have a create function', () => {
      expect(typeof noUselessEscapeRule.create).toBe('function')
    })
  })

  describe('create', () => {
    test('should return visitor with Literal method', () => {
      const { context } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      expect(visitor).toHaveProperty('Literal')
    })

    test('Literal should be a function', () => {
      const { context } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      expect(typeof visitor.Literal).toBe('function')
    })

    test('should return object with only Literal method', () => {
      const { context } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      const keys = Object.keys(visitor).sort()
      expect(keys).toEqual(['Literal'])
    })

    test('should return a new visitor object each time', () => {
      const { context } = createMockRuleContext({ source: "'hello\\'" })
      const visitor1 = noUselessEscapeRule.create(context)
      const visitor2 = noUselessEscapeRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context argument', () => {
      const { context } = createMockRuleContext({ source: "'hello\\'" })
      expect(() => noUselessEscapeRule.create(context)).not.toThrow()
    })

    test('Literal visitor should accept a node argument', () => {
      const { context } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      expect(() => visitor.Literal(createStringLiteral('hello', 'hello'))).not.toThrow()
    })

    test('should not call report for valid string literal', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\n', '\n'))
      expect(reports.length).toBe(0)
    })

    test('should work with multiple sequential calls', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\n', '\n'))
      visitor.Literal(createStringLiteral('\\t', '\t'))
      visitor.Literal(createStringLiteral('\\a', 'a'))

      expect(reports.length).toBe(1)
    })
  })

  describe('valid string escapes', () => {
    test('should not report newline escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\n', '\n'))
      expect(reports.length).toBe(0)
    })

    test('should not report carriage return escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\r', '\r'))
      expect(reports.length).toBe(0)
    })

    test('should not report tab escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\t', '\t'))
      expect(reports.length).toBe(0)
    })

    test('should not report backspace escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\b', '\b'))
      expect(reports.length).toBe(0)
    })

    test('should not report form feed escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\f', '\f'))
      expect(reports.length).toBe(0)
    })

    test('should not report vertical tab escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\v', '\v'))
      expect(reports.length).toBe(0)
    })

    test('should not report null escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\0', '\0'))
      expect(reports.length).toBe(0)
    })

    test('should not report backslash escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\\\', '\\'))
      expect(reports.length).toBe(0)
    })

    test('should not report single quote escape in single quotes', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral("\\'", "'"))
      expect(reports.length).toBe(0)
    })

    test('should not report double quote escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\"', '"'))
      expect(reports.length).toBe(0)
    })

    test('should not report backtick escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\`', '`'))
      expect(reports.length).toBe(0)
    })

    test('should not report dollar sign escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\$', '$'))
      expect(reports.length).toBe(0)
    })

    test('should not report escape before newline character', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\\n', '\n'))
      expect(reports.length).toBe(0)
    })

    test('should not report escape before carriage return character', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\\r', '\r'))
      expect(reports.length).toBe(0)
    })

    test('should not report string with only valid escapes', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\n\\t\\r', '\n\t\r'))
      expect(reports.length).toBe(0)
    })

    test('should not report string with mixed valid escapes', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\\\\\n\\t', '\\\n\t'))
      expect(reports.length).toBe(0)
    })

    test('should not report string with backslash and quote escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\\\\\"', '\\"'))
      expect(reports.length).toBe(0)
    })

    test('should not report string with dollar sign and backtick escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\$\\`', '$`'))
      expect(reports.length).toBe(0)
    })

    test('should not report string with form feed and vertical tab', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\f\\v', '\f\v'))
      expect(reports.length).toBe(0)
    })

    test('should not report string with backspace and null', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\b\\0', '\b\0'))
      expect(reports.length).toBe(0)
    })

    test('should not report string with all quote types escaped', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\\'\\"\\`', '\'"\`'))
      expect(reports.length).toBe(0)
    })

    test('should not report escape before literal newline', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\\n', '\n'))
      expect(reports.length).toBe(0)
    })

    test('should not report escape before literal carriage return', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\\r', '\r'))
      expect(reports.length).toBe(0)
    })

    test('should not report single backslash followed by newline literal', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('a\\\nb', 'a\nb'))
      expect(reports.length).toBe(0)
    })

    test('should not report string with repeated valid escapes', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\n\\n\\n', '\n\n\n'))
      expect(reports.length).toBe(0)
    })

    test('should not report string with backslash followed by valid escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\\\\\n', '\\\n'))
      expect(reports.length).toBe(0)
    })
  })

  describe('valid regex escapes', () => {
    test('should not report digit escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\d+', '/\\d+/'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-digit escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\D+', '/\\D+/'))
      expect(reports.length).toBe(0)
    })

    test('should not report word escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\w+', '/\\w+/'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-word escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\W+', '/\\W+/'))
      expect(reports.length).toBe(0)
    })

    test('should not report whitespace escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\s+', '/\\s+/'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-whitespace escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\S+', '/\\S+/'))
      expect(reports.length).toBe(0)
    })

    test('should not report word boundary escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\btest\\b', '/\\btest\\b/'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-word boundary escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\B', '/\\B/'))
      expect(reports.length).toBe(0)
    })

    test('should not report backslash escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\\\', '/\\\\/'))
      expect(reports.length).toBe(0)
    })

    test('should not report caret escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\^', '/\\^/'))
      expect(reports.length).toBe(0)
    })

    test('should not report dollar sign escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\$', '/\\$/'))
      expect(reports.length).toBe(0)
    })

    test('should not report dot escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\.', '/\\./'))
      expect(reports.length).toBe(0)
    })

    test('should not report pipe escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\|', '/\\|/'))
      expect(reports.length).toBe(0)
    })

    test('should not report question mark escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\?', '/\\?/'))
      expect(reports.length).toBe(0)
    })

    test('should not report asterisk escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\*', '/\\*/'))
      expect(reports.length).toBe(0)
    })

    test('should not report plus escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\+', '/\\+/'))
      expect(reports.length).toBe(0)
    })

    test('should not report parentheses escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\(\\)', '/\\(\\)/'))
      expect(reports.length).toBe(0)
    })

    test('should not report brackets escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\[\\]', '/\\[\\]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report braces escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\{\\}', '/\\{\\}/'))
      expect(reports.length).toBe(0)
    })

    test('should not report slash escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\/', '/\\//'))
      expect(reports.length).toBe(0)
    })

    test('should not report opening paren escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\(', '/\\(/'))
      expect(reports.length).toBe(0)
    })

    test('should not report closing paren escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\)', '/\\)/'))
      expect(reports.length).toBe(0)
    })

    test('should not report opening bracket escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\[', '/\\[/'))
      expect(reports.length).toBe(0)
    })

    test('should not report closing bracket escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\]', '/\\]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report opening brace escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\{', '/\\{/'))
      expect(reports.length).toBe(0)
    })

    test('should not report closing brace escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\}', '/\\}/'))
      expect(reports.length).toBe(0)
    })

    test('should not report semicolon escape in regex (non-alphanumeric)', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\;', '/\\;/'))
      expect(reports.length).toBe(0)
    })

    test('should not report tilde escape in regex (non-alphanumeric)', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\~', '/\\~/'))
      expect(reports.length).toBe(0)
    })

    test('should not report colon escape in regex (non-alphanumeric)', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\:', '/\\:/'))
      expect(reports.length).toBe(0)
    })

    test('should not report comma escape in regex (non-alphanumeric)', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\,', '/\\,/'))
      expect(reports.length).toBe(0)
    })

    test('should not report underscore escape in regex (non-alphanumeric)', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\_', '/\\_/'))
      expect(reports.length).toBe(0)
    })

    test('should not report equals escape in regex (non-alphanumeric)', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\=', '/\\=/'))
      expect(reports.length).toBe(0)
    })

    test('should not report exclamation escape in regex (non-alphanumeric)', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\!', '/\\!/'))
      expect(reports.length).toBe(0)
    })

    test('should not report at sign escape in regex (non-alphanumeric)', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\@', '/\\@/'))
      expect(reports.length).toBe(0)
    })

    test('should not report hash escape in regex (non-alphanumeric)', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\#', '/\\#/'))
      expect(reports.length).toBe(0)
    })

    test('should not report percent escape in regex (non-alphanumeric)', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\%', '/\\%/'))
      expect(reports.length).toBe(0)
    })

    test('should not report ampersand escape in regex (non-alphanumeric)', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\&', '/\\&/'))
      expect(reports.length).toBe(0)
    })

    test('should not report angle bracket escapes in regex (non-alphanumeric)', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\<\\>', '/\\<\\>/'))
      expect(reports.length).toBe(0)
    })

    test('should not report space escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      // Space is not alphanumeric and not in REGEX_SPECIAL_CHARS
      visitor.Literal(createRegexLiteral('\\ ', '/\\ /'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with multiple valid special char escapes', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\.\\*\\+', '/\\.\\*\\+/'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex combining shorthand classes and special chars', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\d+\\.\\w*', '/\\d+\\.\\w*/'))
      expect(reports.length).toBe(0)
    })
  })

  describe('valid non-escape cases', () => {
    test('should not report number literal', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createNumberLiteral(42))
      expect(reports.length).toBe(0)
    })

    test('should not report boolean literal', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createBooleanLiteral(true))
      expect(reports.length).toBe(0)
    })

    test('should not report null literal', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createNullLiteral())
      expect(reports.length).toBe(0)
    })

    test('should not report string without escapes', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('hello world', 'hello world'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex without escapes', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('test', '/test/'))
      expect(reports.length).toBe(0)
    })

    test('should not report empty string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('', ''))
      expect(reports.length).toBe(0)
    })

    test('should not report empty regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('', '/(?:)/'))
      expect(reports.length).toBe(0)
    })

    test('should not report identifier node', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createIdentifier('x'))
      expect(reports.length).toBe(0)
    })

    test('should not report boolean false literal', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createBooleanLiteral(false))
      expect(reports.length).toBe(0)
    })

    test('should not report zero number literal', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createNumberLiteral(0))
      expect(reports.length).toBe(0)
    })

    test('should not report negative number literal', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createNumberLiteral(-1))
      expect(reports.length).toBe(0)
    })

    test('should not report string with only letters', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('abcdef', 'abcdef'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with simple pattern', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('abc', '/abc/'))
      expect(reports.length).toBe(0)
    })

    test('should not report string with only digits', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('12345', '12345'))
      expect(reports.length).toBe(0)
    })

    test('should not report string with special chars but no backslashes', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('hello!@#$%', 'hello!@#$%'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('[abc]', '/[abc]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with quantifiers but no escapes', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('a+b*c?', '/a+b*c?/'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with anchors but no escapes', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('^test$', '/^test$/'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with alternation but no escapes', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('a|b', '/a|b/'))
      expect(reports.length).toBe(0)
    })
  })

  describe('invalid string escapes - detection', () => {
    test('should report letter escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary escape')
    })

    test('should report digit escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\1', '1'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary escape')
    })

    test('should report symbol escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\@', '@'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary escape')
    })

    test('should report punctuation escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\,', ','))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary escape')
    })

    test('should report escape c in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\c', 'c'))
      expect(reports.length).toBe(1)
    })

    test('should report escape d in string (not in STRING_ESCAPABLE)', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\d', 'd'))
      expect(reports.length).toBe(1)
    })

    test('should report escape e in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\e', 'e'))
      expect(reports.length).toBe(1)
    })

    test('should report escape g in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\g', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report escape h in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\h', 'h'))
      expect(reports.length).toBe(1)
    })

    test('should report escape i in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\i', 'i'))
      expect(reports.length).toBe(1)
    })

    test('should report escape j in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\j', 'j'))
      expect(reports.length).toBe(1)
    })

    test('should report escape k in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\k', 'k'))
      expect(reports.length).toBe(1)
    })

    test('should report escape l in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\l', 'l'))
      expect(reports.length).toBe(1)
    })

    test('should report escape m in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\m', 'm'))
      expect(reports.length).toBe(1)
    })

    test('should report escape o in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\o', 'o'))
      expect(reports.length).toBe(1)
    })

    test('should report escape p in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\p', 'p'))
      expect(reports.length).toBe(1)
    })

    test('should report escape q in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\q', 'q'))
      expect(reports.length).toBe(1)
    })

    test('should report escape s in string (not in STRING_ESCAPABLE, lowercase s IS but check logic)', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      // s IS in STRING_ESCAPABLE only as \s shorthand, but STRING_ESCAPABLE has 's' as key
      // Actually 's' is NOT in STRING_ESCAPABLE set. Let me recheck:
      // STRING_ESCAPABLE = n, r, t, b, f, v, 0, \, ', ", `, $, \n, \r
      // 's' is NOT in STRING_ESCAPABLE, so \s in a string is useless
      visitor.Literal(createStringLiteral('\\s', 's'))
      expect(reports.length).toBe(1)
    })

    test('should report escape u in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\u', 'u'))
      expect(reports.length).toBe(1)
    })

    test('should report escape w in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\w', 'w'))
      expect(reports.length).toBe(1)
    })

    test('should report escape x in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\x', 'x'))
      expect(reports.length).toBe(1)
    })

    test('should report escape y in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\y', 'y'))
      expect(reports.length).toBe(1)
    })

    test('should report escape z in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\z', 'z'))
      expect(reports.length).toBe(1)
    })

    test('should report uppercase letter escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\A', 'A'))
      expect(reports.length).toBe(1)
    })

    test('should report uppercase letter escape C in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\C', 'C'))
      expect(reports.length).toBe(1)
    })

    test('should report uppercase letter escape Z in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\Z', 'Z'))
      expect(reports.length).toBe(1)
    })

    test('should report digit 2 escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\2', '2'))
      expect(reports.length).toBe(1)
    })

    test('should report digit 9 escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\9', '9'))
      expect(reports.length).toBe(1)
    })

    test('should report exclamation mark escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\!', '!'))
      expect(reports.length).toBe(1)
    })

    test('should report hash escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\#', '#'))
      expect(reports.length).toBe(1)
    })

    test('should report percent escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\%', '%'))
      expect(reports.length).toBe(1)
    })

    test('should report ampersand escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\&', '&'))
      expect(reports.length).toBe(1)
    })

    test('should report equals sign escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\=', '='))
      expect(reports.length).toBe(1)
    })

    test('should report semicolon escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\;', ';'))
      expect(reports.length).toBe(1)
    })

    test('should report colon escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\:', ':'))
      expect(reports.length).toBe(1)
    })

    test('should report period escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\.', '.'))
      expect(reports.length).toBe(1)
    })

    test('should report underscore escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\_', '_'))
      expect(reports.length).toBe(1)
    })

    test('should report hyphen escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\-', '-'))
      expect(reports.length).toBe(1)
    })

    test('should report tilde escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\~', '~'))
      expect(reports.length).toBe(1)
    })

    test('should report angle bracket escapes in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\<', '<'))
      expect(reports.length).toBe(1)
    })

    test('should report space escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\ ', ' '))
      expect(reports.length).toBe(1)
    })
  })

  describe('invalid regex escapes - detection', () => {
    test('should report letter escape (non-special) in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('test\\a', '/test\\a/'))
      expect(reports.length).toBe(1)
    })

    test('should report letter escape z in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\z', '/\\z/'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary escape')
    })

    test('should report letter escape a in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\a', '/\\a/'))
      expect(reports.length).toBe(1)
    })

    test('should report letter escape c in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\c', '/\\c/'))
      expect(reports.length).toBe(1)
    })

    test('should report letter escape e in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\e', '/\\e/'))
      expect(reports.length).toBe(1)
    })

    test('should report letter escape g in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\g', '/\\g/'))
      expect(reports.length).toBe(1)
    })

    test('should report letter escape h in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\h', '/\\h/'))
      expect(reports.length).toBe(1)
    })

    test('should report letter escape i in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\i', '/\\i/'))
      expect(reports.length).toBe(1)
    })

    test('should report letter escape j in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\j', '/\\j/'))
      expect(reports.length).toBe(1)
    })

    test('should report letter escape k in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\k', '/\\k/'))
      expect(reports.length).toBe(1)
    })

    test('should report letter escape l in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\l', '/\\l/'))
      expect(reports.length).toBe(1)
    })

    test('should report letter escape m in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\m', '/\\m/'))
      expect(reports.length).toBe(1)
    })

    test('should report letter escape n in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\n', '/\\n/'))
      expect(reports.length).toBe(1)
    })

    test('should report letter escape o in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\o', '/\\o/'))
      expect(reports.length).toBe(1)
    })

    test('should report letter escape p in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\p', '/\\p/'))
      expect(reports.length).toBe(1)
    })

    test('should report letter escape q in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\q', '/\\q/'))
      expect(reports.length).toBe(1)
    })

    test('should report letter escape r in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\r', '/\\r/'))
      expect(reports.length).toBe(1)
    })

    test('should report letter escape u in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\u', '/\\u/'))
      expect(reports.length).toBe(1)
    })

    test('should report letter escape v in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\v', '/\\v/'))
      expect(reports.length).toBe(1)
    })

    test('should report letter escape y in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\y', '/\\y/'))
      expect(reports.length).toBe(1)
    })

    test('should report uppercase letter escape A in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\A', '/\\A/'))
      expect(reports.length).toBe(1)
    })

    test('should report uppercase letter escape C in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\C', '/\\C/'))
      expect(reports.length).toBe(1)
    })

    test('should report uppercase letter escape Z in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\Z', '/\\Z/'))
      expect(reports.length).toBe(1)
    })

    test('should report digit escape 1 in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\1', '/\\1/'))
      expect(reports.length).toBe(1)
    })

    test('should report digit escape 5 in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\5', '/\\5/'))
      expect(reports.length).toBe(1)
    })

    test('should report digit escape 9 in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\9', '/\\9/'))
      expect(reports.length).toBe(1)
    })

    test('should not report punctuation escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\;', '/\\;/'))
      expect(reports.length).toBe(0)
    })

    test('should not report escape of non-special non-alphanumeric character in regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\~', '/\\~/'))
      expect(reports.length).toBe(0)
    })

    test('should report letter escape in regex with message', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\x', '/\\x/'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary escape')
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      expect(() => visitor.Literal(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      expect(() => visitor.Literal(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      const node = { value: 'test' }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without raw property', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      const node = { type: 'Literal', value: 'test' }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle raw property as null', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      const node = { type: 'Literal', raw: null }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle raw property as undefined', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      const node = { type: 'Literal' }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle raw property as number', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      const node = { type: 'Literal', raw: 123 }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      const node = createStringLiteral('\\a', 'a') as Record<string, unknown>
      delete node.loc

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle non-Literal node', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      const node = { type: 'Identifier', name: 'x' }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      expect(() => visitor.Literal(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      expect(() => visitor.Literal('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      expect(() => visitor.Literal([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle regex with flags', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteralWithFlags('\\d+', 'gi', '/\\d+/gi'))
      expect(reports.length).toBe(0)
    })

    test('should handle empty escape sequence', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      const node = { type: 'Literal', raw: '\\' }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle escape at end of string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      const node = { type: 'Literal', raw: 'test\\' }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle multiple consecutive escapes', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\\\\\a', '\\a'))
      expect(reports.length).toBe(1)
    })

    test('should handle unicode escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\u0041', 'A'))
      expect(reports.length).toBe(1)
    })

    test('should handle hex escape in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\x41', 'A'))
      expect(reports.length).toBe(1)
    })

    test('should handle mixed valid and invalid escapes', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\n\\a\\t', '\n\t'))
      expect(reports.length).toBe(1)
    })

    test('should handle raw property as boolean', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      const node = { type: 'Literal', raw: true }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle raw property as object', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      const node = { type: 'Literal', raw: {} }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      expect(() => visitor.Literal({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle regex node without raw', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      const node = { type: 'Literal', regex: { pattern: '\\d+', flags: '' } }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle regex with flags and useless escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteralWithFlags('\\z', 'gi', '/\\z/gi'))
      expect(reports.length).toBe(1)
    })

    test('should handle regex with only flags', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteralWithFlags('', 'g', '//g'))
      expect(reports.length).toBe(0)
    })

    test('should handle raw with only backslashes', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\\\', '\\'))
      expect(reports.length).toBe(0)
    })

    test('should handle escape followed by escaped backslash', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      // \a\\ => the \a is useless, then \\ is valid
      visitor.Literal(createStringLiteral('\\a\\\\', 'a\\'))
      expect(reports.length).toBe(1)
    })

    test('should handle node with loc containing null start', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      const node = {
        type: 'Literal',
        raw: '\\a',
        value: 'a',
        loc: { start: null, end: { line: 1, column: 2 } },
      }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with loc containing null end', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      const node = {
        type: 'Literal',
        raw: '\\a',
        value: 'a',
        loc: { start: { line: 1, column: 0 }, end: null },
      }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with loc containing string line/column', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      const node = {
        type: 'Literal',
        raw: '\\a',
        value: 'a',
        loc: { start: { line: '1', column: '0' }, end: { line: '1', column: '2' } },
      }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle string with only a single backslash', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      const node = { type: 'Literal', raw: '\\' }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested object node', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      const node = { type: 'Literal', raw: { nested: true } }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for unnecessary string escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a', 5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for unnecessary regex escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\z', '/\\z/', 5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a', 3, 5))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(2)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a'))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for regex at different line', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\a', '/\\a/', 10, 20))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report location for regex with flags', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteralWithFlags('\\z', 'g', '/\\z/g', 7, 3))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should include both start and end in location', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a', 2, 4))
      const loc = reports[0].loc
      expect(loc).toBeDefined()
      expect(loc?.start).toBeDefined()
      expect(loc?.end).toBeDefined()
    })

    test('should report location with column 0 at start of line', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a', 1, 0))
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for long string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('hello\\a', 'helloa', 5, 100))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(100)
    })

    test('should report location at high line number', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\z', 'z', 999, 0))
      expect(reports[0].loc?.start.line).toBe(999)
    })

    test('should report default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      const node = { type: 'Literal', raw: '\\a', value: 'a' }
      visitor.Literal(node)
      // extractLocation returns default { line: 1, column: 0 }
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report end column matching raw length for string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a', 1, 0))
      expect(reports[0].loc?.end.column).toBe(2)
    })

    test('should report end column matching raw length for regex', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\z', '/\\z/', 1, 0))
      expect(reports[0].loc?.end.column).toBe(4)
    })

    test('should report location for multiple consecutive escapes report', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\\\\\a', '\\a', 3, 7))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should report default location for node with missing loc properties', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      const node = {
        type: 'Literal',
        raw: '\\a',
        value: 'a',
        loc: { start: {}, end: {} },
      }
      visitor.Literal(node)
      // start.line is undefined, so default 1; start.column undefined, so default 0
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('message content', () => {
    test('should include "Unnecessary" in report message', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a'))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('should include "escape" in report message', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a'))
      expect(reports[0].message).toContain('escape')
    })

    test('should include "character" in report message', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a'))
      expect(reports[0].message).toContain('character')
    })

    test('should have consistent message for string escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a'))
      expect(reports[0].message).toBe('Unnecessary escape character.')
    })

    test('should have consistent message for regex escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\z', '/\\z/'))
      expect(reports[0].message).toBe('Unnecessary escape character.')
    })

    test('should have consistent message for different invalid escapes', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: "'hello\\'" })
      const visitor1 = noUselessEscapeRule.create(ctx1)
      visitor1.Literal(createStringLiteral('\\a', 'a'))

      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: "'hello\\'" })
      const visitor2 = noUselessEscapeRule.create(ctx2)
      visitor2.Literal(createStringLiteral('\\@', '@'))

      expect(reports1[0].message).toBe(reports2[0].message)
    })

    test('should have message as a string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a'))
      expect(typeof reports[0].message).toBe('string')
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a'))
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have message ending with period', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a'))
      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should have same message across node types', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: "'hello\\'" })
      const visitor1 = noUselessEscapeRule.create(ctx1)
      visitor1.Literal(createStringLiteral('\\x', 'x'))

      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: "'hello\\'" })
      const visitor2 = noUselessEscapeRule.create(ctx2)
      visitor2.Literal(createRegexLiteral('\\x', '/\\x/'))

      expect(reports1[0].message).toBe(reports2[0].message)
    })
  })

  describe('multiple reports', () => {
    test('should report multiple unnecessary escapes in string', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a\\b\\c', 'abc'))
      expect(reports.length).toBe(1)
    })

    test('should report once when first useless escape is found', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a\\x\\z', 'axz'))
      expect(reports.length).toBe(1)
    })

    test('should report for each invocation with useless escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a'))
      visitor.Literal(createStringLiteral('\\x', 'x'))

      expect(reports.length).toBe(2)
    })

    test('should report separately for string and regex with useless escapes', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a'))
      visitor.Literal(createRegexLiteral('\\z', '/\\z/'))

      expect(reports.length).toBe(2)
    })

    test('should not report for valid escape then report for invalid', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\n', '\n'))
      visitor.Literal(createStringLiteral('\\a', 'a'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('should handle alternating valid and invalid nodes', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\n', '\n'))
      visitor.Literal(createStringLiteral('\\a', 'a'))
      visitor.Literal(createStringLiteral('\\t', '\t'))
      visitor.Literal(createStringLiteral('\\x', 'x'))

      expect(reports.length).toBe(2)
    })

    test('should report for many sequential invalid strings', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.Literal(createStringLiteral('\\a', 'a'))
      }

      expect(reports.length).toBe(10)
    })

    test('should report for many sequential invalid regexes', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.Literal(createRegexLiteral('\\z', '/\\z/'))
      }

      expect(reports.length).toBe(5)
    })

    test('should report for mix of regex and string useless escapes', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      for (let i = 0; i < 3; i++) {
        visitor.Literal(createStringLiteral('\\a', 'a'))
        visitor.Literal(createRegexLiteral('\\z', '/\\z/'))
      }

      expect(reports.length).toBe(6)
    })

    test('should handle valid node then many invalid nodes', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\n', '\n'))
      for (let i = 0; i < 5; i++) {
        visitor.Literal(createStringLiteral('\\a', 'a'))
      }

      expect(reports.length).toBe(5)
    })
  })

  describe('context interactions', () => {
    test('should call context.report with message property', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a'))
      expect(reports[0]).toHaveProperty('message')
    })

    test('should call context.report with loc property', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a'))
      expect(reports[0]).toHaveProperty('loc')
    })

    test('should not call report for valid escapes', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\n', '\n'))
      expect(reports.length).toBe(0)
    })

    test('should work with different context instances', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: "'hello\\'" })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: "'hello\\'" })

      const visitor1 = noUselessEscapeRule.create(ctx1)
      const visitor2 = noUselessEscapeRule.create(ctx2)

      visitor1.Literal(createStringLiteral('\\a', 'a'))
      visitor2.Literal(createStringLiteral('\\n', '\n'))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should not modify context', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a'))
      expect(context.getFilePath()).toBe('/src/file.ts')
      expect(context.getSource()).toBe("'hello\\'")
    })

    test('should report once per node with useless escape', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a'))
      expect(reports.length).toBe(1)
    })

    test('should not call report for non-Literal type', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createIdentifier('foo'))
      expect(reports.length).toBe(0)
    })

    test('should not call report for number literal', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createNumberLiteral(42))
      expect(reports.length).toBe(0)
    })

    test('should not call report for boolean literal', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createBooleanLiteral(true))
      expect(reports.length).toBe(0)
    })

    test('should not call report for null literal', () => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createNullLiteral())
      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - string useless escapes', () => {
    test.each([
      ['\\a', 'a'],
      ['\\b', '\b'],
      ['\\c', 'c'],
      ['\\d', 'd'],
      ['\\e', 'e'],
      ['\\f', '\f'],
      ['\\g', 'g'],
      ['\\h', 'h'],
      ['\\i', 'i'],
      ['\\j', 'j'],
      ['\\k', 'k'],
      ['\\l', 'l'],
      ['\\m', 'm'],
      ['\\o', 'o'],
      ['\\p', 'p'],
      ['\\q', 'q'],
      ['\\s', 's'],
      ['\\u', 'u'],
      ['\\v', '\v'],
      ['\\w', 'w'],
      ['\\x', 'x'],
      ['\\y', 'y'],
      ['\\z', 'z'],
    ] satisfies [string, string][])('should detect useless escape %s in string', (raw, value) => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral(raw, value))
      // Some of these are actually valid escapes (b, f, v)
      // \b is backspace - valid in STRING_ESCAPABLE
      // \f is form feed - valid in STRING_ESCAPABLE
      // \v is vertical tab - valid in STRING_ESCAPABLE
      // \n is newline - valid (but not in test data above since it maps to \n char)
      // The raw \b maps to backspace which IS in STRING_ESCAPABLE
      // But wait: raw='\\b' means the raw text is \b which IS a valid escape
      // raw='\\v' means raw text is \v which IS a valid escape
      // So for b, f, v - these should NOT be reported
      const validEscapes = ['\\b', '\\f', '\\v', '\\n']
      if (validEscapes.includes(raw)) {
        expect(reports.length).toBe(0)
      } else {
        expect(reports.length).toBe(1)
      }
    })
  })

  describe('test.each - string valid escapes', () => {
    test.each([
      ['\\n', '\n'],
      ['\\r', '\r'],
      ['\\t', '\t'],
      ['\\b', '\b'],
      ['\\f', '\f'],
      ['\\v', '\v'],
      ['\\0', '\0'],
      ['\\\\', '\\'],
      ["\\'", "'"],
      ['\\"', '"'],
      ['\\`', '`'],
      ['\\$', '$'],
    ] satisfies [string, string][])('should not report valid escape %s in string', (raw, value) => {
      const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral(raw, value))
      expect(reports.length).toBe(0)
    })
  })

  describe('test.each - regex valid special char escapes', () => {
    test.each([
      ['\\\\', '/\\\\/'],
      ['\\^', '/\\^/'],
      ['\\$', '/\\$/'],
      ['\\.', '/\\./'],
      ['\\|', '/\\|/'],
      ['\\?', '/\\?/'],
      ['\\*', '/\\*/'],
      ['\\+', '/\\+/'],
      ['\\(', '/\\(/'],
      ['\\)', '/\\)/'],
      ['\\[', '/\\[/'],
      ['\\]', '/\\]/'],
      ['\\{', '/\\{/'],
      ['\\}', '/\\}/'],
      ['\\/', '/\\//'],
    ] satisfies [string, string][])(
      'should not report valid regex special char escape %s',
      (pattern, raw) => {
        const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
        const visitor = noUselessEscapeRule.create(context)

        visitor.Literal(createRegexLiteral(pattern, raw))
        expect(reports.length).toBe(0)
      },
    )
  })

  describe('test.each - regex valid shorthand class escapes', () => {
    test.each([
      ['\\d', '/\\d/'],
      ['\\D', '/\\D/'],
      ['\\w', '/\\w/'],
      ['\\W', '/\\W/'],
      ['\\s', '/\\s/'],
      ['\\S', '/\\S/'],
      ['\\b', '/\\b/'],
      ['\\B', '/\\B/'],
    ] satisfies [string, string][])(
      'should not report valid regex shorthand class escape %s',
      (pattern, raw) => {
        const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
        const visitor = noUselessEscapeRule.create(context)

        visitor.Literal(createRegexLiteral(pattern, raw))
        expect(reports.length).toBe(0)
      },
    )
  })

  describe('test.each - regex useless letter escapes', () => {
    test.each([
      ['\\a', '/\\a/'],
      ['\\c', '/\\c/'],
      ['\\e', '/\\e/'],
      ['\\g', '/\\g/'],
      ['\\h', '/\\h/'],
      ['\\i', '/\\i/'],
      ['\\j', '/\\j/'],
      ['\\k', '/\\k/'],
      ['\\l', '/\\l/'],
      ['\\m', '/\\m/'],
      ['\\o', '/\\o/'],
      ['\\p', '/\\p/'],
      ['\\q', '/\\q/'],
      ['\\r', '/\\r/'],
      ['\\u', '/\\u/'],
      ['\\v', '/\\v/'],
      ['\\x', '/\\x/'],
      ['\\y', '/\\y/'],
      ['\\z', '/\\z/'],
      ['\\A', '/\\A/'],
      ['\\C', '/\\C/'],
      ['\\E', '/\\E/'],
      ['\\G', '/\\G/'],
      ['\\H', '/\\H/'],
      ['\\I', '/\\I/'],
      ['\\J', '/\\J/'],
      ['\\K', '/\\K/'],
      ['\\L', '/\\L/'],
      ['\\M', '/\\M/'],
      ['\\N', '/\\N/'],
      ['\\O', '/\\O/'],
      ['\\P', '/\\P/'],
      ['\\Q', '/\\Q/'],
      ['\\R', '/\\R/'],
      ['\\T', '/\\T/'],
      ['\\U', '/\\U/'],
      ['\\V', '/\\V/'],
      ['\\X', '/\\X/'],
      ['\\Y', '/\\Y/'],
      ['\\Z', '/\\Z/'],
    ] satisfies [string, string][])(
      'should report useless regex letter escape %s',
      (pattern, raw) => {
        const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
        const visitor = noUselessEscapeRule.create(context)

        visitor.Literal(createRegexLiteral(pattern, raw))
        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain('Unnecessary escape')
      },
    )
  })

  describe('test.each - regex non-alphanumeric non-special escapes (valid)', () => {
    test.each([
      ['\\;', '/\\;/'],
      ['\\:', '/\\:/'],
      ['\\,', '/\\,/'],
      ['\\~', '/\\~/'],
      ['\\!', '/\\!/'],
      ['\\@', '/\\@/'],
      ['\\#', '/\\#/'],
      ['\\%', '/\\%/'],
      ['\\&', '/\\&/'],
      ['\\_', '/\\_/'],
      ['\\=', '/\\=/'],
      ['\\-', '/\\-/'],
      ['\\<', '/\\</'],
      ['\\>', '/\\>/'],
      ['\\ ', '/\\ /'],
    ] satisfies [string, string][])(
      'should not report non-alphanumeric non-special regex escape %s',
      (pattern, raw) => {
        const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
        const visitor = noUselessEscapeRule.create(context)

        visitor.Literal(createRegexLiteral(pattern, raw))
        expect(reports.length).toBe(0)
      },
    )
  })

  describe('test.each - regex digit escapes', () => {
    test.each([
      ['\\1', '/\\1/'],
      ['\\2', '/\\2/'],
      ['\\3', '/\\3/'],
      ['\\4', '/\\4/'],
      ['\\5', '/\\5/'],
      ['\\6', '/\\6/'],
      ['\\7', '/\\7/'],
      ['\\8', '/\\8/'],
      ['\\9', '/\\9/'],
    ] satisfies [string, string][])(
      'should report useless regex digit escape %s',
      (pattern, raw) => {
        const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
        const visitor = noUselessEscapeRule.create(context)

        visitor.Literal(createRegexLiteral(pattern, raw))
        expect(reports.length).toBe(1)
      },
    )
  })

  describe('test.each - edge cases with symbols in strings', () => {
    test.each([
      ['\\!', '!'],
      ['\\@', '@'],
      ['\\#', '#'],
      ['\\%', '%'],
      ['\\&', '&'],
      ['\\*', '*'],
      ['\\+', '+'],
      ['\\.', '.'],
      ['\\:', ':'],
      ['\\;', ';'],
      ['\\=', '='],
      ['\\<', '<'],
      ['\\>', '>'],
      ['\\?', '?'],
      ['\\^', '^'],
      ['\\|', '|'],
      ['\\~', '~'],
      ['\\-', '-'],
      ['\\_', '_'],
      ['\\[', '['],
      ['\\]', ']'],
      ['\\{', '{'],
      ['\\}', '}'],
      ['\\(', '('],
      ['\\)', ')'],
      ['\\/', '/'],
    ] satisfies [string, string][])(
      'should report useless symbol escape %s in string',
      (raw, value) => {
        const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
        const visitor = noUselessEscapeRule.create(context)

        visitor.Literal(createStringLiteral(raw, value))
        expect(reports.length).toBe(1)
      },
    )
  })

  describe('test.each - uppercase letter escapes in strings', () => {
    test.each([
      ['\\A', 'A'],
      ['\\B', 'B'],
      ['\\C', 'C'],
      ['\\D', 'D'],
      ['\\E', 'E'],
      ['\\F', 'F'],
      ['\\G', 'G'],
      ['\\H', 'H'],
      ['\\I', 'I'],
      ['\\J', 'J'],
      ['\\K', 'K'],
      ['\\L', 'L'],
      ['\\M', 'M'],
      ['\\N', 'N'],
      ['\\O', 'O'],
      ['\\P', 'P'],
      ['\\Q', 'Q'],
      ['\\R', 'R'],
      ['\\S', 'S'],
      ['\\T', 'T'],
      ['\\U', 'U'],
      ['\\V', 'V'],
      ['\\W', 'W'],
      ['\\X', 'X'],
      ['\\Y', 'Y'],
      ['\\Z', 'Z'],
    ] satisfies [string, string][])(
      'should report useless uppercase letter escape %s in string',
      (raw, value) => {
        const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
        const visitor = noUselessEscapeRule.create(context)

        visitor.Literal(createStringLiteral(raw, value))
        expect(reports.length).toBe(1)
      },
    )
  })

  describe('test.each - digit escapes in strings', () => {
    test.each([
      ['\\1', '1'],
      ['\\2', '2'],
      ['\\3', '3'],
      ['\\4', '4'],
      ['\\5', '5'],
      ['\\6', '6'],
      ['\\7', '7'],
      ['\\8', '8'],
      ['\\9', '9'],
    ] satisfies [string, string][])(
      'should report useless digit escape %s in string',
      (raw, value) => {
        const { context, reports } = createMockRuleContext({ source: "'hello\\'" })
        const visitor = noUselessEscapeRule.create(context)

        visitor.Literal(createStringLiteral(raw, value))
        expect(reports.length).toBe(1)
      },
    )
  })
})

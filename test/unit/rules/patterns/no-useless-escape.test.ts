import { describe, test, expect, vi } from 'vitest'
import { noUselessEscapeRule } from '../../../../src/rules/patterns/no-useless-escape.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
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
    getSource: () => "'hello\\'",
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

  return { context, reports }
}

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
  })

  describe('create', () => {
    test('should return visitor with Literal method', () => {
      const { context } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      expect(visitor).toHaveProperty('Literal')
    })

    test('Literal should be a function', () => {
      const { context } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      expect(typeof visitor.Literal).toBe('function')
    })

    test('should return object with only Literal method', () => {
      const { context } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      const keys = Object.keys(visitor).sort()
      expect(keys).toEqual(['Literal'])
    })
  })

  describe('valid string escapes', () => {
    test('should not report newline escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\n', '\n'))
      expect(reports.length).toBe(0)
    })

    test('should not report carriage return escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\r', '\r'))
      expect(reports.length).toBe(0)
    })

    test('should not report tab escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\t', '\t'))
      expect(reports.length).toBe(0)
    })

    test('should not report backspace escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\b', '\b'))
      expect(reports.length).toBe(0)
    })

    test('should not report form feed escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\f', '\f'))
      expect(reports.length).toBe(0)
    })

    test('should not report vertical tab escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\v', '\v'))
      expect(reports.length).toBe(0)
    })

    test('should not report null escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\0', '\0'))
      expect(reports.length).toBe(0)
    })

    test('should not report backslash escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\\\', '\\'))
      expect(reports.length).toBe(0)
    })

    test('should not report single quote escape in single quotes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral("\\'", "'"))
      expect(reports.length).toBe(0)
    })

    test('should not report double quote escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\"', '"'))
      expect(reports.length).toBe(0)
    })

    test('should not report backtick escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\`', '`'))
      expect(reports.length).toBe(0)
    })

    test('should not report dollar sign escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\$', '$'))
      expect(reports.length).toBe(0)
    })
  })

  describe('valid regex escapes', () => {
    test('should not report digit escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\d+', '/\\d+/'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-digit escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\D+', '/\\D+/'))
      expect(reports.length).toBe(0)
    })

    test('should not report word escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\w+', '/\\w+/'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-word escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\W+', '/\\W+/'))
      expect(reports.length).toBe(0)
    })

    test('should not report whitespace escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\s+', '/\\s+/'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-whitespace escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\S+', '/\\S+/'))
      expect(reports.length).toBe(0)
    })

    test('should not report word boundary escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\btest\\b', '/\\btest\\b/'))
      expect(reports.length).toBe(0)
    })

    test('should not report non-word boundary escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\B', '/\\B/'))
      expect(reports.length).toBe(0)
    })

    test('should not report backslash escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\\\', '/\\\\/'))
      expect(reports.length).toBe(0)
    })

    test('should not report caret escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\^', '/\\^/'))
      expect(reports.length).toBe(0)
    })

    test('should not report dollar sign escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\$', '/\\$/'))
      expect(reports.length).toBe(0)
    })

    test('should not report dot escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\.', '/\\./'))
      expect(reports.length).toBe(0)
    })

    test('should not report pipe escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\|', '/\\|/'))
      expect(reports.length).toBe(0)
    })

    test('should not report question mark escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\?', '/\\?/'))
      expect(reports.length).toBe(0)
    })

    test('should not report asterisk escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\*', '/\\*/'))
      expect(reports.length).toBe(0)
    })

    test('should not report plus escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\+', '/\\+/'))
      expect(reports.length).toBe(0)
    })

    test('should not report parentheses escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\(\\)', '/\\(\\)/'))
      expect(reports.length).toBe(0)
    })

    test('should not report brackets escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\[\\]', '/\\[\\]/'))
      expect(reports.length).toBe(0)
    })

    test('should not report braces escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\{\\}', '/\\{\\}/'))
      expect(reports.length).toBe(0)
    })

    test('should not report slash escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\/', '/\\//'))
      expect(reports.length).toBe(0)
    })

    test('should report letter escape (non-special) in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('test\\a', '/test\\a/'))
      expect(reports.length).toBe(1)
    })
  })

  describe('valid non-escape cases', () => {
    test('should not report number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createNumberLiteral(42))
      expect(reports.length).toBe(0)
    })

    test('should not report boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createBooleanLiteral(true))
      expect(reports.length).toBe(0)
    })

    test('should not report null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createNullLiteral())
      expect(reports.length).toBe(0)
    })

    test('should not report string without escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('hello world', 'hello world'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex without escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('test', '/test/'))
      expect(reports.length).toBe(0)
    })

    test('should not report empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('', ''))
      expect(reports.length).toBe(0)
    })

    test('should not report empty regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('', '/(?:)/'))
      expect(reports.length).toBe(0)
    })

    test('should not report identifier node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createIdentifier('x'))
      expect(reports.length).toBe(0)
    })
  })

  describe('invalid string escapes', () => {
    test('should report letter escape in string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary escape')
    })

    test('should report digit escape in string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\1', '1'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary escape')
    })

    test('should report symbol escape in string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\@', '@'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary escape')
    })

    test('should report punctuation escape in string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\,', ','))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary escape')
    })

    test('should report correct location for unnecessary escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a', 'a', 5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report multiple unnecessary escapes in string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\a\\b\\c', 'abc'))
      expect(reports.length).toBe(1)
    })

    test('should not report escape before newline character (newline is in STRING_ESCAPABLE)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      // The raw string contains the actual newline character
      visitor.Literal(createStringLiteral('\\\n', '\n'))
      expect(reports.length).toBe(0)
    })

    test('should not report escape before carriage return (carriage return is in STRING_ESCAPABLE)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      // The raw string contains the actual carriage return character
      visitor.Literal(createStringLiteral('\\\r', '\r'))
      expect(reports.length).toBe(0)
    })
  })

  describe('invalid regex escapes', () => {
    test('should report letter escape (non-special) in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\z', '/\\z/'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary escape')
    })

    test('should not report punctuation escape in regex (non-alphanumeric)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\;', '/\\;/'))
      expect(reports.length).toBe(0)
    })

    test('should report correct location for unnecessary regex escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\z', '/\\z/', 5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should not report escape of non-special non-alphanumeric character in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteral('\\~', '/\\~/'))
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      expect(() => visitor.Literal(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      expect(() => visitor.Literal(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      const node = { value: 'test' }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without raw property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      const node = { type: 'Literal', value: 'test' }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle raw property as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      const node = { type: 'Literal', raw: null }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle raw property as undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      const node = { type: 'Literal' }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle raw property as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      const node = { type: 'Literal', raw: 123 }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      const node = createStringLiteral('\\a', 'a') as Record<string, unknown>
      delete node.loc

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle non-Literal node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      const node = { type: 'Identifier', name: 'x' }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      expect(() => visitor.Literal(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      expect(() => visitor.Literal('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      expect(() => visitor.Literal([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle regex with flags', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createRegexLiteralWithFlags('\\d+', 'gi', '/\\d+/gi'))
      expect(reports.length).toBe(0)
    })

    test('should handle empty escape sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      const node = { type: 'Literal', raw: '\\' }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle escape at end of string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      const node = { type: 'Literal', raw: 'test\\' }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle multiple consecutive escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\\\\\a', '\\a'))
      expect(reports.length).toBe(1)
    })

    test('should handle unicode escape in string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\u0041', 'A'))
      expect(reports.length).toBe(1)
    })

    test('should handle hex escape in string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\x41', 'A'))
      expect(reports.length).toBe(1)
    })

    test('should handle mixed valid and invalid escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUselessEscapeRule.create(context)

      visitor.Literal(createStringLiteral('\\n\\a\\t', '\n\t'))
      expect(reports.length).toBe(1)
    })
  })
})

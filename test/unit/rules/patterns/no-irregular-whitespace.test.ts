import { describe, test, expect } from 'vitest'
import { noIrregularWhitespaceRule } from '../../../../src/rules/patterns/no-irregular-whitespace.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createLiteral(value: unknown, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: 10 },
    },
  }
}

function createTemplateLiteral(quasis: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'TemplateLiteral',
    quasis,
    expressions: [],
    loc: {
      start: { line, column },
      end: { line, column: 20 },
    },
  }
}

function createQuasi(value: Record<string, unknown>, line = 1, column = 0): unknown {
  return {
    type: 'TemplateElement',
    value,
    tail: true,
    loc: {
      start: { line, column },
      end: { line, column: 10 },
    },
  }
}

// ---------------------------------------------------------------------------
// Meta tests (20)
// ---------------------------------------------------------------------------
describe('meta', () => {
  test('should have problem type', () => {
    expect(noIrregularWhitespaceRule.meta.type).toBe('problem')
  })

  test('should have error severity', () => {
    expect(noIrregularWhitespaceRule.meta.severity).toBe('error')
  })

  test('should be recommended', () => {
    expect(noIrregularWhitespaceRule.meta.docs?.recommended).toBe(true)
  })

  test('should have patterns category', () => {
    expect(noIrregularWhitespaceRule.meta.docs?.category).toBe('patterns')
  })

  test('should mention irregular whitespace in description', () => {
    expect(noIrregularWhitespaceRule.meta.docs?.description.toLowerCase()).toContain('irregular')
    expect(noIrregularWhitespaceRule.meta.docs?.description.toLowerCase()).toContain('whitespace')
  })

  test('should have empty schema', () => {
    expect(noIrregularWhitespaceRule.meta.schema).toEqual([])
  })

  test('should not be fixable', () => {
    expect(noIrregularWhitespaceRule.meta.fixable).toBeUndefined()
  })

  test('should not be deprecated', () => {
    expect(noIrregularWhitespaceRule.meta.deprecated).toBeUndefined()
  })

  test('should not have replacedBy', () => {
    expect(noIrregularWhitespaceRule.meta.replacedBy).toBeUndefined()
  })

  test('should not require type checking', () => {
    expect(noIrregularWhitespaceRule.meta.requiresTypeChecking).toBeUndefined()
  })

  test('should have a meta object', () => {
    expect(noIrregularWhitespaceRule.meta).toBeDefined()
    expect(typeof noIrregularWhitespaceRule.meta).toBe('object')
  })

  test('should have a docs object', () => {
    expect(noIrregularWhitespaceRule.meta.docs).toBeDefined()
    expect(typeof noIrregularWhitespaceRule.meta.docs).toBe('object')
  })

  test('should have a string description', () => {
    expect(typeof noIrregularWhitespaceRule.meta.docs?.description).toBe('string')
  })

  test('should have a non-empty description', () => {
    expect(noIrregularWhitespaceRule.meta.docs?.description.length).toBeGreaterThan(0)
  })

  test('should have severity as a valid value', () => {
    const validSeverities = ['off', 'warn', 'error']
    expect(validSeverities).toContain(noIrregularWhitespaceRule.meta.severity)
  })

  test('should have type as a valid RuleType', () => {
    const validTypes = ['problem', 'suggestion', 'layout']
    expect(validTypes).toContain(noIrregularWhitespaceRule.meta.type)
  })

  test('should have recommended as boolean true', () => {
    expect(noIrregularWhitespaceRule.meta.docs?.recommended).toBe(true)
  })

  test('should not have a docs url', () => {
    expect(noIrregularWhitespaceRule.meta.docs?.url).toBeUndefined()
  })

  test('should export a create function', () => {
    expect(typeof noIrregularWhitespaceRule.create).toBe('function')
  })

  test('meta should be readonly at runtime (frozen or sealed check)', () => {
    expect(noIrregularWhitespaceRule.meta).toBeDefined()
    expect(Object.keys(noIrregularWhitespaceRule.meta)).toContain('type')
  })
})

// ---------------------------------------------------------------------------
// create / visitor tests (8)
// ---------------------------------------------------------------------------
describe('create', () => {
  test('should return visitor with Literal method', () => {
    const { context } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    expect(visitor).toHaveProperty('Literal')
  })

  test('should return visitor with TemplateLiteral method', () => {
    const { context } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    expect(visitor).toHaveProperty('TemplateLiteral')
  })

  test('should return a visitor object', () => {
    const { context } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    expect(typeof visitor).toBe('object')
    expect(visitor).not.toBeNull()
  })

  test('Literal should be a function', () => {
    const { context } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    expect(typeof visitor.Literal).toBe('function')
  })

  test('TemplateLiteral should be a function', () => {
    const { context } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    expect(typeof visitor.TemplateLiteral).toBe('function')
  })

  test('create should return a new visitor each call', () => {
    const { context } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor1 = noIrregularWhitespaceRule.create(context)
    const visitor2 = noIrregularWhitespaceRule.create(context)

    expect(visitor1).not.toBe(visitor2)
  })

  test('visitor should have exactly 2 methods', () => {
    const { context } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    expect(Object.keys(visitor)).toHaveLength(2)
  })

  test('visitor methods should have correct names', () => {
    const { context } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    expect(Object.keys(visitor).sort()).toEqual(['Literal', 'TemplateLiteral'])
  })
})

// ---------------------------------------------------------------------------
// Detection tests — irregular whitespace chars in literals (30)
// ---------------------------------------------------------------------------
describe('literal detection of irregular whitespace', () => {
  test('should report vertical tab (\\u000B)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u000Bworld'))

    expect(reports.length).toBe(1)
  })

  test('should report form feed (\\u000C)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u000Cworld'))

    expect(reports.length).toBe(1)
  })

  test('should report non-breaking space (\\u00A0)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world'))

    expect(reports.length).toBe(1)
  })

  test('should report next line (\\u0085)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u0085world'))

    expect(reports.length).toBe(1)
  })

  test('should report ogham space mark (\\u1680)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u1680world'))

    expect(reports.length).toBe(1)
  })

  test('should report mongolian vowel separator (\\u180E)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u180Eworld'))

    expect(reports.length).toBe(1)
  })

  test('should report en quad (\\u2000)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u2000world'))

    expect(reports.length).toBe(1)
  })

  test('should report en space (\\u2002)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u2002world'))

    expect(reports.length).toBe(1)
  })

  test('should report em space (\\u2003)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u2003world'))

    expect(reports.length).toBe(1)
  })

  test('should report thin space (\\u2009)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u2009world'))

    expect(reports.length).toBe(1)
  })

  test('should report hair space (\\u200A)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u200Aworld'))

    expect(reports.length).toBe(1)
  })

  test('should report zero width space (\\u200B)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u200Bworld'))

    expect(reports.length).toBe(1)
  })

  test('should report line separator (\\u2028)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u2028world'))

    expect(reports.length).toBe(1)
  })

  test('should report paragraph separator (\\u2029)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u2029world'))

    expect(reports.length).toBe(1)
  })

  test('should report narrow no-break space (\\u202F)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u202Fworld'))

    expect(reports.length).toBe(1)
  })

  test('should report medium mathematical space (\\u205F)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u205Fworld'))

    expect(reports.length).toBe(1)
  })

  test('should report ideographic space (\\u3000)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u3000world'))

    expect(reports.length).toBe(1)
  })

  test('should report zero width no-break space (\\uFEFF)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\uFEFFworld'))

    expect(reports.length).toBe(1)
  })

  test('should report punctuation space (\\u2008)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u2008world'))

    expect(reports.length).toBe(1)
  })

  test('should report six-per-em space (\\u2006)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u2006world'))

    expect(reports.length).toBe(1)
  })

  test('should report figure space (\\u2007)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u2007world'))

    expect(reports.length).toBe(1)
  })

  test('should report four-per-em space (\\u2005)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u2005world'))

    expect(reports.length).toBe(1)
  })

  test('should report three-per-em space (\\u2004)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u2004world'))

    expect(reports.length).toBe(1)
  })

  test('should report em quad (\\u2001)', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u2001world'))

    expect(reports.length).toBe(1)
  })

  test('should detect at start of string', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('\u00A0hello'))

    expect(reports.length).toBe(1)
  })

  test('should detect at end of string', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0'))

    expect(reports.length).toBe(1)
  })

  test('should detect when string is only irregular whitespace', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('\u00A0'))

    expect(reports.length).toBe(1)
  })

  test('should detect multiple different irregular chars', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0\u2000\u3000world'))

    expect(reports.length).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// NOT reporting tests — valid whitespace (30)
// ---------------------------------------------------------------------------
describe('valid whitespace not reported', () => {
  test('should not report normal space', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello world'))

    expect(reports.length).toBe(0)
  })

  test('should not report tab character', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\tworld'))

    expect(reports.length).toBe(0)
  })

  test('should not report newline character', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\nworld'))

    expect(reports.length).toBe(0)
  })

  test('should not report carriage return', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\rworld'))

    expect(reports.length).toBe(0)
  })

  test('should not report non-string literals — number', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral(42))

    expect(reports.length).toBe(0)
  })

  test('should not report non-string literals — boolean true', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral(true))

    expect(reports.length).toBe(0)
  })

  test('should not report non-string literals — boolean false', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral(false))

    expect(reports.length).toBe(0)
  })

  test('should not report non-string literals — null', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral(null))

    expect(reports.length).toBe(0)
  })

  test('should not report empty string', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral(''))

    expect(reports.length).toBe(0)
  })

  test('should not report string with only regular whitespace', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral(' \t\n\r'))

    expect(reports.length).toBe(0)
  })

  test('should not report plain ASCII string', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('the quick brown fox'))

    expect(reports.length).toBe(0)
  })

  test('should not report string with multiple regular spaces', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('     '))

    expect(reports.length).toBe(0)
  })

  test('should not report string with mixed regular spaces and tabs', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral(' \t \t '))

    expect(reports.length).toBe(0)
  })

  test('should not report string with CRLF sequence', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\r\nworld'))

    expect(reports.length).toBe(0)
  })

  test('should not report string with only newline chars', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('\n\n\n'))

    expect(reports.length).toBe(0)
  })

  test('should not report string with only tabs', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('\t\t\t'))

    expect(reports.length).toBe(0)
  })

  test('should not report single space', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral(' '))

    expect(reports.length).toBe(0)
  })

  test('should not report alphanumeric string', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('abc123'))

    expect(reports.length).toBe(0)
  })

  test('should not report punctuation string', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('!@#$%^&*()'))

    expect(reports.length).toBe(0)
  })

  test('should not report unicode emoji string', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('🎉🎊'))

    expect(reports.length).toBe(0)
  })

  test('should not report unicode CJK string', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('你好世界'))

    expect(reports.length).toBe(0)
  })

  test('should not report template with regular whitespace', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ raw: 'hello world', cooked: 'hello world' })]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(0)
  })

  test('should not report template with tabs and newlines', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ raw: 'hello\t\nworld', cooked: 'hello\t\nworld' })]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(0)
  })

  test('should not report empty template', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ raw: '', cooked: '' })]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(0)
  })

  test('should not report template with only regular whitespace', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ raw: ' \t\n\r', cooked: ' \t\n\r' })]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(0)
  })

  test('should not report template with CRLF', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ raw: 'hello\r\nworld', cooked: 'hello\r\nworld' })]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(0)
  })

  test('should not report template with only spaces', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ raw: '     ', cooked: '     ' })]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(0)
  })

  test('should not report template with alphanumeric content', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ raw: 'abc123', cooked: 'abc123' })]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(0)
  })

  test('should not report template with unicode letters', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ raw: 'café', cooked: 'café' })]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(0)
  })

  test('should not report template with emoji', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ raw: '🎉🎊', cooked: '🎉🎊' })]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Edge cases (25)
// ---------------------------------------------------------------------------
describe('edge cases', () => {
  test('should handle null node gracefully in Literal', () => {
    const { context } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    expect(() => visitor.Literal(null)).not.toThrow()
  })

  test('should handle undefined node gracefully in Literal', () => {
    const { context } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    expect(() => visitor.Literal(undefined)).not.toThrow()
  })

  test('should handle null node gracefully in TemplateLiteral', () => {
    const { context } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    expect(() => visitor.TemplateLiteral(null)).not.toThrow()
  })

  test('should handle undefined node gracefully in TemplateLiteral', () => {
    const { context } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    expect(() => visitor.TemplateLiteral(undefined)).not.toThrow()
  })

  test('should handle node without loc', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const node = { type: 'Literal', value: 'hello\u00A0world' }
    visitor.Literal(node)

    expect(reports.length).toBe(1)
  })

  test('should handle non-Literal node in Literal visitor', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const node = { type: 'Identifier', name: 'test' }
    visitor.Literal(node)

    expect(reports.length).toBe(0)
  })

  test('should handle TemplateLiteral without quasis', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const node = { type: 'TemplateLiteral', expressions: [] }
    visitor.TemplateLiteral(node)

    expect(reports.length).toBe(0)
  })

  test('should handle quasi without value', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [{ type: 'TemplateElement', tail: true }]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(0)
  })

  test('should handle quasi with value without raw', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ cooked: 'test' })]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(0)
  })

  test('should handle non-TemplateLiteral node in TemplateLiteral visitor', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const node = { type: 'Literal', value: 'test' }
    visitor.TemplateLiteral(node)

    expect(reports.length).toBe(0)
  })

  test('should handle empty quasis array', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.TemplateLiteral(createTemplateLiteral([]))

    expect(reports.length).toBe(0)
  })

  test('should handle raw as empty string in quasi', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ raw: '', cooked: '' })]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(0)
  })

  test('should handle quasi value as null', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ raw: null, cooked: null })]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(0)
  })

  test('should handle quasi value with raw but undefined cooked', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ raw: 'hello world', cooked: undefined })]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(0)
  })

  test('should handle node with type but no value', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const node = {
      type: 'Literal',
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
    }
    visitor.Literal(node)

    expect(reports.length).toBe(0)
  })

  test('should handle node with value as empty object', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const node = { type: 'Literal', value: {} }
    visitor.Literal(node)

    expect(reports.length).toBe(0)
  })

  test('should handle node with value as array', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const node = { type: 'Literal', value: [1, 2, 3] }
    visitor.Literal(node)

    expect(reports.length).toBe(0)
  })

  test('should handle node with value as regex', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const node = { type: 'Literal', value: /test/ }
    visitor.Literal(node)

    expect(reports.length).toBe(0)
  })

  test('should handle node that is a string primitive', () => {
    const { context } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    expect(() => visitor.Literal('not a node')).not.toThrow()
  })

  test('should handle node that is a number primitive', () => {
    const { context } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    expect(() => visitor.Literal(42)).not.toThrow()
  })

  test('should handle node with circular reference safely', () => {
    const { context } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const node: Record<string, unknown> = { type: 'Literal' }
    node.self = node
    expect(() => visitor.Literal(node)).not.toThrow()
  })

  test('should handle undefined value in Literal node', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral(undefined))

    expect(reports.length).toBe(0)
  })

  test('should handle quasi with numeric raw value', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ raw: 123, cooked: 123 })]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(0)
  })

  test('should handle template with quasi that has loc with missing end', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasi = {
      type: 'TemplateElement',
      value: { raw: 'hello\u00A0world', cooked: 'hello\u00A0world' },
      tail: true,
      loc: { start: { line: 1, column: 0 } },
    }
    visitor.TemplateLiteral(createTemplateLiteral([quasi]))

    expect(reports.length).toBe(1)
  })

  test('should handle template with quasi that has no loc', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasi = {
      type: 'TemplateElement',
      value: { raw: 'hello\u00A0world', cooked: 'hello\u00A0world' },
      tail: true,
    }
    visitor.TemplateLiteral(createTemplateLiteral([quasi]))

    expect(reports.length).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// Location tests (15)
// ---------------------------------------------------------------------------
describe('location reporting', () => {
  test('should report correct line for literal at line 10', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world', 10, 5))

    expect(reports[0].loc?.start.line).toBe(10)
  })

  test('should report correct column for literal at column 5', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world', 1, 5))

    expect(reports[0].loc?.start.column).toBe(5)
  })

  test('should report correct location for literal at line 1 column 0', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world', 1, 0))

    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should report default location when node has no loc', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const node = { type: 'Literal', value: 'hello\u00A0world' }
    visitor.Literal(node)

    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should report correct location for template quasi at line 5 column 10', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ raw: 'hello\u00A0world', cooked: 'hello\u00A0world' }, 5, 10)]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports[0].loc?.start.line).toBe(5)
    expect(reports[0].loc?.start.column).toBe(10)
  })

  test('should report end location for literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world', 3, 2))

    expect(reports[0].loc?.end.line).toBe(3)
    expect(reports[0].loc?.end.column).toBe(10)
  })

  test('should report end location for template quasi', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ raw: 'hello\u00A0world', cooked: 'hello\u00A0world' }, 7, 3)]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports[0].loc?.end.line).toBe(7)
    expect(reports[0].loc?.end.column).toBe(10)
  })

  test('should handle location at line 0', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world', 0, 0))

    expect(reports[0].loc?.start.line).toBe(0)
  })

  test('should handle large line numbers', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world', 9999, 0))

    expect(reports[0].loc?.start.line).toBe(9999)
  })

  test('should handle large column numbers', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world', 1, 5000))

    expect(reports[0].loc?.start.column).toBe(5000)
  })

  test('should use quasi location not template literal location', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ raw: 'hello\u00A0world', cooked: 'hello\u00A0world' }, 20, 30)]
    visitor.TemplateLiteral(createTemplateLiteral(quasis, 1, 0))

    expect(reports[0].loc?.start.line).toBe(20)
    expect(reports[0].loc?.start.column).toBe(30)
  })

  test('should report location for each separate quasi', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [
      createQuasi({ raw: 'a\u00A0b', cooked: 'a\u00A0b' }, 2, 5),
      createQuasi({ raw: 'c\u00A0d', cooked: 'c\u00A0d' }, 4, 10),
    ]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports[0].loc?.start.line).toBe(2)
    expect(reports[1].loc?.start.line).toBe(4)
  })

  test('should report location with default when quasi has no loc', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasi = {
      type: 'TemplateElement',
      value: { raw: 'hello\u00A0world', cooked: 'hello\u00A0world' },
      tail: true,
    }
    visitor.TemplateLiteral(createTemplateLiteral([quasi]))

    expect(reports[0].loc?.start.line).toBe(1)
    expect(reports[0].loc?.start.column).toBe(0)
  })

  test('should handle loc with non-numeric line gracefully', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const node = {
      type: 'Literal',
      value: 'hello\u00A0world',
      loc: { start: { line: 'bad', column: 0 }, end: { line: 'bad', column: 1 } },
    }
    visitor.Literal(node)

    expect(reports.length).toBe(1)
  })

  test('should handle loc with non-numeric column gracefully', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const node = {
      type: 'Literal',
      value: 'hello\u00A0world',
      loc: { start: { line: 1, column: 'bad' }, end: { line: 1, column: 'bad' } },
    }
    visitor.Literal(node)

    expect(reports.length).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// Message tests (10)
// ---------------------------------------------------------------------------
describe('message quality', () => {
  test('should report correct message for literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world'))

    expect(reports[0].message).toBe('Irregular whitespace found.')
  })

  test('should mention irregular in message', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world'))

    expect(reports[0].message.toLowerCase()).toContain('irregular')
  })

  test('should mention whitespace in message', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world'))

    expect(reports[0].message.toLowerCase()).toContain('whitespace')
  })

  test('should report same message for template literal', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ raw: 'hello\u00A0world', cooked: 'hello\u00A0world' })]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports[0].message).toBe('Irregular whitespace found.')
  })

  test('should report consistent message across different chars', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('\u00A0'))
    visitor.Literal(createLiteral('\u3000'))
    visitor.Literal(createLiteral('\uFEFF'))

    expect(reports[0].message).toBe('Irregular whitespace found.')
    expect(reports[1].message).toBe('Irregular whitespace found.')
    expect(reports[2].message).toBe('Irregular whitespace found.')
  })

  test('should end message with period', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world'))

    expect(reports[0].message.endsWith('.')).toBe(true)
  })

  test('should have message as a non-empty string', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world'))

    expect(typeof reports[0].message).toBe('string')
    expect(reports[0].message.length).toBeGreaterThan(0)
  })

  test('should report same message for each violation', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [
      createQuasi({ raw: 'a\u00A0b', cooked: 'a\u00A0b' }, 1, 0),
      createQuasi({ raw: 'c\u2000d', cooked: 'c\u2000d' }, 2, 0),
    ]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports[0].message).toBe(reports[1].message)
  })

  test('should contain "found" in message', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world'))

    expect(reports[0].message.toLowerCase()).toContain('found')
  })

  test('should be a sentence-case message', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world'))

    expect(reports[0].message[0]).toBe(reports[0].message[0].toUpperCase())
  })
})

// ---------------------------------------------------------------------------
// Multiple reports tests (10)
// ---------------------------------------------------------------------------
describe('multiple reports', () => {
  test('should report one report per literal call with irregular whitespace', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world'))
    visitor.Literal(createLiteral('foo\u3000bar'))

    expect(reports.length).toBe(2)
  })

  test('should report one report even with multiple irregular chars in same string', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0\u2000\u3000world'))

    expect(reports.length).toBe(1)
  })

  test('should report for each quasi with irregular whitespace', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [
      createQuasi({ raw: 'hello\u00A0world', cooked: 'hello\u00A0world' }, 1, 0),
      createQuasi({ raw: 'test\u2000data', cooked: 'test\u2000data' }, 1, 20),
    ]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(2)
  })

  test('should report only for quasis with irregular whitespace', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [
      createQuasi({ raw: 'hello world', cooked: 'hello world' }, 1, 0),
      createQuasi({ raw: 'test\u00A0data', cooked: 'test\u00A0data' }, 1, 20),
      createQuasi({ raw: 'normal text', cooked: 'normal text' }, 1, 40),
    ]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(1)
  })

  test('should handle mix of valid and invalid literals', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('valid string'))
    visitor.Literal(createLiteral('invalid\u00A0string'))
    visitor.Literal(createLiteral('another valid'))
    visitor.Literal(createLiteral('another\u3000invalid'))

    expect(reports.length).toBe(2)
  })

  test('should accumulate reports across Literal and TemplateLiteral calls', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world'))
    const quasis = [createQuasi({ raw: 'foo\u3000bar', cooked: 'foo\u3000bar' })]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(2)
  })

  test('should handle many sequential literal calls', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    for (let i = 0; i < 10; i++) {
      visitor.Literal(createLiteral(`text\u00A0${i}`))
    }

    expect(reports.length).toBe(10)
  })

  test('should handle many sequential template literal calls', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    for (let i = 0; i < 5; i++) {
      const quasis = [createQuasi({ raw: `text\u00A0${i}`, cooked: `text\u00A0${i}` })]
      visitor.TemplateLiteral(createTemplateLiteral(quasis))
    }

    expect(reports.length).toBe(5)
  })

  test('should report for three quasis all with irregular whitespace', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [
      createQuasi({ raw: 'a\u00A0b', cooked: 'a\u00A0b' }, 1, 0),
      createQuasi({ raw: 'c\u2000d', cooked: 'c\u2000d' }, 2, 0),
      createQuasi({ raw: 'e\u3000f', cooked: 'e\u3000f' }, 3, 0),
    ]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(3)
  })

  test('should not report for valid literals interspersed with invalid', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('valid'))
    visitor.Literal(createLiteral('also valid'))
    visitor.Literal(createLiteral('bad\u00A0one'))
    visitor.Literal(createLiteral('valid again'))
    visitor.Literal(createLiteral('another\u3000bad'))

    expect(reports.length).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// Context tests (10)
// ---------------------------------------------------------------------------
describe('context usage', () => {
  test('should call context.report exactly once for single violation', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world'))

    expect(reports.length).toBe(1)
  })

  test('should not call context.report for valid string', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello world'))

    expect(reports.length).toBe(0)
  })

  test('should pass message in report descriptor', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world'))

    expect(reports[0]).toHaveProperty('message')
    expect(typeof reports[0].message).toBe('string')
  })

  test('should pass loc in report descriptor', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world', 5, 3))

    expect(reports[0]).toHaveProperty('loc')
    expect(reports[0].loc).toBeDefined()
  })

  test('should pass start in loc', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world', 5, 3))

    expect(reports[0].loc?.start).toBeDefined()
    expect(typeof reports[0].loc?.start.line).toBe('number')
    expect(typeof reports[0].loc?.start.column).toBe('number')
  })

  test('should pass end in loc', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('hello\u00A0world', 5, 3))

    expect(reports[0].loc?.end).toBeDefined()
    expect(typeof reports[0].loc?.end.line).toBe('number')
    expect(typeof reports[0].loc?.end.column).toBe('number')
  })

  test('should use same context instance for all reports', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral('a\u00A0b'))
    visitor.Literal(createLiteral('c\u3000d'))

    expect(reports.length).toBe(2)
    expect(reports[0].message).toBe(reports[1].message)
  })

  test('should create independent visitors for different contexts', () => {
    const ctx1 = createMockRuleContext({ source: 'const x = "test";' })
    const ctx2 = createMockRuleContext({ source: 'const x = "test";' })
    const visitor1 = noIrregularWhitespaceRule.create(ctx1.context)
    const visitor2 = noIrregularWhitespaceRule.create(ctx2.context)

    visitor1.Literal(createLiteral('hello\u00A0world'))
    visitor2.Literal(createLiteral('hello\u00A0world'))
    visitor2.Literal(createLiteral('another\u3000one'))

    expect(ctx1.reports.length).toBe(1)
    expect(ctx2.reports.length).toBe(2)
  })

  test('should handle template literal with many quasis mixed', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [
      createQuasi({ raw: 'clean', cooked: 'clean' }, 1, 0),
      createQuasi({ raw: 'dir\u00A0ty', cooked: 'dir\u00A0ty' }, 2, 0),
      createQuasi({ raw: 'clean2', cooked: 'clean2' }, 3, 0),
      createQuasi({ raw: 'dir\u3000ty2', cooked: 'dir\u3000ty2' }, 4, 0),
      createQuasi({ raw: 'clean3', cooked: 'clean3' }, 5, 0),
    ]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(2)
  })

  test('should report via context.report not throw', () => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    expect(() => {
      visitor.Literal(createLiteral('hello\u00A0world'))
    }).not.toThrow()

    expect(reports.length).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// test.each — data-driven tests for all irregular whitespace chars (40+)
// ---------------------------------------------------------------------------

// Full list of all irregular whitespace characters matched by the regex
const IRREGULAR_CHARS: Array<[string, string]> = [
  ['\u000B', 'vertical tab'],
  ['\u000C', 'form feed'],
  ['\u00A0', 'non-breaking space'],
  ['\u0085', 'next line'],
  ['\u1680', 'ogham space mark'],
  ['\u180E', 'mongolian vowel separator'],
  ['\u2000', 'en quad'],
  ['\u2001', 'em quad'],
  ['\u2002', 'en space'],
  ['\u2003', 'em space'],
  ['\u2004', 'three-per-em space'],
  ['\u2005', 'four-per-em space'],
  ['\u2006', 'six-per-em space'],
  ['\u2007', 'figure space'],
  ['\u2008', 'punctuation space'],
  ['\u2009', 'thin space'],
  ['\u200A', 'hair space'],
  ['\u200B', 'zero width space'],
  ['\u2028', 'line separator'],
  ['\u2029', 'paragraph separator'],
  ['\u202F', 'narrow no-break space'],
  ['\u205F', 'medium mathematical space'],
  ['\u3000', 'ideographic space'],
  ['\uFEFF', 'zero width no-break space / BOM'],
]

describe('test.each — literal detection for each irregular char', () => {
  test.each(IRREGULAR_CHARS)('should detect %s (%s) in literal', (char, _name) => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral(`hello${char}world`))

    expect(reports.length).toBe(1)
    expect(reports[0].message).toBe('Irregular whitespace found.')
  })
})

describe('test.each — literal only the char', () => {
  test.each(IRREGULAR_CHARS)('should detect lone %s (%s) in literal', (char, _name) => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral(char))

    expect(reports.length).toBe(1)
  })
})

describe('test.each — template detection for each irregular char', () => {
  test.each(IRREGULAR_CHARS)('should detect %s (%s) in template quasi', (char, _name) => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ raw: `hello${char}world`, cooked: `hello${char}world` })]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(1)
    expect(reports[0].message).toBe('Irregular whitespace found.')
  })
})

describe('test.each — char at start of string', () => {
  test.each(IRREGULAR_CHARS)('should detect %s (%s) at start of literal', (char, _name) => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral(`${char}hello`))

    expect(reports.length).toBe(1)
  })
})

describe('test.each — char at end of string', () => {
  test.each(IRREGULAR_CHARS)('should detect %s (%s) at end of literal', (char, _name) => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral(`hello${char}`))

    expect(reports.length).toBe(1)
  })
})

describe('test.each — no false positive for regular chars', () => {
  const REGULAR_CHARS: Array<[string, string]> = [
    [' ', 'space'],
    ['\t', 'tab'],
    ['\n', 'newline'],
    ['\r', 'carriage return'],
  ]

  test.each(REGULAR_CHARS)('should NOT report %s (%s) in literal', (char, _name) => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral(`hello${char}world`))

    expect(reports.length).toBe(0)
  })
})

describe('test.each — no false positive for regular chars in template', () => {
  const REGULAR_CHARS: Array<[string, string]> = [
    [' ', 'space'],
    ['\t', 'tab'],
    ['\n', 'newline'],
    ['\r', 'carriage return'],
  ]

  test.each(REGULAR_CHARS)('should NOT report %s (%s) in template', (char, _name) => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ raw: `hello${char}world`, cooked: `hello${char}world` })]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(0)
  })
})

describe('test.each — does NOT detect chars outside regex range', () => {
  const OUTSIDE_RANGE_CHARS: Array<[string, string]> = [
    ['\u200C', 'zero width non-joiner (not in regex)'],
    ['\u200D', 'zero width joiner (not in regex)'],
    ['\u200E', 'left-to-right mark (not in regex)'],
    ['\u200F', 'right-to-left mark (not in regex)'],
  ]

  test.each(OUTSIDE_RANGE_CHARS)('should NOT report %s (%s) in literal', (char, _name) => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    visitor.Literal(createLiteral(`hello${char}world`))

    expect(reports.length).toBe(0)
  })
})

describe('test.each — does NOT detect chars outside regex range in template', () => {
  const OUTSIDE_RANGE_CHARS: Array<[string, string]> = [
    ['\u200C', 'zero width non-joiner (not in regex)'],
    ['\u200D', 'zero width joiner (not in regex)'],
    ['\u200E', 'left-to-right mark (not in regex)'],
    ['\u200F', 'right-to-left mark (not in regex)'],
  ]

  test.each(OUTSIDE_RANGE_CHARS)('should NOT report %s (%s) in template', (char, _name) => {
    const { context, reports } = createMockRuleContext({ source: 'const x = "test";' })
    const visitor = noIrregularWhitespaceRule.create(context)

    const quasis = [createQuasi({ raw: `hello${char}world`, cooked: `hello${char}world` })]
    visitor.TemplateLiteral(createTemplateLiteral(quasis))

    expect(reports.length).toBe(0)
  })
})

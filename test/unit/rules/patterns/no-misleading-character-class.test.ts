import { describe, test, expect } from 'vitest'
import { noMisleadingCharacterClassRule } from '../../../../src/rules/patterns/no-misleading-character-class.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createLiteral(value: unknown, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: 15 },
    },
  }
}

function createRegexLiteral(pattern: string, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value: undefined,
    regex: {
      pattern,
      flags: '',
    },
    loc: {
      start: { line, column },
      end: { line, column: pattern.length + 2 },
    },
  }
}

describe('no-misleading-character-class rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noMisleadingCharacterClassRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noMisleadingCharacterClassRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noMisleadingCharacterClassRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noMisleadingCharacterClassRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention character class in description', () => {
      expect(noMisleadingCharacterClassRule.meta.docs?.description.toLowerCase()).toContain(
        'character',
      )
      expect(noMisleadingCharacterClassRule.meta.docs?.description.toLowerCase()).toContain('class')
    })

    test('should mention code points in description', () => {
      expect(noMisleadingCharacterClassRule.meta.docs?.description.toLowerCase()).toContain('code')
    })

    test('should have empty schema', () => {
      expect(noMisleadingCharacterClassRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noMisleadingCharacterClassRule.meta.fixable).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor with Literal method', () => {
      const { context } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      expect(visitor).toHaveProperty('Literal')
    })
  })

  describe('valid regex patterns', () => {
    test('should not report simple regex', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('test'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with regular character class', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('[a-z]'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character range', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('[0-9]'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with unicode escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\\u0041'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with unicode property escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\\p{L}'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with ascii characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('hello world 123'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with special characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('[.*+?{}()|]'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with basic unicode (BMP)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('café'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with emoji (single code point)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('😀'))

      expect(reports.length).toBe(0)
    })

    test('should not report non-regex literals', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createLiteral('hello world'))
      visitor.Literal(createLiteral(42))
      visitor.Literal(createLiteral(true))

      expect(reports.length).toBe(0)
    })

    test('should not report regex without regex property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createLiteral('/test/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex without pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal({
        type: 'Literal',
        regex: {},
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('flag emoji characters', () => {
    test('should report regional indicator symbol A (0x1F1E6)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report regional indicator symbol Z (0x1F1FF)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1FF}'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report middle of regional indicator range', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1F0}'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report flag emoji in character class', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('[\u{1F1E6}]'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report multiple flag emojis', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}\u{1F1F7}'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })
  })

  describe('zero-width joiner characters', () => {
    test('should report zero-width joiner (0x200D)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u200D'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report zero-width joiner in character class', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('[\u200D]'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report zero-width joiner with emoji', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('👨\u200D👩\u200D👧'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })
  })

  describe('variation selector characters', () => {
    test('should report variation selector-16 (0xFE0F)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\uFE0F'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report variation selector-16 in character class', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('[\uFE0F]'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report variation selector with emoji', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('#\uFE0F'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })
  })

  describe('complex regex patterns with misleading characters', () => {
    test('should report regex with flag emoji and zero-width joiner', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}\u200D\u{1F1F7}'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report regex with variation selector and zero-width joiner', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\uFE0F\u200D'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report regex with all misleading character types', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}\u200D\uFE0F'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report regex with misleading character in middle of pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('abc\u200Ddef'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      expect(() => visitor.Literal(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      expect(() => visitor.Literal(undefined)).not.toThrow()
    })

    test('should handle non-Literal node', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = { type: 'Identifier', name: 'test' }
      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\u{1F1E6}' },
      }
      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should handle regex without pattern property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: {},
      }
      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle regex with undefined pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: undefined },
      }
      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle regex with non-string pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: 123 as unknown as string },
      }
      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral(''))

      expect(reports.length).toBe(0)
    })

    test('should handle node without regex property', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        value: 'test',
      }
      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle surrogate pairs correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('😀'))

      expect(reports.length).toBe(0)
    })

    test('should handle mixed valid and invalid characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('hello \u200D world'))

      expect(reports.length).toBe(1)
    })

    test('should handle regex with flags', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\u{1F1E6}', flags: 'gi' },
        loc: {
          start: { line: 1, column: 0 },
          end: { line: 1, column: 15 },
        },
      }
      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should handle patterns just outside misleading ranges', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E5}'))
      visitor.Literal(createRegexLiteral('\u{1F200}'))

      expect(reports.length).toBe(0)
    })

    test('should handle patterns at range boundaries', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}'))
      visitor.Literal(createRegexLiteral('\u{1F1FF}'))

      expect(reports.length).toBe(2)
    })

    test('should handle pattern with multiple misleading characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}\u200D\uFE0F\u{1F1F7}'))

      expect(reports.length).toBe(1)
    })

    test('should handle repeated misleading characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u200D\u200D\u200D'))

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should report correct message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}'))

      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should mention character in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}'))

      expect(reports[0].message.toLowerCase()).toContain('character')
    })

    test('should mention code points in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}'))

      expect(reports[0].message.toLowerCase()).toContain('code')
    })

    test('should mention multiple in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}'))

      expect(reports[0].message.toLowerCase()).toContain('multiple')
    })
  })

  describe('unicode handling', () => {
    test('should handle BMP characters correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('é'))
      visitor.Literal(createRegexLiteral('ñ'))
      visitor.Literal(createRegexLiteral('ç'))
      visitor.Literal(createRegexLiteral('ü'))

      expect(reports.length).toBe(0)
    })

    test('should handle supplementary plane characters (non-misleading)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{10000}'))
      visitor.Literal(createRegexLiteral('\u{20000}'))

      expect(reports.length).toBe(0)
    })

    test('should handle supplementary plane characters (non-misleading)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      // Other supplementary plane characters
      visitor.Literal(createRegexLiteral('\u{10000}')) // Linear B
      visitor.Literal(createRegexLiteral('\u{20000}')) // CJK

      expect(reports.length).toBe(0)
    })

    test('should handle mixed plane characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('a\u{1F1E6}b'))

      expect(reports.length).toBe(1)
    })
  })

  describe('individual regional indicator symbols', () => {
    test('should report regional indicator B (0x1F1E7)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E7}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator C (0x1F1E8)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E8}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator D (0x1F1E9)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E9}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator E (0x1F1EA)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1EA}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator F (0x1F1EB)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1EB}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator G (0x1F1EC)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1EC}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator H (0x1F1ED)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1ED}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator I (0x1F1EE)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1EE}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator J (0x1F1EF)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1EF}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator K (0x1F1F0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1F0}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator L (0x1F1F1)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1F1}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator M (0x1F1F2)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1F2}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator N (0x1F1F3)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1F3}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator O (0x1F1F4)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1F4}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator P (0x1F1F5)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1F5}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator Q (0x1F1F6)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1F6}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator R (0x1F1F7)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1F7}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator S (0x1F1F8)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1F8}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator T (0x1F1F9)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1F9}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator U (0x1F1FA)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1FA}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator V (0x1F1FB)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1FB}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator W (0x1F1FC)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1FC}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator X (0x1F1FD)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1FD}'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator Y (0x1F1FE)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1FE}'))

      expect(reports.length).toBe(1)
    })
  })

  describe('regional indicator boundary tests', () => {
    test('should not report character just before regional indicator range (0x1F1E5)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E5}'))

      expect(reports.length).toBe(0)
    })

    test('should not report character just after regional indicator range (0x1F200)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F200}'))

      expect(reports.length).toBe(0)
    })

    test('should report first character in regional indicator range (0x1F1E6)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}'))

      expect(reports.length).toBe(1)
    })

    test('should report last character in regional indicator range (0x1F1FF)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1FF}'))

      expect(reports.length).toBe(1)
    })

    test('should report second character in regional indicator range (0x1F1E7)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E7}'))

      expect(reports.length).toBe(1)
    })

    test('should report second-to-last character in regional indicator range (0x1F1FE)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1FE}'))

      expect(reports.length).toBe(1)
    })
  })

  describe('zero-width joiner boundary tests', () => {
    test('should not report zero-width non-joiner (0x200C)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u200C'))

      expect(reports.length).toBe(0)
    })

    test('should not report left-to-right mark (0x200E)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u200E'))

      expect(reports.length).toBe(0)
    })

    test('should not report right-to-left mark (0x200F)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u200F'))

      expect(reports.length).toBe(0)
    })

    test('should not report word joiner (0x2060)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u2060'))

      expect(reports.length).toBe(0)
    })

    test('should not report left-to-right embedding (0x202A)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u202A'))

      expect(reports.length).toBe(0)
    })

    test('should report zero-width joiner (0x200D)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u200D'))

      expect(reports.length).toBe(1)
    })
  })

  describe('variation selector boundary tests', () => {
    test('should not report variation selector-15 (0xFE0E)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\uFE0E'))

      expect(reports.length).toBe(0)
    })

    test('should not report variation selector-17 (0xFE10)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\uFE10'))

      expect(reports.length).toBe(0)
    })

    test('should not report presentation form for vertical left white lenticular bracket (0xFE17)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\uFE17'))

      expect(reports.length).toBe(0)
    })

    test('should report variation selector-16 (0xFE0F)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\uFE0F'))

      expect(reports.length).toBe(1)
    })
  })

  describe('flag emoji pairs (country codes)', () => {
    test('should report US flag emoji', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1FA}\u{1F1F8}'))

      expect(reports.length).toBe(1)
    })

    test('should report GB flag emoji', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1EC}\u{1F1E7}'))

      expect(reports.length).toBe(1)
    })

    test('should report JP flag emoji', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1EF}\u{1F1F5}'))

      expect(reports.length).toBe(1)
    })

    test('should report DE flag emoji', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E9}\u{1F1EA}'))

      expect(reports.length).toBe(1)
    })

    test('should report FR flag emoji', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1EB}\u{1F1F7}'))

      expect(reports.length).toBe(1)
    })

    test('should report CN flag emoji', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E8}\u{1F1F3}'))

      expect(reports.length).toBe(1)
    })

    test('should report KR flag emoji', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1F0}\u{1F1F7}'))

      expect(reports.length).toBe(1)
    })

    test('should report BR flag emoji', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E7}\u{1F1F7}'))

      expect(reports.length).toBe(1)
    })

    test('should report IN flag emoji', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1EE}\u{1F1F3}'))

      expect(reports.length).toBe(1)
    })

    test('should report IT flag emoji', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1EE}\u{1F1F9}'))

      expect(reports.length).toBe(1)
    })

    test('should report AU flag emoji', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}\u{1F1FA}'))

      expect(reports.length).toBe(1)
    })

    test('should report CA flag emoji', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E8}\u{1F1E6}'))

      expect(reports.length).toBe(1)
    })

    test('should report MX flag emoji', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1F2}\u{1F1FD}'))

      expect(reports.length).toBe(1)
    })

    test('should report ES flag emoji', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1EA}\u{1F1F8}'))

      expect(reports.length).toBe(1)
    })
  })

  describe('zwj emoji sequences', () => {
    test('should report family emoji (man+woman+girl)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('👨\u200D👩\u200D👧'))

      expect(reports.length).toBe(1)
    })

    test('should report woman technologist', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('👩\u200D💻'))

      expect(reports.length).toBe(1)
    })

    test('should report man technologist', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('👨\u200D💻'))

      expect(reports.length).toBe(1)
    })

    test('should report couple with heart (woman+man)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('👩\u200D❤️\u200D👨'))

      expect(reports.length).toBe(1)
    })

    test('should report handshake emoji (skin tone)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('🤝\u200D'))

      expect(reports.length).toBe(1)
    })

    test('should report person standing with ZWJ', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('🧍\u200D♂️'))

      expect(reports.length).toBe(1)
    })

    test('should report flag + ZWJ + symbol sequence', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}\u200D'))

      expect(reports.length).toBe(1)
    })

    test('should report ZWJ at start of pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u200Dabc'))

      expect(reports.length).toBe(1)
    })

    test('should report ZWJ at end of pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('abc\u200D'))

      expect(reports.length).toBe(1)
    })

    test('should report ZWJ in alternation pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('a|\u200D|b'))

      expect(reports.length).toBe(1)
    })
  })

  describe('variation selector sequences', () => {
    test('should report digit with variation selector', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('1\uFE0F'))

      expect(reports.length).toBe(1)
    })

    test('should report asterisk with variation selector', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('*\uFE0F'))

      expect(reports.length).toBe(1)
    })

    test('should report copyright with variation selector', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('©\uFE0F'))

      expect(reports.length).toBe(1)
    })

    test('should report VS16 at start of pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\uFE0Fabc'))

      expect(reports.length).toBe(1)
    })

    test('should report VS16 at end of pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('abc\uFE0F'))

      expect(reports.length).toBe(1)
    })

    test('should report VS16 in alternation pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('a|\uFE0F|b'))

      expect(reports.length).toBe(1)
    })

    test('should report repeated VS16', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\uFE0F\uFE0F\uFE0F'))

      expect(reports.length).toBe(1)
    })

    test('should report VS16 with emoji presentation character', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('❤\uFE0F'))

      expect(reports.length).toBe(1)
    })

    test('should report VS16 with triangle', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('▶\uFE0F'))

      expect(reports.length).toBe(1)
    })

    test('should report VS16 in negated character class', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('[^\uFE0F]'))

      expect(reports.length).toBe(1)
    })
  })

  describe('combined misleading characters', () => {
    test('should report regional indicator + ZWJ + VS16', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}\u200D\uFE0F'))

      expect(reports.length).toBe(1)
    })

    test('should report VS16 + ZWJ + regional indicator', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\uFE0F\u200D\u{1F1E6}'))

      expect(reports.length).toBe(1)
    })

    test('should report two regional indicators + ZWJ', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}\u{1F1E7}\u200D'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator + VS16', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}\uFE0F'))

      expect(reports.length).toBe(1)
    })

    test('should report ZWJ + VS16 + ZWJ', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u200D\uFE0F\u200D'))

      expect(reports.length).toBe(1)
    })

    test('should report all three types in character class', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('[\u{1F1E6}\u200D\uFE0F]'))

      expect(reports.length).toBe(1)
    })

    test('should report mixed ascii and misleading chars', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('abc\u{1F1E6}def\u200Dghi\uFE0Fjkl'))

      expect(reports.length).toBe(1)
    })

    test('should report ZWJ between two regional indicators', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}\u200D\u{1F1F7}'))

      expect(reports.length).toBe(1)
    })

    test('should report VS16 between ascii chars', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('a\uFE0Fb'))

      expect(reports.length).toBe(1)
    })

    test('should report multiple regional indicators separated by ascii', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}x\u{1F1F7}'))

      expect(reports.length).toBe(1)
    })
  })

  describe('valid supplementary plane characters', () => {
    test('should not report CJK Unified Ideograph (0x4E00)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{4E00}'))

      expect(reports.length).toBe(0)
    })

    test('should not report CJK Extension B character (0x20001)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{20001}'))

      expect(reports.length).toBe(0)
    })

    test('should not report Linear B character (0x1000A)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1000A}'))

      expect(reports.length).toBe(0)
    })

    test('should not report Musical Symbol (0x1D100)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1D100}'))

      expect(reports.length).toBe(0)
    })

    test('should not report Mahjong Tile (0x1F000)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F000}'))

      expect(reports.length).toBe(0)
    })

    test('should not report Domino Tile (0x1F030)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F030}'))

      expect(reports.length).toBe(0)
    })

    test('should not report Playing Card (0x1F0A0)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F0A0}'))

      expect(reports.length).toBe(0)
    })

    test('should not report Enclosed Alphanumeric Supplement (0x1F100)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F100}'))

      expect(reports.length).toBe(0)
    })

    test('should not report emoji just before regional indicator (0x1F3FF)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F3FF}'))

      expect(reports.length).toBe(0)
    })

    test('should not report transport emoji (0x1F680)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F680}'))

      expect(reports.length).toBe(0)
    })

    test('should not report supplemental arrow (0x1F800)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F800}'))

      expect(reports.length).toBe(0)
    })

    test('should not report chess queen (0x1F7D9)', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F7D9}'))

      expect(reports.length).toBe(0)
    })
  })

  describe('valid BMP characters (non-misleading)', () => {
    test('should not report Latin Extended characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('ÄÖÜäöüß'))

      expect(reports.length).toBe(0)
    })

    test('should not report Greek characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('αβγδε'))

      expect(reports.length).toBe(0)
    })

    test('should not report Cyrillic characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('абвгд'))

      expect(reports.length).toBe(0)
    })

    test('should not report Hebrew characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('אבגדה'))

      expect(reports.length).toBe(0)
    })

    test('should not report Arabic characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('ابتثج'))

      expect(reports.length).toBe(0)
    })

    test('should not report Thai characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('กขคง'))

      expect(reports.length).toBe(0)
    })

    test('should not report Hiragana characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('あいうえお'))

      expect(reports.length).toBe(0)
    })

    test('should not report Katakana characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('アイウエオ'))

      expect(reports.length).toBe(0)
    })

    test('should not report currency symbols', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('€£¥¢₹'))

      expect(reports.length).toBe(0)
    })

    test('should not report mathematical operators', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('±×÷≠≤≥'))

      expect(reports.length).toBe(0)
    })
  })

  describe('regex syntax with misleading characters', () => {
    test('should report regional indicator in character class with quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('[\u{1F1E6}]+'))

      expect(reports.length).toBe(1)
    })

    test('should report ZWJ in character class with range', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('[a\u200Dz]'))

      expect(reports.length).toBe(1)
    })

    test('should report VS16 in captured group', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('(\uFE0F)'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator in alternation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('a|\u{1F1E6}|b'))

      expect(reports.length).toBe(1)
    })

    test('should report ZWJ in look-ahead', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('(?=\u200D)'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator with backreference', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('(\u{1F1E6})\\1'))

      expect(reports.length).toBe(1)
    })

    test('should report VS16 in non-capturing group', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('(?:\uFE0F)'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator with optional quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}?'))

      expect(reports.length).toBe(1)
    })

    test('should report ZWJ with star quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u200D*'))

      expect(reports.length).toBe(1)
    })

    test('should report VS16 with plus quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\uFE0F+'))

      expect(reports.length).toBe(1)
    })

    test('should report regional indicator with exact repetition', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}{2}'))

      expect(reports.length).toBe(1)
    })

    test('should report ZWJ with range quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u200D{1,3}'))

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 5 column 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u200D', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at line 100 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\uFE0F', 100, 50))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location at line 1 column 0 for ZWJ', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u200D', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for node without explicit loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\u200D' },
        loc: { start: { line: 3, column: 7 }, end: { line: 3, column: 10 } },
      }
      visitor.Literal(node)

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should preserve end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\uFE0F' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }
      visitor.Literal(node)

      expect(reports[0].loc?.end.column).toBe(20)
    })
  })

  describe('node structure variations', () => {
    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\u{1F1E6}', flags: '' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
        value: undefined,
        raw: '/\u{1F1E6}/',
      }
      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node with null regex', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: null,
      }
      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with regex property but no pattern key', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { flags: 'g' },
      }
      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with empty string pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '', flags: '' },
      }
      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createLiteral(false))

      expect(reports.length).toBe(0)
    })

    test('should handle numeric node value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createLiteral(0))

      expect(reports.length).toBe(0)
    })

    test('should handle null node value', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createLiteral(null))

      expect(reports.length).toBe(0)
    })

    test('should handle node with value as regex-like string', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createLiteral('/\u{1F1E6}/'))

      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested loc object', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\u{1F1E6}' },
        loc: {
          start: { line: 42, column: 99 },
          end: { line: 42, column: 104 },
        },
        parent: { type: 'VariableDeclarator' },
        range: [0, 5],
      }
      visitor.Literal(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
    })
  })

  describe('multiple visitor calls', () => {
    test('should report separately for each misleading regex', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}'))
      visitor.Literal(createRegexLiteral('\u200D'))
      visitor.Literal(createRegexLiteral('\uFE0F'))

      expect(reports.length).toBe(3)
    })

    test('should not report for valid patterns before and after misleading one', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('abc'))
      visitor.Literal(createRegexLiteral('\u200D'))
      visitor.Literal(createRegexLiteral('[a-z]'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should handle mix of valid and invalid across many calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('test'))
      visitor.Literal(createRegexLiteral('\u{1F1E6}'))
      visitor.Literal(createRegexLiteral('[0-9]+'))
      visitor.Literal(createRegexLiteral('\uFE0F'))
      visitor.Literal(createRegexLiteral('\\d+'))
      visitor.Literal(createRegexLiteral('\u200D'))
      visitor.Literal(createRegexLiteral('^hello$'))

      expect(reports.length).toBe(3)
    })

    test('should handle all valid patterns', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('abc'))
      visitor.Literal(createRegexLiteral('[a-z]'))
      visitor.Literal(createRegexLiteral('\\d+'))
      visitor.Literal(createRegexLiteral('^test$'))
      visitor.Literal(createRegexLiteral('foo|bar'))

      expect(reports.length).toBe(0)
    })

    test('should handle same misleading pattern reported multiple times', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}'))
      visitor.Literal(createRegexLiteral('\u{1F1E6}'))
      visitor.Literal(createRegexLiteral('\u{1F1E6}'))

      expect(reports.length).toBe(3)
    })
  })

  describe('regex flags variations', () => {
    test('should report with g flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\u{1F1E6}', flags: 'g' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should report with i flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\u200D', flags: 'i' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should report with m flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\uFE0F', flags: 'm' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should report with s flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\u{1F1E6}', flags: 's' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should report with u flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\u200D', flags: 'u' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should report with y flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\uFE0F', flags: 'y' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should report with combined gi flags', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\u{1F1E6}', flags: 'gi' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should report with combined gimsuy flags', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\u200D', flags: 'gimsuy' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should not report valid pattern with all flags', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: 'test', flags: 'gimsuy' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      }
      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('escaped misleading characters', () => {
    test('should report actual Unicode regional indicator character', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}'))

      expect(reports.length).toBe(1)
    })

    test('should not report literal backslash-u escape in regex', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\\\\u0041'))

      expect(reports.length).toBe(0)
    })

    test('should report when Unicode char appears in regex with escaped backslash', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\\\\\u{1F1E6}'))

      expect(reports.length).toBe(1)
    })

    test('should not report regex with only escaped characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\\n\\t\\r\\f\\v'))

      expect(reports.length).toBe(0)
    })

    test('should report misleading char alongside escaped characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\\n\u200D\\t'))

      expect(reports.length).toBe(1)
    })
  })

  describe('patterns with regex metacharacters', () => {
    test('should report misleading char with anchors', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('^\u{1F1E6}$'))

      expect(reports.length).toBe(1)
    })

    test('should report misleading char with word boundaries', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\\b\u200D\\b'))

      expect(reports.length).toBe(1)
    })

    test('should report misleading char with dot', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('.\uFE0F.'))

      expect(reports.length).toBe(1)
    })

    test('should report misleading char in character class with negation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('[^\u{1F1E6}]'))

      expect(reports.length).toBe(1)
    })

    test('should report misleading char in character class union', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('[a-z\u200D]'))

      expect(reports.length).toBe(1)
    })

    test('should report misleading char with lazy quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}*?'))

      expect(reports.length).toBe(1)
    })

    test('should report misleading char with possessive-style pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u200D+abc'))

      expect(reports.length).toBe(1)
    })

    test('should report misleading char in non-capturing group with alternation', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = /test/;' })
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('(?:\uFE0F|abc)'))

      expect(reports.length).toBe(1)
    })
  })
})

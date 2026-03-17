import { describe, test, expect, vi } from 'vitest'
import { noMisleadingCharacterClassRule } from '../../../../src/rules/patterns/no-misleading-character-class.js'
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
    getSource: () => 'const x = /test/;',
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
      const { context } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      expect(visitor).toHaveProperty('Literal')
    })
  })

  describe('valid regex patterns', () => {
    test('should not report simple regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('test'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with regular character class', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('[a-z]'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character range', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('[0-9]'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with unicode escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\\u0041'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with unicode property escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\\p{L}'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with ascii characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('hello world 123'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with special characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('[.*+?{}()|]'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with basic unicode (BMP)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('café'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with emoji (single code point)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('😀'))

      expect(reports.length).toBe(0)
    })

    test('should not report non-regex literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createLiteral('hello world'))
      visitor.Literal(createLiteral(42))
      visitor.Literal(createLiteral(true))

      expect(reports.length).toBe(0)
    })

    test('should not report regex without regex property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createLiteral('/test/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex without pattern', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report regional indicator symbol Z (0x1F1FF)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1FF}'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report middle of regional indicator range', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1F0}'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report flag emoji in character class', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('[\u{1F1E6}]'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report multiple flag emojis', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}\u{1F1F7}'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })
  })

  describe('zero-width joiner characters', () => {
    test('should report zero-width joiner (0x200D)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u200D'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report zero-width joiner in character class', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('[\u200D]'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report zero-width joiner with emoji', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('👨\u200D👩\u200D👧'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })
  })

  describe('variation selector characters', () => {
    test('should report variation selector-16 (0xFE0F)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\uFE0F'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report variation selector-16 in character class', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('[\uFE0F]'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report variation selector with emoji', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('#\uFE0F'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })
  })

  describe('complex regex patterns with misleading characters', () => {
    test('should report regex with flag emoji and zero-width joiner', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}\u200D\u{1F1F7}'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report regex with variation selector and zero-width joiner', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\uFE0F\u200D'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report regex with all misleading character types', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}\u200D\uFE0F'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report regex with misleading character in middle of pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('abc\u200Ddef'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      expect(() => visitor.Literal(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      expect(() => visitor.Literal(undefined)).not.toThrow()
    })

    test('should handle non-Literal node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = { type: 'Identifier', name: 'test' }
      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\u{1F1E6}' },
      }
      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should handle regex without pattern property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: {},
      }
      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle regex with undefined pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: undefined },
      }
      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle regex with non-string pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: 123 as unknown as string },
      }
      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral(''))

      expect(reports.length).toBe(0)
    })

    test('should handle node without regex property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      const node = {
        type: 'Literal',
        value: 'test',
      }
      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle surrogate pairs correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('😀'))

      expect(reports.length).toBe(0)
    })

    test('should handle mixed valid and invalid characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('hello \u200D world'))

      expect(reports.length).toBe(1)
    })

    test('should handle regex with flags', () => {
      const { context, reports } = createMockContext()
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
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E5}'))
      visitor.Literal(createRegexLiteral('\u{1F200}'))

      expect(reports.length).toBe(0)
    })

    test('should handle patterns at range boundaries', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}'))
      visitor.Literal(createRegexLiteral('\u{1F1FF}'))

      expect(reports.length).toBe(2)
    })

    test('should handle pattern with multiple misleading characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}\u200D\uFE0F\u{1F1F7}'))

      expect(reports.length).toBe(1)
    })

    test('should handle repeated misleading characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u200D\u200D\u200D'))

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should report correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}'))

      expect(reports[0].message).toBe('Character class may contain multiple code points.')
    })

    test('should mention character in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}'))

      expect(reports[0].message.toLowerCase()).toContain('character')
    })

    test('should mention code points in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}'))

      expect(reports[0].message.toLowerCase()).toContain('code')
    })

    test('should mention multiple in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{1F1E6}'))

      expect(reports[0].message.toLowerCase()).toContain('multiple')
    })
  })

  describe('unicode handling', () => {
    test('should handle BMP characters correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('é'))
      visitor.Literal(createRegexLiteral('ñ'))
      visitor.Literal(createRegexLiteral('ç'))
      visitor.Literal(createRegexLiteral('ü'))

      expect(reports.length).toBe(0)
    })

    test('should handle supplementary plane characters (non-misleading)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('\u{10000}'))
      visitor.Literal(createRegexLiteral('\u{20000}'))

      expect(reports.length).toBe(0)
    })

    test('should handle supplementary plane characters (non-misleading)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      // Other supplementary plane characters
      visitor.Literal(createRegexLiteral('\u{10000}')) // Linear B
      visitor.Literal(createRegexLiteral('\u{20000}')) // CJK

      expect(reports.length).toBe(0)
    })

    test('should handle mixed plane characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noMisleadingCharacterClassRule.create(context)

      visitor.Literal(createRegexLiteral('a\u{1F1E6}b'))

      expect(reports.length).toBe(1)
    })
  })
})

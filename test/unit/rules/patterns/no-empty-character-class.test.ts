import { describe, test, expect, vi } from 'vitest'
import { noEmptyCharacterClassRule } from '../../../../src/rules/patterns/no-empty-character-class.js'
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
    getSource: () => 'const regex = /[]/',
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

function createRegExpLiteral(raw: string, line = 1, column = 0): unknown {
  return {
    type: 'RegExpLiteral',
    raw,
    loc: {
      start: { line, column },
      end: { line, column: column + raw.length },
    },
  }
}

function createNonRegExpLiteral(): unknown {
  return {
    type: 'Identifier',
    name: 'regex',
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 5 },
    },
  }
}

describe('no-empty-character-class rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noEmptyCharacterClassRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noEmptyCharacterClassRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noEmptyCharacterClassRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noEmptyCharacterClassRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention empty in description', () => {
      expect(noEmptyCharacterClassRule.meta.docs?.description.toLowerCase()).toContain('empty')
    })

    test('should mention character class in description', () => {
      expect(noEmptyCharacterClassRule.meta.docs?.description.toLowerCase()).toContain(
        'character class',
      )
    })
  })

  describe('create', () => {
    test('should return visitor with RegExpLiteral method', () => {
      const { context } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      expect(visitor).toHaveProperty('RegExpLiteral')
    })

    test('should return visitor with function', () => {
      const { context } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      expect(typeof visitor.RegExpLiteral).toBe('function')
    })
  })

  describe('valid regex patterns', () => {
    test('should not report regex with character class containing characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a-z]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with digit character class', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/\\d/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with word character class', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/\\w/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with whitespace character class', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/\\s/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with negated character class', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[^a-z]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing range', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a-zA-Z]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with multiple character classes', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a-z][0-9]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class and flags', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a-z]/gi'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex without brackets', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/test/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with escaped brackets', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/\\[/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with escaped closing bracket', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/\\]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing special characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[.*+?^${}()|[\\]\\\\]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing space', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[ ]/'))

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid regex patterns', () => {
    test('should report regex with empty character class', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Empty character class')
    })

    test('should report regex with empty character class in middle of pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/a[]b/'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with empty character class at start', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]test/'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with empty character class at end', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/test[]/'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with multiple empty character classes', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[] []/'))

      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      expect(() => visitor.RegExpLiteral(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      expect(() => visitor.RegExpLiteral(undefined)).not.toThrow()
    })

    test('should handle non-RegExpLiteral node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      expect(() => visitor.RegExpLiteral(createNonRegExpLiteral())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without raw property', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      const node = {
        type: 'RegExpLiteral',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined raw property', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      const node = {
        type: 'RegExpLiteral',
        raw: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      const node = createRegExpLiteral('/[]/')
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty string raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(''))

      expect(reports.length).toBe(0)
    })

    test('should handle regex with only opening bracket', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[/'))

      expect(reports.length).toBe(0)
    })

    test('should handle regex with only closing bracket', () => {
      const { context, reports } = createMockContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/]/'))

      expect(reports.length).toBe(0)
    })
  })
})

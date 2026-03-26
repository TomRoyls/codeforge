import { describe, expect, test, vi } from 'vitest'

import type { RuleContext } from '../../../../src/plugins/types.js'

import { noRegexSpacesRule } from '../../../../src/rules/patterns/no-regex-spaces.js'

interface ReportDescriptor {
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  message: string
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = '/test  regex/',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    config: { options: [options] },
    getAST: () => null,
    getComments: () => [],
    getFilePath: () => filePath,
    getSource: () => source,
    getTokens: () => [],
    logger: {
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    },
    report(descriptor: ReportDescriptor) {
      reports.push({
        loc: descriptor.loc,
        message: descriptor.message,
      })
    },
    workspaceRoot: '/src',
  } as unknown as RuleContext

  return { context, reports }
}

function createRegExpLiteral(pattern: string, flags = '', line = 1, column = 0): unknown {
  const raw = `/${pattern}/${flags}`
  return {
    flags,
    loc: {
      end: { column: column + raw.length, line },
      start: { column, line },
    },
    pattern,
    raw,
    type: 'RegExpLiteral',
  }
}

describe('no-regex-spaces rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noRegexSpacesRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noRegexSpacesRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noRegexSpacesRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noRegexSpacesRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention regular expressions in description', () => {
      expect(noRegexSpacesRule.meta.docs?.description.toLowerCase()).toContain('regular')
    })

    test('should mention spaces in description', () => {
      expect(noRegexSpacesRule.meta.docs?.description.toLowerCase()).toContain('spaces')
    })

    test('should have empty schema array', () => {
      expect(noRegexSpacesRule.meta.schema).toEqual([])
    })

    test('should be fixable', () => {
      expect(noRegexSpacesRule.meta.fixable).toBe('code')
    })

    test(String.raw`should mention \s+ in description`, () => {
      expect(noRegexSpacesRule.meta.docs?.description).toContain(String.raw`\s+`)
    })

    test('should have documentation URL', () => {
      expect(noRegexSpacesRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-regex-spaces',
      )
    })
  })

  describe('create', () => {
    test('should return visitor object with RegExpLiteral method', () => {
      const { context } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      expect(visitor).toHaveProperty('RegExpLiteral')
    })
  })

  describe('detecting multiple consecutive spaces', () => {
    test('should report two consecutive spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern'))

      expect(reports.length).toBe(1)
    })

    test('should report three consecutive spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test   pattern'))

      expect(reports.length).toBe(1)
    })

    test('should report five consecutive spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test     pattern'))

      expect(reports.length).toBe(1)
    })

    test('should report with correct count for two spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern'))

      expect(reports[0].message).toContain('(2)')
    })

    test('should report with correct count for five spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test     pattern'))

      expect(reports[0].message).toContain('(5)')
    })

    test(String.raw`should suggest \s+ for multiple spaces`, () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern'))

      expect(reports[0].message).toContain(String.raw`\s+`)
    })

    test('should suggest {N} for multiple spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test   pattern'))

      expect(reports[0].message).toContain('{3}')
    })
  })

  describe('valid code cases', () => {
    test('should not report single space', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test pattern'))

      expect(reports.length).toBe(0)
    })

    test(String.raw`should not report \s escape sequence`, () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`test\spattern`))

      expect(reports.length).toBe(0)
    })

    test(String.raw`should not report \s+ quantifier`, () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`test\s+pattern`))

      expect(reports.length).toBe(0)
    })

    test('should not report {N} quantifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test {3}pattern'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex without spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('testpattern'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with only single spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test pattern more'))

      expect(reports.length).toBe(0)
    })
  })

  describe('multiple space sequences in one regex', () => {
    test('should report two separate instances of double spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  and  also'))

      expect(reports.length).toBe(2)
    })

    test('should report both double and triple spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  and   also'))

      expect(reports.length).toBe(2)
    })

    test('should report correct counts for multiple sequences', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  and   also'))

      expect(reports[0].message).toContain('(2)')
      expect(reports[1].message).toContain('(3)')
    })
  })

  describe('edge cases', () => {
    test('should handle null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      expect(() => visitor.RegExpLiteral(null)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      expect(() => visitor.RegExpLiteral()).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      expect(() => visitor.RegExpLiteral('string')).not.toThrow()
      expect(() => visitor.RegExpLiteral(123)).not.toThrow()

      expect(reports.length).toBe(0)
    })

    test('should handle node without raw property', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      const node = {
        flags: '',
        pattern: 'test',
        type: 'RegExpLiteral',
      }
      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with empty raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      const node = {
        flags: '',
        pattern: '',
        raw: '',
        type: 'RegExpLiteral',
      }
      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      const node = {
        flags: '',
        pattern: 'test',
        raw: undefined,
        type: 'RegExpLiteral',
      }
      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      const node = {
        type: 'Literal',
        value: '/test/',
      }
      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should report correct location for spaces in middle', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern', '', 15, 10))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report correct location for spaces in middle', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern', '', 15, 10))

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report correct location for spaces at end', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  ', '', 20, 15))

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should handle regex with flags', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern', 'gi'))

      expect(reports.length).toBe(1)
    })

    test('should handle empty pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(''))

      expect(reports.length).toBe(0)
    })

    test('should handle only spaces pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('  '))

      expect(reports.length).toBe(0)
    })

    test('should handle spaces preceded by character', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('          '))

      expect(reports.length).toBe(0)
    })
  })

  describe('complex patterns', () => {
    test('should detect spaces in character class', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('[a-z]  test'))

      expect(reports.length).toBe(1)
    })

    test('should detect spaces before quantifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test{2,3}  '))

      expect(reports.length).toBe(1)
    })

    test('should detect spaces after alternation', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a|b  c'))

      expect(reports.length).toBe(1)
    })

    test('should detect spaces in grouped patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('(test)  (more)'))

      expect(reports.length).toBe(1)
    })

    test('should handle spaces after escaped characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`test\  `))

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention space count in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test     pattern'))

      expect(reports[0].message).toContain('(5)')
    })

    test('should mention Multiple consecutive spaces in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern'))

      expect(reports[0].message).toContain('Multiple consecutive spaces')
    })

    test('should mention regex literal in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern'))

      expect(reports[0].message).toContain('regex literal')
    })

    test(String.raw`should suggest \s+ in message`, () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern'))

      expect(reports[0].message).toContain(String.raw`\s+`)
    })

    test('should suggest {N} quantifier in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test   pattern'))

      expect(reports[0].message).toContain('{3}')
    })

    test('should mention Use in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern'))

      expect(reports[0].message).toContain('Use')
    })
  })
})

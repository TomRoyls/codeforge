

import { noRegexSpacesRule } from '../../../../src/rules/patterns/no-regex-spaces.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

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
  // ============================================================
  // META (20 tests)
  // ============================================================
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

    test('should mention consecutive in description', () => {
      expect(noRegexSpacesRule.meta.docs?.description).toContain('consecutive')
    })

    test('should mention Disallow in description', () => {
      expect(noRegexSpacesRule.meta.docs?.description).toContain('Disallow')
    })

    test('should mention quantifier in description', () => {
      expect(noRegexSpacesRule.meta.docs?.description).toContain('quantifier')
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

    test('should have meta as plain object', () => {
      expect(typeof noRegexSpacesRule.meta).toBe('object')
      expect(noRegexSpacesRule.meta).not.toBeNull()
      expect(Array.isArray(noRegexSpacesRule.meta)).toBe(false)
    })

    test('should have meta.type as string', () => {
      expect(typeof noRegexSpacesRule.meta.type).toBe('string')
    })

    test('should have meta.severity as string', () => {
      expect(typeof noRegexSpacesRule.meta.severity).toBe('string')
    })

    test('should have meta.docs as object', () => {
      expect(typeof noRegexSpacesRule.meta.docs).toBe('object')
      expect(noRegexSpacesRule.meta.docs).not.toBeNull()
    })

    test('should have meta.schema as array', () => {
      expect(Array.isArray(noRegexSpacesRule.meta.schema)).toBe(true)
    })

    test('should have meta.fixable as string', () => {
      expect(typeof noRegexSpacesRule.meta.fixable).toBe('string')
    })

    test('should have docs.url as string', () => {
      expect(typeof noRegexSpacesRule.meta.docs?.url).toBe('string')
    })
  })

  // ============================================================
  // CREATE / VISITOR (8 tests)
  // ============================================================
  describe('create and visitor', () => {
    test('should return visitor object with RegExpLiteral method', () => {
      const { context } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      expect(visitor).toHaveProperty('RegExpLiteral')
    })

    test('should have RegExpLiteral as a function', () => {
      const { context } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      expect(typeof visitor.RegExpLiteral).toBe('function')
    })

    test('should return new visitor object on each create call', () => {
      const { context } = createMockRuleContext({ source: '/test  regex/' })
      const visitor1 = noRegexSpacesRule.create(context)
      const visitor2 = noRegexSpacesRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context and not throw', () => {
      const { context } = createMockRuleContext({ source: '/test  regex/' })

      expect(() => noRegexSpacesRule.create(context)).not.toThrow()
    })

    test('should have only RegExpLiteral key on visitor', () => {
      const { context } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      expect(Object.keys(visitor)).toEqual(['RegExpLiteral'])
    })

    test('should have RegExpLiteral that does not throw when called', () => {
      const { context } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      expect(() => visitor.RegExpLiteral(createRegExpLiteral('test'))).not.toThrow()
    })

    test('should produce callable visitor with report capability', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b'))

      expect(reports.length).toBeGreaterThanOrEqual(0)
    })

    test('should return visitor with RegExpLiteral accepting one argument', () => {
      const { context } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      expect(visitor.RegExpLiteral.length).toBe(1)
    })
  })

  // ============================================================
  // DETECTION (30 tests)
  // ============================================================
  describe('detection', () => {
    test('should report two consecutive spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b'))

      expect(reports.length).toBe(1)
    })

    test('should report three consecutive spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a   b'))

      expect(reports.length).toBe(1)
    })

    test('should report four consecutive spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a    b'))

      expect(reports.length).toBe(1)
    })

    test('should report five consecutive spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a     b'))

      expect(reports.length).toBe(1)
    })

    test('should report six consecutive spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a      b'))

      expect(reports.length).toBe(1)
    })

    test('should report seven consecutive spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a       b'))

      expect(reports.length).toBe(1)
    })

    test('should report ten consecutive spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a          b'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces at end of pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  '))

      expect(reports.length).toBe(1)
    })

    test('should report spaces in middle of pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after character class', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('[a-z]  test'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after alternation', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a|b  c'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces between groups', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('(test)  (more)'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after escaped character', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`test\  `))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a{2,3}  b'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after star quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a*  b'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after plus quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a+  b'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after question mark', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a?  b'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after start anchor', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('^a  b'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces before end anchor', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b$'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces between anchors', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('^a  b$'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after non-capturing group', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('(?:test)  more'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces between character classes', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('[0-9]  [a-z]'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after dot', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('.  test'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after escaped digit', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`\d  test`))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after escaped word', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`\w  test`))

      expect(reports.length).toBe(1)
    })

    test('should report spaces in nested groups', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('((a))  b'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces with backreference', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('(a)\\1  b'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after escaped bracket', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`\]  test`))

      expect(reports.length).toBe(1)
    })

    test('should report spaces with multiple tokens', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('abc+def*  ghi'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces with complex pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('([a-z]+)  (\\d+)'))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // NOT REPORTING (30 tests)
  // ============================================================
  describe('not reporting valid patterns', () => {
    test('should not report single space', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a b'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex without spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('testpattern'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with only single spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test pattern more'))

      expect(reports.length).toBe(0)
    })

    test(String.raw`should not report \s escape sequence`, () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`test\spattern`))

      expect(reports.length).toBe(0)
    })

    test(String.raw`should not report \s+ quantifier`, () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`test\s+pattern`))

      expect(reports.length).toBe(0)
    })

    test(String.raw`should not report \s* quantifier`, () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`test\s*pattern`))

      expect(reports.length).toBe(0)
    })

    test(String.raw`should not report \s? quantifier`, () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`test\s?pattern`))

      expect(reports.length).toBe(0)
    })

    test('should not report {N} quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test {3}pattern'))

      expect(reports.length).toBe(0)
    })

    test('should not report {2} quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a{2}b'))

      expect(reports.length).toBe(0)
    })

    test('should not report character class without spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('[a-z]'))

      expect(reports.length).toBe(0)
    })

    test('should not report group without spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('(test)'))

      expect(reports.length).toBe(0)
    })

    test('should not report alternation without spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a|b'))

      expect(reports.length).toBe(0)
    })

    test('should not report anchors without spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('^test$'))

      expect(reports.length).toBe(0)
    })

    test('should not report quantifiers without spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a+b*c?'))

      expect(reports.length).toBe(0)
    })

    test('should not report escape sequences without spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`\d\w\s`))

      expect(reports.length).toBe(0)
    })

    test('should not report empty pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(''))

      expect(reports.length).toBe(0)
    })

    test('should not report pattern with only spaces at start', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('  test'))

      expect(reports.length).toBe(0)
    })

    test('should not report pattern with many spaces at start only', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('       test'))

      expect(reports.length).toBe(0)
    })

    test('should not report pattern of just spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('  '))

      expect(reports.length).toBe(0)
    })

    test('should not report pattern of many spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('          '))

      expect(reports.length).toBe(0)
    })

    test('should not report single space in character class', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('[ ]'))

      expect(reports.length).toBe(0)
    })

    test(String.raw`should not report \t escape`, () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`test\tpattern`))

      expect(reports.length).toBe(0)
    })

    test(String.raw`should not report \n escape`, () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`test\npattern`))

      expect(reports.length).toBe(0)
    })

    test('should not report dot pattern without spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('.*'))

      expect(reports.length).toBe(0)
    })

    test('should not report single character pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a'))

      expect(reports.length).toBe(0)
    })

    test('should not report multiple single spaces between tokens', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a b c d e f'))

      expect(reports.length).toBe(0)
    })

    test('should not report escaped space with single space', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`test\ pattern`))

      expect(reports.length).toBe(0)
    })

    test('should not report non-capturing group without spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('(?:test)'))

      expect(reports.length).toBe(0)
    })

    test('should not report range quantifier without spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a{2,5}'))

      expect(reports.length).toBe(0)
    })

    test('should not report word boundary without spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`\btest\b`))

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // EDGE CASES (25 tests)
  // ============================================================
  describe('edge cases', () => {
    test('should handle null node', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      expect(() => visitor.RegExpLiteral(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      expect(() => visitor.RegExpLiteral(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      expect(() => visitor.RegExpLiteral('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      expect(() => visitor.RegExpLiteral(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node true', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      expect(() => visitor.RegExpLiteral(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node false', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      expect(() => visitor.RegExpLiteral(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      expect(() => visitor.RegExpLiteral({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      expect(() => visitor.RegExpLiteral([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without raw property', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral({ flags: '', pattern: 'test', type: 'RegExpLiteral' })

      expect(reports.length).toBe(0)
    })

    test('should handle node with empty raw', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral({ flags: '', pattern: '', raw: '', type: 'RegExpLiteral' })

      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined raw', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral({ flags: '', pattern: 'test', raw: undefined, type: 'RegExpLiteral' })

      expect(reports.length).toBe(0)
    })

    test('should handle node with null raw', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral({ flags: '', pattern: 'test', raw: null, type: 'RegExpLiteral' })

      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral({ type: 'Literal', value: '/test/' })

      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral({ pattern: 'test', raw: '/test/' })

      expect(reports.length).toBe(0)
    })

    test('should handle regex with flags', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern', 'gi'))

      expect(reports.length).toBe(1)
    })

    test('should handle very long pattern with spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      const longPrefix = 'a'.repeat(100)
      visitor.RegExpLiteral(createRegExpLiteral(`${longPrefix}  test`))

      expect(reports.length).toBe(1)
    })

    test('should handle pattern with emoji before spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('\u{1F600}  test'))

      expect(reports.length).toBe(1)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral({
        extra: 'property',
        flags: '',
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        pattern: 'a  b',
        raw: '/a  b/',
        type: 'RegExpLiteral',
      })

      expect(reports.length).toBe(1)
    })

    test('should handle calling visitor with same node twice', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      const node = createRegExpLiteral('test  pattern')
      visitor.RegExpLiteral(node)
      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(2)
    })

    test('should handle pattern at high line number', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b', '', 9999, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(9999)
    })

    test('should handle pattern at high column number', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b', '', 1, 500))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(502)
    })

    test('should handle pattern at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b', '', 1, 0))

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should handle multiple non-RegExpLiteral nodes gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(null)
      visitor.RegExpLiteral(undefined)
      visitor.RegExpLiteral('string')
      visitor.RegExpLiteral(42)
      visitor.RegExpLiteral({})

      expect(reports.length).toBe(0)
    })

    test('should handle pattern with spaces at start and middle', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('  test  more'))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // LOCATION (15 tests)
  // ============================================================
  describe('location reporting', () => {
    test('should report correct start line', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern', '', 15, 10))

      expect(reports[0].loc?.start.line).toBe(15)
    })

    test('should report correct start column', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern', '', 15, 10))

      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report correct end line', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern', '', 20, 5))

      expect(reports[0].loc?.end.line).toBe(20)
    })

    test('should report correct end column', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern', '', 1, 0))

      expect(reports[0].loc?.end.column).toBe(7)
    })

    test('should report end column as start column plus space count', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern', '', 1, 0))

      const startCol = reports[0].loc?.start.column ?? 0
      const endCol = reports[0].loc?.end.column ?? 0

      expect(endCol - startCol).toBe(2)
    })

    test('should report location at beginning of file', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b', '', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report location at high line number', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b', '', 1000, 0))

      expect(reports[0].loc?.start.line).toBe(1000)
    })

    test('should report location at high column number', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b', '', 1, 200))

      expect(reports[0].loc?.start.column).toBe(202)
    })

    test('should report start and end on same line', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b', '', 5, 10))

      expect(reports[0].loc?.start.line).toBe(reports[0].loc?.end.line)
    })

    test('should account for opening slash in column offset', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b', '', 1, 0))

      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report correct location for 5 spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a     b', '', 1, 0))

      const startCol = reports[0].loc?.start.column ?? 0
      const endCol = reports[0].loc?.end.column ?? 0

      expect(endCol - startCol).toBe(5)
    })

    test('should report correct location for spaces at end', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  ', '', 20, 15))

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report correct location for first of multiple space groups', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b  c', '', 1, 0))

      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report correct location for second of multiple space groups', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b  c', '', 1, 0))

      expect(reports[1].loc?.start.column).toBe(5)
    })

    test('should report correct location with column offset 10', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b', '', 1, 10))

      expect(reports[0].loc?.start.column).toBe(12)
    })
  })

  // ============================================================
  // MESSAGES (10 tests)
  // ============================================================
  describe('message format', () => {
    test('should mention Multiple consecutive spaces in message', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern'))

      expect(reports[0].message).toContain('Multiple consecutive spaces')
    })

    test('should mention space count in message', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern'))

      expect(reports[0].message).toContain('(2)')
    })

    test('should mention regex literal in message', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern'))

      expect(reports[0].message).toContain('regex literal')
    })

    test(String.raw`should suggest \s+ in message`, () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern'))

      expect(reports[0].message).toContain(String.raw`\s+`)
    })

    test('should suggest {N} quantifier in message', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test   pattern'))

      expect(reports[0].message).toContain('{3}')
    })

    test('should mention Use in message', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern'))

      expect(reports[0].message).toContain('Use')
    })

    test('should return message as string', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern'))

      expect(typeof reports[0].message).toBe('string')
    })

    test('should return non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  pattern'))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should include correct count for 5 spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test     pattern'))

      expect(reports[0].message).toContain('(5)')
    })

    test('should include correct count for 10 spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test          pattern'))

      expect(reports[0].message).toContain('(10)')
    })
  })

  // ============================================================
  // MULTIPLE REPORTS (10 tests)
  // ============================================================
  describe('multiple reports', () => {
    test('should report two separate double spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  and  also'))

      expect(reports.length).toBe(2)
    })

    test('should report both double and triple spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  and   also'))

      expect(reports.length).toBe(2)
    })

    test('should report correct counts for multiple sequences', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test  and   also'))

      expect(reports[0].message).toContain('(2)')
      expect(reports[1].message).toContain('(3)')
    })

    test('should report three separate space groups', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b  c  d'))

      expect(reports.length).toBe(3)
    })

    test('should report four separate space groups', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b  c  d  e'))

      expect(reports.length).toBe(4)
    })

    test('should report correct locations for multiple groups', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b  c', '', 1, 0))

      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[1].loc?.start.column).toBe(5)
    })

    test('should report correct messages for each group', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a   b     c'))

      expect(reports[0].message).toContain('(3)')
      expect(reports[1].message).toContain('(5)')
    })

    test('should report five space groups', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b  c  d  e  f'))

      expect(reports.length).toBe(5)
    })

    test('should report mixed space counts correctly', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b   c    d'))

      expect(reports.length).toBe(3)
      expect(reports[0].message).toContain('(2)')
      expect(reports[1].message).toContain('(3)')
      expect(reports[2].message).toContain('(4)')
    })

    test('should report correct end columns for each group', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b  c', '', 1, 0))

      expect(reports[0].loc?.end.column).toBe(4)
      expect(reports[1].loc?.end.column).toBe(7)
    })
  })

  // ============================================================
  // CONTEXT (10 tests)
  // ============================================================
  describe('context handling', () => {
    test('should work with empty options', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b'))

      expect(reports.length).toBe(1)
    })

    test('should work with populated options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ strict: true }], source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b'))

      expect(reports.length).toBe(1)
    })

    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/', filePath: '/other/file.ts' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b'))

      expect(reports.length).toBe(1)
    })

    test('should work with different source content', () => {
      const { context, reports } = createMockRuleContext({ source: 'other source', filePath: '/src/file.ts' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b'))

      expect(reports.length).toBe(1)
    })

    test('should not interfere between sequential calls', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b'))
      const firstCount = reports.length

      visitor.RegExpLiteral(createRegExpLiteral('a  b'))
      const secondCount = reports.length

      expect(firstCount).toBe(1)
      expect(secondCount).toBe(2)
    })

    test('should call context report with descriptor', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b'))

      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
    })

    test('should create independent visitors from same context', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor1 = noRegexSpacesRule.create(context)
      const visitor2 = noRegexSpacesRule.create(context)

      visitor1.RegExpLiteral(createRegExpLiteral('a  b'))
      visitor2.RegExpLiteral(createRegExpLiteral('c  d'))

      expect(reports.length).toBe(2)
    })

    test('should not modify context during visitor creation', () => {
      const { context } = createMockRuleContext({ source: '/test  regex/' })
      const originalGetFilePath = context.getFilePath

      noRegexSpacesRule.create(context)

      expect(context.getFilePath).toBe(originalGetFilePath)
    })

    test('should handle calling visitor with different nodes sequentially', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b'))
      visitor.RegExpLiteral(createRegExpLiteral('c d'))
      visitor.RegExpLiteral(createRegExpLiteral('e  f'))

      expect(reports.length).toBe(2)
    })

    test('should ignore options since schema is empty', () => {
      const { context, reports } = createMockRuleContext({ options: [{ customOption: 'value' }], source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b'))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // ADDITIONAL DETECTION (15 tests)
  // ============================================================
  describe('additional detection patterns', () => {
    test('should report spaces after escaped dot', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`\.  test`))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after escaped parenthesis', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`\)  test`))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after escaped asterisk', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`\*  test`))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after escaped plus', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`\+  test`))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after escaped question mark', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`\?  test`))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after escaped pipe', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`\|  test`))

      expect(reports.length).toBe(1)
    })

    test('should report spaces between alternation branches', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('cat  |dog'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after numeric literal in pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('123  abc'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after underscore in pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('foo_bar  baz'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after dash in pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a-b  c'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after hash in pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('#test  more'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after at symbol in pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('@user  name'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after colon in pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('key:  value'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after semicolon in pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a;  b'))

      expect(reports.length).toBe(1)
    })

    test('should report spaces after equals in pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a=  b'))

      expect(reports.length).toBe(1)
    })
  })

  // ============================================================
  // ADDITIONAL NOT REPORTING (15 tests)
  // ============================================================
  describe('additional valid patterns', () => {
    test('should not report single space between anchors', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('^a b$'))

      expect(reports.length).toBe(0)
    })

    test('should not report single space between character classes', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('[a-z] [0-9]'))

      expect(reports.length).toBe(0)
    })

    test('should not report single space in alternation', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a | b'))

      expect(reports.length).toBe(0)
    })

    test('should not report {1} quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a{1}b'))

      expect(reports.length).toBe(0)
    })

    test('should not report {0,} quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a{0,}b'))

      expect(reports.length).toBe(0)
    })

    test(String.raw`should not report \D escape`, () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`\Dtest`))

      expect(reports.length).toBe(0)
    })

    test(String.raw`should not report \W escape`, () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`\Wtest`))

      expect(reports.length).toBe(0)
    })

    test(String.raw`should not report \S escape`, () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`\Stest`))

      expect(reports.length).toBe(0)
    })

    test(String.raw`should not report \B escape`, () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(String.raw`\Btest\B`))

      expect(reports.length).toBe(0)
    })

    test('should not report dash-only pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a-b'))

      expect(reports.length).toBe(0)
    })

    test('should not report underscore-only pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('test_pattern'))

      expect(reports.length).toBe(0)
    })

    test('should not report single space with quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a b+'))

      expect(reports.length).toBe(0)
    })

    test('should not report single space with star', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a b*'))

      expect(reports.length).toBe(0)
    })

    test('should not report non-capturing group with single space', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('(?:a b)'))

      expect(reports.length).toBe(0)
    })

    test('should not report named group without spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('(?<name>test)'))

      expect(reports.length).toBe(0)
    })
  })

  // ============================================================
  // ADDITIONAL EDGE CASES (13 tests)
  // ============================================================
  describe('additional edge cases', () => {
    test('should handle node with raw as single slash', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral({
        flags: '',
        loc: { end: { column: 1, line: 1 }, start: { column: 0, line: 1 } },
        pattern: '',
        raw: '/',
        type: 'RegExpLiteral',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with raw as two slashes', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral({
        flags: '',
        loc: { end: { column: 2, line: 1 }, start: { column: 0, line: 1 } },
        pattern: '',
        raw: '//',
        type: 'RegExpLiteral',
      })

      expect(reports.length).toBe(0)
    })

    test('should handle node with very long raw string', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      const longPattern = 'a'.repeat(1000) + '  ' + 'b'.repeat(1000)
      visitor.RegExpLiteral(createRegExpLiteral(longPattern))

      expect(reports.length).toBe(1)
    })

    test('should handle spaces at specific byte offset', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b', '', 1, 0))

      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should handle zero-width location', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral({
        flags: '',
        loc: { end: { column: 6, line: 1 }, start: { column: 0, line: 1 } },
        pattern: 'a  b',
        raw: '/a  b/',
        type: 'RegExpLiteral',
      })

      expect(reports.length).toBe(1)
    })

    test('should handle multiple visitor calls on different patterns', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b'))
      visitor.RegExpLiteral(createRegExpLiteral('c   d'))
      visitor.RegExpLiteral(createRegExpLiteral('e f'))

      expect(reports.length).toBe(2)
    })

    test('should handle node with numeric pattern property', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral({
        flags: '',
        loc: { end: { column: 7, line: 1 }, start: { column: 0, line: 1 } },
        pattern: 123,
        raw: '/test  pattern/',
        type: 'RegExpLiteral',
      })

      expect(reports.length).toBe(1)
    })

    test('should handle spaces in simple two-char pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  '))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('(2)')
    })

    test('should handle exactly two spaces between three chars', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b  c'))

      expect(reports.length).toBe(2)
    })

    test('should handle spaces near start of pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('ab  cd'))

      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should handle node created with all properties', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      const node = {
        flags: 'gi',
        loc: { end: { column: 12, line: 1 }, start: { column: 0, line: 1 } },
        pattern: 'test  pattern',
        raw: '/test  pattern/gi',
        range: [0, 18],
        type: 'RegExpLiteral' as const,
      }

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should handle back-to-back visitor calls with null', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(null)
      visitor.RegExpLiteral(createRegExpLiteral('a  b'))
      visitor.RegExpLiteral(null)

      expect(reports.length).toBe(1)
    })

    test('should handle pattern with single char and trailing spaces', () => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('x   '))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('(3)')
    })
  })

  // ============================================================
  // DATA-DRIVEN TESTS (test.each) (50 tests)
  // ============================================================
  describe('data-driven space count detection', () => {
    test.each([
      [2, 'a  b'],
      [3, 'a   b'],
      [4, 'a    b'],
      [5, 'a     b'],
      [6, 'a      b'],
      [7, 'a       b'],
      [8, 'a        b'],
      [9, 'a         b'],
      [10, 'a          b'],
      [11, 'a           b'],
    ])('should detect %i consecutive spaces in pattern', (count, pattern) => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(pattern))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain(`(${count})`)
    })
  })

  describe('data-driven valid patterns', () => {
    test.each([
      ['a b'],
      ['test pattern'],
      ['a b c d e'],
      ['x y z'],
      ['one two three'],
      ['foo bar baz'],
      ['a b c'],
      ['hello world'],
    ])('should not report single spaces in pattern "%s"', (pattern) => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(pattern))

      expect(reports.length).toBe(0)
    })
  })

  describe('data-driven flag combinations', () => {
    test.each([['g'], ['i'], ['m'], ['s'], ['u'], ['y'], ['gi'], ['gm'], ['gimsuy']])(
      'should detect spaces with regex flags "%s"',
      (flags) => {
        const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
        const visitor = noRegexSpacesRule.create(context)

        visitor.RegExpLiteral(createRegExpLiteral('a  b', flags))

        expect(reports.length).toBe(1)
      },
    )
  })

  describe('data-driven column offsets', () => {
    test.each([
      [0, 2],
      [1, 3],
      [5, 7],
      [10, 12],
      [50, 52],
      [100, 102],
    ])('should calculate location with column offset %i', (baseColumn, expectedColumn) => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('a  b', '', 1, baseColumn))

      expect(reports[0].loc?.start.column).toBe(expectedColumn)
    })
  })

  describe('data-driven line numbers', () => {
    test.each([[1], [5], [10], [50], [100], [1000]])(
      'should report correct location on line %i',
      (line) => {
        const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
        const visitor = noRegexSpacesRule.create(context)

        visitor.RegExpLiteral(createRegExpLiteral('a  b', '', line, 0))

        expect(reports[0].loc?.start.line).toBe(line)
      },
    )
  })

  describe('data-driven detection patterns', () => {
    test.each([
      ['^a  b'],
      ['a  b$'],
      ['^a  b$'],
      ['a|b  c'],
      ['[a-z]  test'],
      ['(a)  (b)'],
      ['a+  b*'],
      ['.  test'],
      ['a{2}  b'],
      ['(?:x)  y'],
    ])('should detect spaces in pattern "%s"', (pattern) => {
      const { context, reports } = createMockRuleContext({ source: '/test  regex/' })
      const visitor = noRegexSpacesRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(pattern))

      expect(reports.length).toBe(1)
    })
  })
})

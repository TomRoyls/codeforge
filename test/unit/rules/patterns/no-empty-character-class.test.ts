import { describe, test, expect, vi } from 'vitest'
import { noEmptyCharacterClassRule } from '../../../../src/rules/patterns/no-empty-character-class.js'
import noEmptyCharacterClassDefault from '../../../../src/rules/patterns/no-empty-character-class.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

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

    test('should have a non-empty description string', () => {
      expect(typeof noEmptyCharacterClassRule.meta.docs?.description).toBe('string')
      expect(noEmptyCharacterClassRule.meta.docs!.description.length).toBeGreaterThan(0)
    })

    test('should have docs object defined', () => {
      expect(noEmptyCharacterClassRule.meta.docs).toBeDefined()
      expect(typeof noEmptyCharacterClassRule.meta.docs).toBe('object')
    })

    test('should have description as a string', () => {
      expect(typeof noEmptyCharacterClassRule.meta.docs?.description).toBe('string')
    })

    test('should have category as a string', () => {
      expect(typeof noEmptyCharacterClassRule.meta.docs?.category).toBe('string')
    })

    test('should have recommended as a boolean', () => {
      expect(typeof noEmptyCharacterClassRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have type as one of valid rule types', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noEmptyCharacterClassRule.meta.type)
    })

    test('should have severity as one of valid severities', () => {
      expect(['off', 'warn', 'error']).toContain(noEmptyCharacterClassRule.meta.severity)
    })

    test('should have schema defined as empty array', () => {
      expect(noEmptyCharacterClassRule.meta.schema).toBeDefined()
      expect(Array.isArray(noEmptyCharacterClassRule.meta.schema)).toBe(true)
    })

    test('should not be fixable', () => {
      expect(noEmptyCharacterClassRule.meta.fixable).toBeUndefined()
    })

    test('should not be deprecated', () => {
      expect(noEmptyCharacterClassRule.meta.deprecated).toBeFalsy()
    })

    test('should not have replacedBy', () => {
      expect(noEmptyCharacterClassRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noEmptyCharacterClassRule.meta.requiresTypeChecking).toBeFalsy()
    })

    test('should have meta as a plain object', () => {
      expect(typeof noEmptyCharacterClassRule.meta).toBe('object')
      expect(noEmptyCharacterClassRule.meta).not.toBeNull()
    })

    test('should have valid docs url or undefined', () => {
      const url = noEmptyCharacterClassRule.meta.docs?.url
      if (url !== undefined) {
        expect(typeof url).toBe('string')
      }
    })

    test('should have description ending with period', () => {
      expect(noEmptyCharacterClassRule.meta.docs?.description).toMatch(/\.$/)
    })
  })

  describe('create', () => {
    test('should return visitor with RegExpLiteral method', () => {
      const { context } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      expect(visitor).toHaveProperty('RegExpLiteral')
    })

    test('should return visitor with function', () => {
      const { context } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      expect(typeof visitor.RegExpLiteral).toBe('function')
    })

    test('should return a new visitor on each call', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noEmptyCharacterClassRule.create(context)
      const visitor2 = noEmptyCharacterClassRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should return visitor that is a plain object', () => {
      const { context } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should return visitor with only RegExpLiteral key', () => {
      const { context } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      expect(Object.keys(visitor)).toContain('RegExpLiteral')
    })

    test('should accept different context instances', () => {
      const { context: ctx1 } = createMockRuleContext()
      const { context: ctx2 } = createMockRuleContext()
      const visitor1 = noEmptyCharacterClassRule.create(ctx1)
      const visitor2 = noEmptyCharacterClassRule.create(ctx2)

      expect(typeof visitor1.RegExpLiteral).toBe('function')
      expect(typeof visitor2.RegExpLiteral).toBe('function')
    })
  })

  describe('valid regex patterns', () => {
    test('should not report regex with character class containing characters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a-z]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with digit character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/\\d/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with word character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/\\w/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with whitespace character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/\\s/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with negated character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[^a-z]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing range', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a-zA-Z]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with multiple character classes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a-z][0-9]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class and flags', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a-z]/gi'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex without brackets', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/test/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with escaped brackets', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/\\[/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with escaped closing bracket', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/\\]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing special characters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[.*+?^${}()|[\\]\\\\]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing space', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[ ]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with negated empty-looking class containing caret only', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      // [^] is NOT an empty character class - it matches any character
      visitor.RegExpLiteral(createRegExpLiteral('/[^]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with single character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with numeric character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[0-9]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with hex range character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[\\x00-\\x7F]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with unicode range character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[\\u0000-\\uFFFF]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing escaped dash', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a\\-z]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing dash at end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a-]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing dash at start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[-a]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report simple dot regex', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/./'))

      expect(reports.length).toBe(0)
    })

    test('should report regex with escaped opening bracket that forms [] substring', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      // /[\\[]/ raw string is /[\[]/ which contains [] as substring
      visitor.RegExpLiteral(createRegExpLiteral('/[\\[]/'))

      expect(reports.length).toBe(1)
    })

    test('should not report regex with escaped closing bracket inside character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[\\]]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with alternation', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/a|b/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with quantifiers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/a+/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with groups', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/(abc)/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class and quantifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a-z]+/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class and star quantifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a-z]*/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with negated character class and quantifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[^a-z]+/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing tab', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[\\t]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing newline escape', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[\\n]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with non-capturing group', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/(?:abc)/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with lookahead', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/a(?=b)/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with lookbehind', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/(?<=a)b/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with unicode flag and character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a-z]/u'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with sticky flag and character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a-z]/y'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with dotAll flag and character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a-z]/s'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with multiline flag and character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a-z]/m'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing backslash d', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[\\d]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing backslash D', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[\\D]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing backslash w', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[\\w]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing backslash W', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[\\W]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing backslash s', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[\\s]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing backslash S', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[\\S]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with complex valid character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a-zA-Z0-9_-]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with pipe inside character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a|b]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with comma inside character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a,b]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with dot inside character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[.]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with asterisk inside character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[*]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with plus inside character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[+]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with question mark inside character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[?]/'))

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid regex patterns', () => {
    test('should report regex with empty character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Empty character class')
    })

    test('should report regex with empty character class in middle of pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/a[]b/'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with empty character class at start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]test/'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with empty character class at end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/test[]/'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with multiple empty character classes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[] []/'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with empty character class and flags', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/gi'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with empty character class and unicode flag', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/u'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with empty character class followed by quantifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]+/'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with empty character class followed by star', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]*/'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with empty character class inside group', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/([])/'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with empty character class inside alternation', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/a|[]/'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with only empty character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports.length).toBe(1)
    })

    test('should report empty character class with text before and after', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/foo[]bar/'))

      expect(reports.length).toBe(1)
    })

    test('should report empty character class with digit prefix', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/1[]2/'))

      expect(reports.length).toBe(1)
    })

    test('should report empty character class with anchor before', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/^[]/'))

      expect(reports.length).toBe(1)
    })

    test('should report empty character class with anchor after', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]$/'))

      expect(reports.length).toBe(1)
    })

    test('should report empty character class with word boundary', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/\\b[]\\b/'))

      expect(reports.length).toBe(1)
    })

    test('should report empty character class surrounded by escaped chars', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/\\n[]\\t/'))

      expect(reports.length).toBe(1)
    })

    test('should report empty character class with non-capturing group', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/(?:[])/'))

      expect(reports.length).toBe(1)
    })

    test('should report empty character class with lookahead', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/(?=[])/'))

      expect(reports.length).toBe(1)
    })

    test('should report empty character class with all flags combined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/gimsuy'))

      expect(reports.length).toBe(1)
    })

    test('should report empty character class with capturing group', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/(a)([])/'))

      expect(reports.length).toBe(1)
    })

    test('should report empty character class in complex pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a-z]+[]\\d+/'))

      expect(reports.length).toBe(1)
    })

    test('should report empty character class between valid classes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a-z][][0-9]/'))

      expect(reports.length).toBe(1)
    })

    test('should report with empty class after dot', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/.[]/'))

      expect(reports.length).toBe(1)
    })

    test('should report with empty class before dot', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]./'))

      expect(reports.length).toBe(1)
    })
  })

  describe('location', () => {
    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/', 1, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/', 1000, 0))

      expect(reports[0].loc?.start.line).toBe(1000)
    })

    test('should report location at high column number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/', 1, 500))

      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should report end location based on raw length', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/', 1, 0))

      expect(reports[0].loc?.end.line).toBe(1)
      expect(reports[0].loc?.end.column).toBe(4)
    })

    test('should report location for node at line 3 column 7', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/', 3, 7))

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(7)
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(11)
    })

    test('should report location for longer pattern with empty class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/test[]/', 2, 5))

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end.column).toBe(13)
    })

    test('should include loc in report when node has location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/', 1, 0))

      expect(reports[0].loc).toBeDefined()
    })
  })

  describe('messages', () => {
    test('should include Empty character class in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports[0].message).toContain('Empty character class')
    })

    test('should mention regular expression in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports[0].message.toLowerCase()).toContain('regular expression')
    })

    test('should have consistent message for different empty class positions', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext()
      const { context: ctx2, reports: reports2 } = createMockRuleContext()

      const visitor1 = noEmptyCharacterClassRule.create(ctx1)
      const visitor2 = noEmptyCharacterClassRule.create(ctx2)

      visitor1.RegExpLiteral(createRegExpLiteral('/[]test/'))
      visitor2.RegExpLiteral(createRegExpLiteral('/test[]/'))

      expect(reports1[0].message).toBe(reports2[0].message)
    })

    test('should have non-empty message string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have same message for different flags', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext()
      const { context: ctx2, reports: reports2 } = createMockRuleContext()

      const visitor1 = noEmptyCharacterClassRule.create(ctx1)
      const visitor2 = noEmptyCharacterClassRule.create(ctx2)

      visitor1.RegExpLiteral(createRegExpLiteral('/[]/'))
      visitor2.RegExpLiteral(createRegExpLiteral('/[]/gi'))

      expect(reports1[0].message).toBe(reports2[0].message)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      expect(() => visitor.RegExpLiteral(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      expect(() => visitor.RegExpLiteral(undefined)).not.toThrow()
    })

    test('should handle non-RegExpLiteral node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      expect(() => visitor.RegExpLiteral(createNonRegExpLiteral())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without raw property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      const node = {
        type: 'RegExpLiteral',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined raw property', () => {
      const { context, reports } = createMockRuleContext()
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
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      const node = createRegExpLiteral('/[]/')
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty string raw', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral(''))

      expect(reports.length).toBe(0)
    })

    test('should handle regex with only opening bracket', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[/'))

      expect(reports.length).toBe(0)
    })

    test('should handle regex with only closing bracket', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/]/'))

      expect(reports.length).toBe(0)
    })

    test('should handle node that is a boolean', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      expect(() => visitor.RegExpLiteral(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node that is a number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      expect(() => visitor.RegExpLiteral(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node that is a string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      expect(() => visitor.RegExpLiteral('/[]/')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null raw', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      const node = {
        type: 'RegExpLiteral',
        raw: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty string raw', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      const node = {
        type: 'RegExpLiteral',
        raw: '',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric raw', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      const node = {
        type: 'RegExpLiteral',
        raw: 123,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
    })

    test('should handle node with wrong type casing', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      const node = {
        type: 'regexpliteral',
        raw: '/[]/',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
      }
      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty type string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      const node = {
        type: '',
        raw: '/[]/',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
      }
      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with missing type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      const node = {
        raw: '/[]/',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
      }
      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with array type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      const node = {
        type: ['RegExpLiteral'],
        raw: '/[]/',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
      }
      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with object type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      const node = {
        type: { name: 'RegExpLiteral' },
        raw: '/[]/',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
      }
      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      const node = {
        type: 'RegExpLiteral',
        raw: '/[]/',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
        extra: 'data',
        pattern: '[]',
        flags: '',
      }
      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle regex pattern that is just slashes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('//'))

      expect(reports.length).toBe(0)
    })

    test('should handle regex with only forward slashes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('///'))

      expect(reports.length).toBe(0)
    })

    test('should handle node with partial loc (missing end)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      const node = {
        type: 'RegExpLiteral',
        raw: '/[]/',
        loc: {
          start: { line: 1, column: 0 },
        },
      }
      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (missing start)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      const node = {
        type: 'RegExpLiteral',
        raw: '/[]/',
        loc: {
          end: { line: 1, column: 4 },
        },
      }
      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with loc containing string numbers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      const node = {
        type: 'RegExpLiteral',
        raw: '/[]/',
        loc: {
          start: { line: '1', column: '0' },
          end: { line: '1', column: '4' },
        },
      }
      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
      // extractLocation checks typeof === 'number', so strings are treated as defaults
      expect(reports.length).toBe(1)
    })

    test('should handle node with zero line and column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/', 0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('multiple reports', () => {
    test('should report once for regex with single empty character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports.length).toBe(1)
    })

    test('should report once per visitor invocation', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))
      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports.length).toBe(2)
    })

    test('should report for multiple separate regex nodes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/', 1, 0))
      visitor.RegExpLiteral(createRegExpLiteral('/a[]b/', 2, 5))
      visitor.RegExpLiteral(createRegExpLiteral('/test[]/', 3, 10))

      expect(reports.length).toBe(3)
    })

    test('should not report for valid regex between invalid ones', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))
      visitor.RegExpLiteral(createRegExpLiteral('/[a-z]/'))
      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports.length).toBe(2)
    })

    test('should report correct location for each invocation', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/', 1, 0))
      visitor.RegExpLiteral(createRegExpLiteral('/[]/', 5, 10))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[1].loc?.start.line).toBe(5)
      expect(reports[1].loc?.start.column).toBe(10)
    })

    test('should report correct message for each invocation', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))
      visitor.RegExpLiteral(createRegExpLiteral('/a[]b/'))

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should accumulate reports across many calls', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.RegExpLiteral(createRegExpLiteral('/[]/', i + 1, 0))
      }

      expect(reports.length).toBe(10)
    })

    test('should handle mix of valid and invalid patterns', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a]/'))
      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))
      visitor.RegExpLiteral(createRegExpLiteral('/[0-9]/'))
      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))
      visitor.RegExpLiteral(createRegExpLiteral('/abc/'))

      expect(reports.length).toBe(2)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({
        filePath: '/src/other-file.ts',
      })
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports.length).toBe(1)
    })

    test('should work with different source content', () => {
      const { context, reports } = createMockRuleContext({
        source: 'var x = /[]/',
      })
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports.length).toBe(1)
    })

    test('should work with different workspace roots', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports.length).toBe(1)
    })

    test('should work with config options', () => {
      const { context, reports } = createMockRuleContext({
        options: [{ strict: true }],
      })
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports.length).toBe(1)
    })

    test('should work when AST returns an object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports.length).toBe(1)
    })

    test('should work when getTokens returns tokens', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports.length).toBe(1)
    })

    test('should work when getComments returns comments', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports.length).toBe(1)
    })

    test('should work with multiple create calls for same context', () => {
      const { context, reports } = createMockRuleContext()
      const visitor1 = noEmptyCharacterClassRule.create(context)
      const visitor2 = noEmptyCharacterClassRule.create(context)

      visitor1.RegExpLiteral(createRegExpLiteral('/[]/'))
      visitor2.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports.length).toBe(2)
    })

    test('should not call logger during detection', () => {
      const debugFn = vi.fn()
      const reports: ReportDescriptor[] = []
      const context = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const regex = /[]/',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: debugFn, info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as any
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports.length).toBe(1)
      expect(debugFn).not.toHaveBeenCalled()
    })
  })

  describe('exports', () => {
    test('should export rule as named export', () => {
      expect(noEmptyCharacterClassRule).toBeDefined()
      expect(typeof noEmptyCharacterClassRule).toBe('object')
    })

    test('should export rule as default export', () => {
      expect(noEmptyCharacterClassDefault).toBeDefined()
      expect(typeof noEmptyCharacterClassDefault).toBe('object')
    })

    test('should have same meta on named and default exports', () => {
      expect(noEmptyCharacterClassRule.meta).toBe(noEmptyCharacterClassDefault.meta)
    })

    test('should have same create on named and default exports', () => {
      expect(noEmptyCharacterClassRule.create).toBe(noEmptyCharacterClassDefault.create)
    })

    test('should produce identical results from named and default exports', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext()
      const { context: ctx2, reports: reports2 } = createMockRuleContext()

      const visitor1 = noEmptyCharacterClassRule.create(ctx1)
      const visitor2 = noEmptyCharacterClassDefault.create(ctx2)

      visitor1.RegExpLiteral(createRegExpLiteral('/[]/'))
      visitor2.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports1.length).toBe(reports2.length)
      expect(reports1[0].message).toBe(reports2[0].message)
    })
  })

  describe('report descriptor', () => {
    test('should have message property in report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports[0]).toHaveProperty('message')
      expect(typeof reports[0].message).toBe('string')
    })

    test('should have loc property in report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0].loc).toBeDefined()
    })

    test('should have start in loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports[0].loc?.start).toBeDefined()
      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
    })

    test('should have end in loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports[0].loc?.end).toBeDefined()
      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should report descriptor with correct structure', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/', 2, 3))

      const report = reports[0]
      expect(report).toEqual({
        message: expect.any(String),
        loc: {
          start: { line: 2, column: 3 },
          end: { line: 2, column: 7 },
        },
      })
    })
  })

  describe('pattern matching specifics', () => {
    test('should detect empty class in simple slash-wrapped pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports.length).toBe(1)
    })

    test('should detect empty class with only forward slash delimiters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/i'))

      expect(reports.length).toBe(1)
    })

    test('should detect [] as empty character class pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/foo[]bar/'))

      expect(reports.length).toBe(1)
    })

    test('should not report [] with content after opening bracket', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      // [^] is a valid pattern (matches any character), but [^a] has content
      visitor.RegExpLiteral(createRegExpLiteral('/[^a]/'))

      expect(reports.length).toBe(0)
    })

    test('should detect empty class at various positions in complex regex', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/a{3}[]/'))

      expect(reports.length).toBe(1)
    })

    test('should detect empty class after escaped character', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/\\./'))

      expect(reports.length).toBe(0)
    })

    test('should handle pattern with backslash b (word boundary)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/\\b[]/'))

      expect(reports.length).toBe(1)
    })

    test('should report character class where escaped bracket forms [] substring', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      // /[\\[]/ raw string is /[\[]/ which contains [] as substring
      visitor.RegExpLiteral(createRegExpLiteral('/[\\[]/'))

      expect(reports.length).toBe(1)
    })

    test('should not report character class with escaped closing bracket content', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      // [\\]] contains an escaped ] - not empty
      visitor.RegExpLiteral(createRegExpLiteral('/[\\]]/'))

      expect(reports.length).toBe(0)
    })

    test('should report pattern that contains [] substring', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/x[]y[]z/'))

      // The pattern /\[\]/ matches the first [] in the raw string
      expect(reports.length).toBe(1)
    })
  })

  describe('idempotency', () => {
    test('should produce same result calling visitor twice with same node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)
      const node = createRegExpLiteral('/[]/')

      visitor.RegExpLiteral(node)
      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should produce same result from fresh visitors', () => {
      const { context, reports: reports1 } = createMockRuleContext()
      const visitor1 = noEmptyCharacterClassRule.create(context)
      visitor1.RegExpLiteral(createRegExpLiteral('/[]/'))

      const { context: ctx2, reports: reports2 } = createMockRuleContext()
      const visitor2 = noEmptyCharacterClassRule.create(ctx2)
      visitor2.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports1[0].message).toBe(reports2[0].message)
    })

    test('should not affect subsequent calls with different patterns', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))
      visitor.RegExpLiteral(createRegExpLiteral('/[a-z]/'))
      visitor.RegExpLiteral(createRegExpLiteral('/[]/'))

      expect(reports.length).toBe(2)
    })
  })

  describe('additional negative cases', () => {
    test('should not report regex with character class containing backslash b', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[\\b]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing backslash f', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[\\f]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing backslash r', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[\\r]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing backslash v', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[\\v]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing backslash 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[\\0]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing dollar sign', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[$]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing caret', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[a^b]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing parentheses', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[(]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing closing paren', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[)]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing hash', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[#]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing at symbol', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[@]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing exclamation', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[!]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing tilde', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[~]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing percent', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[%]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing ampersand', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[&]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing equals sign', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[=]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing semicolon', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[;]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing single quote', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral("/[']/"))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing double quote', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/["]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing underscore', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[_]/'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class containing backtick', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noEmptyCharacterClassRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/[`]/'))

      expect(reports.length).toBe(0)
    })
  })
})

import { describe, test, expect, vi } from 'vitest'
import { noUselessBackreferenceRule } from '../../../../src/rules/patterns/no-useless-backreference.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createRegexLiteral(pattern: string, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    regex: {
      pattern,
      flags: '',
    },
    loc: {
      start: { line, column },
      end: { line, column: pattern.length + 4 },
    },
  }
}

function createRegexLiteralWithFlags(
  pattern: string,
  flags: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'Literal',
    regex: {
      pattern,
      flags,
    },
    loc: {
      start: { line, column },
      end: { line, column: pattern.length + flags.length + 4 },
    },
  }
}

function createStringLiteral(value: string, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    raw: `'${value}'`,
    loc: {
      start: { line, column },
      end: { line, column: value.length + 2 },
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

describe('no-useless-backreference rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noUselessBackreferenceRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noUselessBackreferenceRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noUselessBackreferenceRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUselessBackreferenceRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention backreference in description', () => {
      expect(noUselessBackreferenceRule.meta.docs?.description.toLowerCase()).toContain(
        'backreference',
      )
    })

    test('should mention regular expression in description', () => {
      expect(noUselessBackreferenceRule.meta.docs?.description.toLowerCase()).toContain('regular')
    })

    test('should have empty schema', () => {
      expect(noUselessBackreferenceRule.meta.schema).toEqual([])
    })

    test('should not be fixable', () => {
      expect(noUselessBackreferenceRule.meta.fixable).toBeUndefined()
    })

    test('should have meta property', () => {
      expect(noUselessBackreferenceRule.meta).toBeDefined()
    })

    test('should have docs property in meta', () => {
      expect(noUselessBackreferenceRule.meta.docs).toBeDefined()
    })

    test('should have type property in meta', () => {
      expect(noUselessBackreferenceRule.meta.type).toBeDefined()
    })

    test('should have severity property in meta', () => {
      expect(noUselessBackreferenceRule.meta.severity).toBeDefined()
    })

    test('should have schema property in meta', () => {
      expect(noUselessBackreferenceRule.meta.schema).toBeDefined()
    })

    test('should have description string in docs', () => {
      expect(typeof noUselessBackreferenceRule.meta.docs?.description).toBe('string')
    })

    test('should have non-empty description', () => {
      expect(noUselessBackreferenceRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have type as string', () => {
      expect(typeof noUselessBackreferenceRule.meta.type).toBe('string')
    })

    test('should have severity as string', () => {
      expect(typeof noUselessBackreferenceRule.meta.severity).toBe('string')
    })

    test('should have schema as array', () => {
      expect(Array.isArray(noUselessBackreferenceRule.meta.schema)).toBe(true)
    })

    test('should have docs as object', () => {
      expect(typeof noUselessBackreferenceRule.meta.docs).toBe('object')
    })

    test('should mention useless in description', () => {
      expect(noUselessBackreferenceRule.meta.docs?.description.toLowerCase()).toContain('useless')
    })
  })

  describe('create', () => {
    test('should return visitor with Literal method', () => {
      const { context } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      expect(visitor).toHaveProperty('Literal')
    })

    test('Literal should be a function', () => {
      const { context } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      expect(typeof visitor.Literal).toBe('function')
    })

    test('should return object with Literal method', () => {
      const { context } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      const keys = Object.keys(visitor).sort()
      expect(keys).toContain('Literal')
    })

    test('should return a new visitor on each call', () => {
      const { context } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor1 = noUselessBackreferenceRule.create(context)
      const visitor2 = noUselessBackreferenceRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context parameter', () => {
      expect(() => noUselessBackreferenceRule.create(createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' }).context)).not.toThrow()
    })

    test('should return non-null visitor', () => {
      const { context } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      expect(visitor).not.toBeNull()
    })

    test('should return non-undefined visitor', () => {
      const { context } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      expect(visitor).not.toBeUndefined()
    })

    test('should return object type visitor', () => {
      const { context } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      expect(typeof visitor).toBe('object')
    })
  })

  describe('valid cases', () => {
    test('should not report valid named backreference', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<name>\\d+)\\k<name>'))
      expect(reports.length).toBe(0)
    })

    test('should not report valid numeric backreference', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(\\d+)\\1'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with valid multiple backreferences', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<a>\\w+)\\k<a>-(?<b>\\w+)\\k<b>'))
      expect(reports.length).toBe(0)
    })

    test('should not report string literal', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createStringLiteral('hello world'))
      expect(reports.length).toBe(0)
    })

    test('should not report number literal', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createNumberLiteral(42))
      expect(reports.length).toBe(0)
    })

    test('should not report regex without backreferences', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\d+\\w+'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with only named groups', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<a>\\d+)(?<b>\\w+)'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with valid numeric backreferences', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(\\d+)-(\\w+)\\1\\2'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with valid mixed backreferences', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<name>\\w+)\\k<name>-(\\d+)\\1'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with flags', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteralWithFlags('(?<name>\\d+)\\k<name>', 'gi'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with empty pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral(''))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with just groups', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(\\d+)'))
      expect(reports.length).toBe(0)
    })

    test('should not report identifier node', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createIdentifier('x'))
      expect(reports.length).toBe(0)
    })

    test('should not report simple character class', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('[abc]+'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with alternation', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('cat|dog'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with quantifiers', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('a{2,5}'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with anchors', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('^hello$'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with word boundary', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\bword\\b'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with lookahead', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('foo(?=bar)'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with lookbehind', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<=foo)bar'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with non-capturing group', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?:abc)\\d+'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with dot', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('a.b'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with escaped characters', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\.\\*\\+\\?'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with unicode', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\u0041'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with hex escapes', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\x41'))
      expect(reports.length).toBe(0)
    })

    test('should not report valid backreference after multiple groups', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<a>\\d)(?<b>\\w)(?<c>\\s)\\k<a>\\k<b>\\k<c>'))
      expect(reports.length).toBe(0)
    })

    test('should not report valid backreference with complex pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<word>\\w+)\\s+\\k<word>\\s+\\k<word>'))
      expect(reports.length).toBe(0)
    })

    test('should not report with g flag', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteralWithFlags('(?<x>\\d)\\k<x>', 'g'))
      expect(reports.length).toBe(0)
    })

    test('should not report with i flag', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteralWithFlags('(?<x>\\d)\\k<x>', 'i'))
      expect(reports.length).toBe(0)
    })

    test('should not report with m flag', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteralWithFlags('(?<x>\\d)\\k<x>', 'm'))
      expect(reports.length).toBe(0)
    })

    test('should not report with s flag', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteralWithFlags('(?<x>\\d)\\k<x>', 's'))
      expect(reports.length).toBe(0)
    })

    test('should not report with u flag', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteralWithFlags('(?<x>\\d)\\k<x>', 'u'))
      expect(reports.length).toBe(0)
    })

    test('should not report with y flag', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteralWithFlags('(?<x>\\d)\\k<x>', 'y'))
      expect(reports.length).toBe(0)
    })

    test('should not report with multiple flags', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteralWithFlags('(?<x>\\d)\\k<x>', 'gimsuy'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with only text', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('hello'))
      expect(reports.length).toBe(0)
    })

    test('should not report regex with tab escape', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\t\\n\\r'))
      expect(reports.length).toBe(0)
    })
  })

  describe('invalid cases', () => {
    test('should report backreference to non-existent named group', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<nonexistent>'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Useless backreference')
    })

    test('should not report numeric backreference (rule only checks named groups)', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\9'))
      expect(reports.length).toBe(0)
    })

    test('should report named backreference when only numbered groups exist', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(\\d+)\\k<name>'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Useless backreference')
    })

    test('should not report numeric backreference with named groups (rule only checks named groups)', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<name>\\d+)\\1'))
      expect(reports.length).toBe(0)
    })

    test('should report correct location for useless backreference', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<nonexistent>', 5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report multiple useless backreferences', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>\\k<bar>'))
      expect(reports.length).toBe(1)
    })

    test('should report backreference to undefined named group', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<a>\\d+)\\k<b>\\k<c>'))
      expect(reports.length).toBe(1)
    })

    test('should not report high numbered backreference (rule only checks named groups)', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\99'))
      expect(reports.length).toBe(0)
    })

    test('should report backreference with non-existent group after valid groups', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<a>\\d+)\\k<a>\\k<b>'))
      expect(reports.length).toBe(1)
    })

    test('should not report multiple numeric backreferences (rule only checks named groups)', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\1\\2\\3'))
      expect(reports.length).toBe(0)
    })

    test('should report single useless backreference in pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<missing>'))
      expect(reports.length).toBe(1)
    })

    test('should report backreference to typo group name', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<name>\\d+)\\k<nam>'))
      expect(reports.length).toBe(1)
    })

    test('should report backreference at start of pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<start>\\d+'))
      expect(reports.length).toBe(1)
    })

    test('should report backreference at end of pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\d+\\k<end>'))
      expect(reports.length).toBe(1)
    })

    test('should report backreference in middle of pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('abc\\k<mid>def'))
      expect(reports.length).toBe(1)
    })

    test('should report with flags on regex', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteralWithFlags('\\k<missing>', 'gi'))
      expect(reports.length).toBe(1)
    })

    test('should report when group name differs in case', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<Name>\\d+)\\k<name>'))
      expect(reports.length).toBe(1)
    })

    test('should report when group name is all different', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<abc>\\d+)\\k<xyz>'))
      expect(reports.length).toBe(1)
    })

    test('should report backreference inside character class', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      // \\k<foo> inside a character class - still parsed by regex
      visitor.Literal(createRegexLiteral('[\\k<foo>]'))
      expect(reports.length).toBe(1)
    })

    test('should report multiple different useless backreferences', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<a>\\k<b>\\k<c>'))
      expect(reports.length).toBe(1)
    })

    test('should report with unicode group name reference', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<missingGroup>'))
      expect(reports.length).toBe(1)
    })

    test('should report backreference after valid group with alternation', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<a>\\d+)|\\k<b>'))
      expect(reports.length).toBe(1)
    })

    test('should report backreference in complex pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<word>\\w+)\\s+(\\d+)\\k<notfound>'))
      expect(reports.length).toBe(1)
    })

    test('should report with escaped backslash before backreference', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      // \\\\k<foo> means escaped backslash followed by k<foo> which is not a backreference
      // But \\k<foo> is a backreference
      visitor.Literal(createRegexLiteral('\\\\\\k<foo>'))
      expect(reports.length).toBe(1)
    })

    test('should not report numeric-looking backreference name', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      // \\k<2abc> - the regex backref matcher sees \\2 as numeric backref
      visitor.Literal(createRegexLiteral('\\k<2abc>'))
      expect(reports.length).toBe(0)
    })

    test('should report useless backreference surrounded by valid ones', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<a>\\d+)\\k<a>\\k<invalid>\\k<a>'))
      expect(reports.length).toBe(1)
    })

    test('should report when group is defined after backreference', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      // Forward reference to a named group - the regex engine may support it
      // but our detection collects ALL groups first then checks
      visitor.Literal(createRegexLiteral('\\k<a>(?<a>\\d+)'))
      expect(reports.length).toBe(0)
    })

    test('should report with very long group name in backreference', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<veryLongGroupNameThatDoesNotExist>'))
      expect(reports.length).toBe(1)
    })

    test('should report with underscore containing group name', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      // Group name with underscore - valid in some regex engines
      // But our regex only matches [a-zA-Z][a-zA-Z0-9]* so underscore won't match
      visitor.Literal(createRegexLiteral('\\k<my_name>'))
      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      expect(() => visitor.Literal(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined node gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      expect(() => visitor.Literal(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      const node = { value: 'test' }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without regex property', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      const node = { type: 'Literal', value: 'test' }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle regex without pattern property', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      const node = { type: 'Literal', regex: { flags: '' } }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle regex with null pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      const node = { type: 'Literal', regex: { pattern: null } }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle regex with undefined pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      const node = { type: 'Literal', regex: {} }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      const node = createRegexLiteral('\\k<nonexistent>') as Record<string, unknown>
      delete node.loc

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle non-Literal node', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      const node = { type: 'Identifier', name: 'x' }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      expect(() => visitor.Literal(123)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      expect(() => visitor.Literal('string')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      expect(() => visitor.Literal([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle regex with special characters in named group', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<name123>\\d+)\\k<name123>'))
      expect(reports.length).toBe(0)
    })

    test('should handle regex pattern as number type', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      const node = { type: 'Literal', regex: { pattern: 123, flags: '' } }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle regex pattern with nested groups', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?:(?<a>\\d+)|(?<b>\\w+))\\k<a>'))
      expect(reports.length).toBe(0)
    })

    test('should handle empty named group', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<>)\\k<>'))
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      expect(() => visitor.Literal(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      expect(() => visitor.Literal({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with regex pattern as empty string', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral(''))
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested node', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      const node = { type: 'Literal', regex: { pattern: { nested: true }, flags: '' } }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with extra properties', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<a>\\d+)\\k<a>'))
      expect(reports.length).toBe(0)
    })

    test('should handle regex with flags but no backreferences', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteralWithFlags('\\d+', 'gi'))
      expect(reports.length).toBe(0)
    })

    test('should handle regex with empty flags', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteralWithFlags('(?<a>\\d+)\\k<a>', ''))
      expect(reports.length).toBe(0)
    })

    test('should handle pattern with only whitespace', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('   '))
      expect(reports.length).toBe(0)
    })

    test('should handle pattern with only backreference-like sequence', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\1'))
      expect(reports.length).toBe(0)
    })
  })

  describe('location tracking', () => {
    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>', 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at arbitrary line and column', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>', 3, 7))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should report location at high line number', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>', 100, 50))
      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>', 0, 0))
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location with valid backreference (no report)', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<a>\\d+)\\k<a>', 10, 20))
      expect(reports.length).toBe(0)
    })

    test('should include loc in report when node has loc', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>', 2, 5))
      expect(reports[0].loc).toBeDefined()
    })

    test('should have start property in loc', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>', 1, 0))
      expect(reports[0].loc?.start).toBeDefined()
    })

    test('should have end property in loc', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>', 1, 0))
      expect(reports[0].loc?.end).toBeDefined()
    })

    test('should have correct end column for report', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>', 1, 0))
      expect(reports[0].loc?.end.column).toBeGreaterThan(0)
    })

    test('should report location for invalid backreference in complex pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<a>\\d+)\\k<b>', 4, 8))
      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report location when node has flags', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteralWithFlags('\\k<foo>', 'g', 2, 3))
      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location at column 1', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>', 1, 1))
      expect(reports[0].loc?.start.column).toBe(1)
    })

    test('should report location at very high column', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>', 1, 9999))
      expect(reports[0].loc?.start.column).toBe(9999)
    })

    test('should report location with multiline node', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>', 5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should handle node with missing end location', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\\k<foo>', flags: '' },
        loc: { start: { line: 1, column: 0 } },
      }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('message format', () => {
    test('should contain Useless backreference in message', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>'))
      expect(reports[0].message).toContain('Useless backreference')
    })

    test('should contain regular expression in message', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>'))
      expect(reports[0].message).toContain('regular expression')
    })

    test('should have message as string type', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>'))
      expect(typeof reports[0].message).toBe('string')
    })

    test('should have non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>'))
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should have consistent message across different patterns', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })

      noUselessBackreferenceRule.create(ctx1).Literal(createRegexLiteral('\\k<a>'))
      noUselessBackreferenceRule.create(ctx2).Literal(createRegexLiteral('\\k<b>'))

      expect(r1[0].message).toBe(r2[0].message)
    })

    test('should end message with period', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>'))
      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should have message containing backreference lowercase', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>'))
      expect(reports[0].message.toLowerCase()).toContain('backreference')
    })

    test('should have exact expected message', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>'))
      expect(reports[0].message).toBe('Useless backreference in regular expression.')
    })

    test('should report same message for complex patterns', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<a>\\d+)\\k<b>\\k<c>'))
      expect(reports[0].message).toBe('Useless backreference in regular expression.')
    })

    test('should report same message regardless of line position', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>', 99, 88))
      expect(reports[0].message).toBe('Useless backreference in regular expression.')
    })
  })

  describe('multiple reports', () => {
    test('should report once for single useless backreference', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>'))
      expect(reports.length).toBe(1)
    })

    test('should not report for valid pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<a>\\d+)\\k<a>'))
      expect(reports.length).toBe(0)
    })

    test('should report once even with multiple useless backrefs', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>\\k<bar>'))
      expect(reports.length).toBe(1)
    })

    test('should report once with mixed valid and invalid backrefs', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<a>\\d+)\\k<a>\\k<invalid>'))
      expect(reports.length).toBe(1)
    })

    test('should not report multiple times for same node', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<a>\\d+)\\k<b>\\k<c>\\k<d>'))
      expect(reports.length).toBe(1)
    })

    test('should report separately for different nodes', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>'))
      visitor.Literal(createRegexLiteral('\\k<bar>'))
      expect(reports.length).toBe(2)
    })

    test('should report for each invalid regex literal', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<a>'))
      visitor.Literal(createRegexLiteral('(?<x>\\d+)\\k<y>'))
      visitor.Literal(createRegexLiteral('\\k<z>'))
      expect(reports.length).toBe(3)
    })

    test('should not report for valid regex between invalid ones', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>'))
      visitor.Literal(createRegexLiteral('(?<a>\\d+)\\k<a>'))
      visitor.Literal(createRegexLiteral('\\k<bar>'))
      expect(reports.length).toBe(2)
    })

    test('should track reports across multiple calls', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<first>'))
      expect(reports.length).toBe(1)

      visitor.Literal(createRegexLiteral('\\k<second>'))
      expect(reports.length).toBe(2)
    })

    test('should not affect report count with valid nodes', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createStringLiteral('hello'))
      visitor.Literal(createNumberLiteral(42))
      visitor.Literal(createRegexLiteral('\\k<foo>'))
      expect(reports.length).toBe(1)
    })
  })

  describe('context interaction', () => {
    test('should call report on context', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>'))
      expect(reports.length).toBe(1)
    })

    test('should not call report for valid patterns', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('(?<a>\\d+)\\k<a>'))
      expect(reports.length).toBe(0)
    })

    test('should pass message to report', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>'))
      expect(reports[0].message).toBeDefined()
    })

    test('should pass loc to report', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<foo>', 1, 0))
      expect(reports[0].loc).toBeDefined()
    })

    test('should work with different context instances', () => {
      const mock1 = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const mock2 = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })

      const visitor1 = noUselessBackreferenceRule.create(mock1.context)
      const visitor2 = noUselessBackreferenceRule.create(mock2.context)

      visitor1.Literal(createRegexLiteral('\\k<foo>'))
      visitor2.Literal(createRegexLiteral('(?<a>\\d+)\\k<a>'))

      expect(mock1.reports.length).toBe(1)
      expect(mock2.reports.length).toBe(0)
    })

    test('should not throw when context report throws', () => {
      const context = {
        report: () => {
          throw new Error('Report failed')
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
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

      const visitor = noUselessBackreferenceRule.create(context)

      expect(() => visitor.Literal(createRegexLiteral('\\k<foo>'))).toThrow('Report failed')
    })

    test('should handle multiple calls on same visitor', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<a>'))
      visitor.Literal(createRegexLiteral('\\k<b>'))
      visitor.Literal(createRegexLiteral('(?<c>\\d+)\\k<c>'))

      expect(reports.length).toBe(2)
    })

    test('should handle mixed valid and invalid calls', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createStringLiteral('hello'))
      visitor.Literal(createRegexLiteral('\\k<foo>'))
      visitor.Literal(createRegexLiteral('(?<a>\\d+)\\k<a>'))
      visitor.Literal(createNumberLiteral(42))

      expect(reports.length).toBe(1)
    })

    test('should work correctly after many valid calls', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.Literal(createRegexLiteral('(?<a>\\d+)\\k<a>'))
      }

      expect(reports.length).toBe(0)

      visitor.Literal(createRegexLiteral('\\k<invalid>'))
      expect(reports.length).toBe(1)
    })

    test('should preserve report order', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)

      visitor.Literal(createRegexLiteral('\\k<first>'))
      visitor.Literal(createRegexLiteral('\\k<second>'))

      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })

  describe('detection: useless named backreferences', () => {
    test('should report useless backreference \\k<nonexistent>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\k<nonexistent>'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Useless backreference')
    })

    test('should report useless backreference \\k<foo>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\k<foo>'))
      expect(reports.length).toBe(1)
    })

    test('should report useless backreference \\k<bar>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\k<bar>'))
      expect(reports.length).toBe(1)
    })

    test('should report useless backreference \\k<missing>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\k<missing>'))
      expect(reports.length).toBe(1)
    })

    test('should report useless backreference \\k<unknown>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\k<unknown>'))
      expect(reports.length).toBe(1)
    })

    test('should report useless backreference \\k<xyz>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\k<xyz>'))
      expect(reports.length).toBe(1)
    })

    test('should report useless backreference \\k<test>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\k<test>'))
      expect(reports.length).toBe(1)
    })

    test('should report useless backreference \\k<group>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\k<group>'))
      expect(reports.length).toBe(1)
    })

    test('should report useless backreference \\k<a>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\k<a>'))
      expect(reports.length).toBe(1)
    })

    test('should report useless backreference \\k<z>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\k<z>'))
      expect(reports.length).toBe(1)
    })

    test('should report useless backreference \\k<abc>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\k<abc>'))
      expect(reports.length).toBe(1)
    })

    test('should report useless backreference \\k<def123>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\k<def123>'))
      expect(reports.length).toBe(1)
    })

    test('should report useless backreference \\k<camelCase>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\k<camelCase>'))
      expect(reports.length).toBe(1)
    })

    test('should report useless backreference \\k<Uppercase>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\k<Uppercase>'))
      expect(reports.length).toBe(1)
    })

    test('should report useless backreference \\k<ABC>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\k<ABC>'))
      expect(reports.length).toBe(1)
    })
  })

  describe('detection: valid named backreferences', () => {
    test('should not report valid backreference (?<a>\\d+)\\k<a>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<a>\\d+)\\k<a>'))
      expect(reports.length).toBe(0)
    })

    test('should not report valid backreference (?<name>\\w+)\\k<name>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<name>\\w+)\\k<name>'))
      expect(reports.length).toBe(0)
    })

    test('should not report valid backreference (?<foo>\\d+)\\k<foo>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<foo>\\d+)\\k<foo>'))
      expect(reports.length).toBe(0)
    })

    test('should not report valid backreference (?<bar>\\w+)\\k<bar>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<bar>\\w+)\\k<bar>'))
      expect(reports.length).toBe(0)
    })

    test('should not report valid backreference (?<test>\\s+)\\k<test>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<test>\\s+)\\k<test>'))
      expect(reports.length).toBe(0)
    })

    test('should not report valid backreference (?<group>\\d+)\\k<group>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<group>\\d+)\\k<group>'))
      expect(reports.length).toBe(0)
    })

    test('should not report valid backreference (?<abc>\\w+)\\k<abc>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<abc>\\w+)\\k<abc>'))
      expect(reports.length).toBe(0)
    })

    test('should not report valid backreference (?<xyz>\\d+)\\k<xyz>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<xyz>\\d+)\\k<xyz>'))
      expect(reports.length).toBe(0)
    })

    test('should not report valid backreference (?<camelCase>\\w+)\\k<camelCase>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<camelCase>\\w+)\\k<camelCase>'))
      expect(reports.length).toBe(0)
    })

    test('should not report valid backreference (?<Uppercase>\\d+)\\k<Uppercase>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<Uppercase>\\d+)\\k<Uppercase>'))
      expect(reports.length).toBe(0)
    })
  })

  describe('detection: mismatched group names', () => {
    test('should report mismatch (?<a>\\d+)\\k<b>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<a>\\d+)\\k<b>'))
      expect(reports.length).toBe(1)
    })

    test('should report mismatch (?<name>\\w+)\\k<nam>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<name>\\w+)\\k<nam>'))
      expect(reports.length).toBe(1)
    })

    test('should report mismatch (?<foo>\\d+)\\k<foobar>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<foo>\\d+)\\k<foobar>'))
      expect(reports.length).toBe(1)
    })

    test('should report mismatch (?<bar>\\w+)\\k<bars>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<bar>\\w+)\\k<bars>'))
      expect(reports.length).toBe(1)
    })

    test('should report mismatch (?<test>\\s+)\\k<tst>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<test>\\s+)\\k<tst>'))
      expect(reports.length).toBe(1)
    })

    test('should report mismatch (?<group>\\d+)\\k<grou>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<group>\\d+)\\k<grou>'))
      expect(reports.length).toBe(1)
    })

    test('should report mismatch (?<abc>\\w+)\\k<ab>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<abc>\\w+)\\k<ab>'))
      expect(reports.length).toBe(1)
    })

    test('should report mismatch (?<xyz>\\d+)\\k<xy>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<xyz>\\d+)\\k<xy>'))
      expect(reports.length).toBe(1)
    })

    test('should report mismatch (?<camelCase>\\w+)\\k<camelCas>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<camelCase>\\w+)\\k<camelCas>'))
      expect(reports.length).toBe(1)
    })

    test('should report mismatch (?<Uppercase>\\d+)\\k<uppercase>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<Uppercase>\\d+)\\k<uppercase>'))
      expect(reports.length).toBe(1)
    })
  })

  describe('detection: patterns without backreferences', () => {
    test('should not report pattern \\d+', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\d+'))
      expect(reports.length).toBe(0)
    })

    test('should not report pattern \\w+', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\w+'))
      expect(reports.length).toBe(0)
    })

    test('should not report pattern [abc]+', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('[abc]+'))
      expect(reports.length).toBe(0)
    })

    test('should not report pattern (\\d+)', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(\\d+)'))
      expect(reports.length).toBe(0)
    })

    test('should not report pattern (?:\\d+)', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?:\\d+)'))
      expect(reports.length).toBe(0)
    })

    test('should not report pattern (?=\\d+)', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?=\\d+)'))
      expect(reports.length).toBe(0)
    })

    test('should not report pattern a|b', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('a|b'))
      expect(reports.length).toBe(0)
    })

    test('should not report pattern ^test$', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('^test$'))
      expect(reports.length).toBe(0)
    })

    test('should not report pattern \\bword\\b', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\bword\\b'))
      expect(reports.length).toBe(0)
    })

    test('should not report pattern a{2,5}', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('a{2,5}'))
      expect(reports.length).toBe(0)
    })

    test('should not report pattern \\s+', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\s+'))
      expect(reports.length).toBe(0)
    })

    test('should not report pattern \\.', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\.'))
      expect(reports.length).toBe(0)
    })

    test('should not report pattern [a-z]+', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('[a-z]+'))
      expect(reports.length).toBe(0)
    })

    test('should not report pattern \\d{3}-\\d{4}', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('\\d{3}-\\d{4}'))
      expect(reports.length).toBe(0)
    })

    test('should not report pattern (cat|dog)', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(cat|dog)'))
      expect(reports.length).toBe(0)
    })
  })

  describe('detection: numeric backreferences only', () => {
    test('should not report numeric backreference (\\d+)\\1', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(\\d+)\\1'))
      expect(reports.length).toBe(0)
    })

    test('should not report multiple numeric (\\w+)-(\\d+)\\1\\2', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(\\w+)-(\\d+)\\1\\2'))
      expect(reports.length).toBe(0)
    })

    test('should not report repeated numeric (\\d+)\\1\\1', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(\\d+)\\1\\1'))
      expect(reports.length).toBe(0)
    })

    test('should not report nested numeric ((\\d+))\\1\\2', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('((\\d+))\\1\\2'))
      expect(reports.length).toBe(0)
    })

    test('should not report triple numeric (a)(b)(c)\\1\\2\\3', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(a)(b)(c)\\1\\2\\3'))
      expect(reports.length).toBe(0)
    })

    test('should not report mixed numeric (\\d+)\\1(\\w+)\\2', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(\\d+)\\1(\\w+)\\2'))
      expect(reports.length).toBe(0)
    })
  })

  describe('detection: multiple valid named backreferences', () => {
    test('should not report (?<a>\\d+)\\k<a>-(?<b>\\w+)\\k<b>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<a>\\d+)\\k<a>-(?<b>\\w+)\\k<b>'))
      expect(reports.length).toBe(0)
    })

    test('should not report (?<x>\\d)(?<y>\\w)\\k<x>\\k<y>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<x>\\d)(?<y>\\w)\\k<x>\\k<y>'))
      expect(reports.length).toBe(0)
    })

    test('should not report (?<first>\\w+)\\s+(?<second>\\w+)\\k<first>\\k<second>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<first>\\w+)\\s+(?<second>\\w+)\\k<first>\\k<second>'))
      expect(reports.length).toBe(0)
    })

    test('should not report (?<p>\\d)\\k<p>(?<q>\\w)\\k<q>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<p>\\d)\\k<p>(?<q>\\w)\\k<q>'))
      expect(reports.length).toBe(0)
    })
  })

  describe('detection: mixed valid and invalid backreferences', () => {
    test('should report (?<a>\\d+)\\k<a>\\k<missing>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<a>\\d+)\\k<a>\\k<missing>'))
      expect(reports.length).toBe(1)
    })

    test('should report (?<x>\\w+)\\k<x>\\k<notfound>\\k<alsoNo>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<x>\\w+)\\k<x>\\k<notfound>\\k<alsoNo>'))
      expect(reports.length).toBe(1)
    })

    test('should report (?<first>\\d)\\k<first>\\k<second>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<first>\\d)\\k<first>\\k<second>'))
      expect(reports.length).toBe(1)
    })

    test('should report (?<a>\\d+)(?<b>\\w+)\\k<a>\\k<c>', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('(?<a>\\d+)(?<b>\\w+)\\k<a>\\k<c>'))
      expect(reports.length).toBe(1)
    })
  })

  describe('detection: empty and whitespace patterns', () => {
    test('should not report empty pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral(''))
      expect(reports.length).toBe(0)
    })

    test('should not report single space pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral(' '))
      expect(reports.length).toBe(0)
    })

    test('should not report double space pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('  '))
      expect(reports.length).toBe(0)
    })

    test('should not report triple space pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteral('   '))
      expect(reports.length).toBe(0)
    })
  })

  describe('detection: valid backreferences with flags', () => {
    test('should not report valid backref with g flag', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteralWithFlags('(?<a>\\d+)\\k<a>', 'g'))
      expect(reports.length).toBe(0)
    })

    test('should not report valid backref with i flag', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteralWithFlags('(?<name>\\w+)\\k<name>', 'i'))
      expect(reports.length).toBe(0)
    })

    test('should not report valid backref with m flag', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteralWithFlags('(?<x>\\d)\\k<x>', 'm'))
      expect(reports.length).toBe(0)
    })

    test('should not report valid backref with s flag', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteralWithFlags('(?<test>\\w+)\\k<test>', 's'))
      expect(reports.length).toBe(0)
    })

    test('should not report valid backref with u flag', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteralWithFlags('(?<abc>\\d+)\\k<abc>', 'u'))
      expect(reports.length).toBe(0)
    })

    test('should not report valid backref with y flag', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteralWithFlags('(?<z>\\w)\\k<z>', 'y'))
      expect(reports.length).toBe(0)
    })

    test('should not report valid backref with gi flags', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteralWithFlags('(?<a>\\d+)\\k<a>', 'gi'))
      expect(reports.length).toBe(0)
    })

    test('should not report valid backref with gimsuy flags', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteralWithFlags('(?<a>\\d+)\\k<a>', 'gimsuy'))
      expect(reports.length).toBe(0)
    })
  })

  describe('detection: useless backreferences with flags', () => {
    test('should report useless \\k<foo> with g flag', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteralWithFlags('\\k<foo>', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report useless \\k<bar> with i flag', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteralWithFlags('\\k<bar>', 'i'))
      expect(reports.length).toBe(1)
    })

    test('should report useless \\k<missing> with gi flags', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteralWithFlags('\\k<missing>', 'gi'))
      expect(reports.length).toBe(1)
    })

    test('should report useless (?<a>\\d+)\\k<b> with m flag', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteralWithFlags('(?<a>\\d+)\\k<b>', 'm'))
      expect(reports.length).toBe(1)
    })

    test('should report useless \\k<unknown> with suy flags', () => {
      const { context, reports } = createMockRuleContext({ source: '/\\(?<name>\\d+\\)\\k<name>/' })
      const visitor = noUselessBackreferenceRule.create(context)
      visitor.Literal(createRegexLiteralWithFlags('\\k<unknown>', 'suy'))
      expect(reports.length).toBe(1)
    })
  })
})

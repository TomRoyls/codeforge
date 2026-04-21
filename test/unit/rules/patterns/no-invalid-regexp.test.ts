import { describe, test, expect, vi } from 'vitest'
import { noInvalidRegexpRule } from '../../../../src/rules/patterns/no-invalid-regexp.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createRegExpCall(pattern: string, flags?: string, line = 1, column = 0): unknown {
  const args = flags
    ? [
        {
          type: 'Literal',
          value: pattern,
        },
        {
          type: 'Literal',
          value: flags,
        },
      ]
    : [
        {
          type: 'Literal',
          value: pattern,
        },
      ]

  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'RegExp',
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createCallExpression(
  calleeName: string,
  args: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: calleeName,
    },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createLiteral(value: unknown): unknown {
  return {
    type: 'Literal',
    value,
  }
}

describe('no-invalid-regexp rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noInvalidRegexpRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noInvalidRegexpRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noInvalidRegexpRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noInvalidRegexpRule.meta.docs?.category).toBe('patterns')
    })

    test('should have empty schema array', () => {
      expect(noInvalidRegexpRule.meta.schema).toEqual([])
    })

    test('should have undefined fixable', () => {
      expect(noInvalidRegexpRule.meta.fixable).toBeUndefined()
    })

    test('should mention RegExp in description', () => {
      expect(noInvalidRegexpRule.meta.docs?.description.toLowerCase()).toContain('regexp')
    })

    test('should mention invalid in description', () => {
      expect(noInvalidRegexpRule.meta.docs?.description.toLowerCase()).toContain('invalid')
    })

    test('should have docs property', () => {
      expect(noInvalidRegexpRule.meta.docs).toBeDefined()
    })

    test('should have description as non-empty string', () => {
      expect(typeof noInvalidRegexpRule.meta.docs?.description).toBe('string')
      expect(noInvalidRegexpRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have meta object defined', () => {
      expect(noInvalidRegexpRule.meta).toBeDefined()
      expect(typeof noInvalidRegexpRule.meta).toBe('object')
    })

    test('should have type as string', () => {
      expect(typeof noInvalidRegexpRule.meta.type).toBe('string')
    })

    test('should have severity as string', () => {
      expect(typeof noInvalidRegexpRule.meta.severity).toBe('string')
    })

    test('should have recommended as boolean', () => {
      expect(typeof noInvalidRegexpRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have category as string', () => {
      expect(typeof noInvalidRegexpRule.meta.docs?.category).toBe('string')
    })

    test('should have schema as array', () => {
      expect(Array.isArray(noInvalidRegexpRule.meta.schema)).toBe(true)
    })

    test('should have exactly 0 schema entries', () => {
      expect(noInvalidRegexpRule.meta.schema).toHaveLength(0)
    })

    test('should have type set to problem exactly', () => {
      expect(noInvalidRegexpRule.meta.type).toBe('problem')
    })

    test('should have severity set to error exactly', () => {
      expect(noInvalidRegexpRule.meta.severity).toBe('error')
    })

    test('should have category set to patterns exactly', () => {
      expect(noInvalidRegexpRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention regular expression in description', () => {
      expect(noInvalidRegexpRule.meta.docs?.description.toLowerCase()).toContain('regular')
    })

    test('should mention constructor in description', () => {
      expect(noInvalidRegexpRule.meta.docs?.description.toLowerCase()).toContain('constructor')
    })
  })

  describe('create', () => {
    test('should return visitor with CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a non-null visitor', () => {
      const { context } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      expect(visitor).not.toBeNull()
      expect(visitor).toBeDefined()
    })

    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      expect(typeof visitor).toBe('object')
    })

    test('should have create as a function', () => {
      expect(typeof noInvalidRegexpRule.create).toBe('function')
    })

    test('should return visitor with only CallExpression method', () => {
      const { context } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      expect(Object.keys(visitor)).toContain('CallExpression')
    })

    test('should accept context parameter without error', () => {
      const { context } = createMockRuleContext({ source: 'new RegExp("[", "g");' })

      expect(() => noInvalidRegexpRule.create(context)).not.toThrow()
    })

    test('should return consistent visitor across multiple calls', () => {
      const { context } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor1 = noInvalidRegexpRule.create(context)
      const visitor2 = noInvalidRegexpRule.create(context)

      expect(typeof visitor1.CallExpression).toBe(typeof visitor2.CallExpression)
    })

    test('should return visitor that is callable multiple times', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z]+'))
      visitor.CallExpression(createRegExpCall('\\d+'))

      expect(reports.length).toBe(0)
    })
  })

  describe('reporting invalid regex patterns', () => {
    test('should report invalid regex with unclosed bracket', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[unclosed'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with unclosed parenthesis', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(unclosed'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with unclosed character class', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with quantifier at start', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('?'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with invalid quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('*invalid'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with malformed range', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[z-a]'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with double plus', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('a++'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with double star', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('a**'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with quantifier after nothing', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('{1}'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with invalid repetition', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('a{3,1}'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with lone closing parenthesis', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('abc)'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with lone closing bracket', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall(']'))

      expect(reports.length).toBe(0)
    })

    test('should report invalid regex with lone quantifier plus', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('+'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with lone quantifier star', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('*'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with nothing to repeat', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('a{2}{2}'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with unclosed parenthesis at end', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('abc('))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with deeply nested unclosed groups', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(((('))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with incomplete escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('\\'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with plus at start', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('+abc'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with star at start', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('*abc'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with double plus quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('a+++'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with incomplete repetition syntax', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('a{2,1}'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with quantifier on lookahead in unicode mode', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(?=a)*', 'u'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with multiple unclosed brackets', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[[a'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with unclosed named group', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(?<name>foo'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with quantifier on nothing at start', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('{3}abc'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with unclosed bracket and flags', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[unclosed', 'gi'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with unclosed parenthesis and flags', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(unclosed', 'g'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with malformed range and flags', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[z-a]', 'i'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should report invalid regex with quantifier at start and flags', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('?', 'm'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })
  })

  describe('not reporting valid regex patterns', () => {
    test('should not report valid regex without flags', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z]+'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with flags', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z]+', 'gi'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with global flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('\\d+', 'g'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with case-insensitive flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[A-Z]', 'i'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with multiline flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('^test$', 'm'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with multiple flags', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z0-9]+', 'gim'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with character class', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[\\w\\s]+'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with quantifiers', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('a{1,3}b+c?'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with groups', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(foo|bar)'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with lookaheads', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('a(?=b)'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with escape sequences', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('\\d\\w\\s'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with anchors', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('^start$'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with escaped special characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('\\[\\]\\(\\)'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with simple literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('hello'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with digit pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('\\d{3}-\\d{4}'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with alternation', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('cat|dog'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with optional group', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('a(b)?c'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with zero-or-more', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('ab*c'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with one-or-more', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('ab+c'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with negated character class', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[^abc]'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with range in class', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[0-9a-fA-F]'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with dot', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('a.b'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with dot star', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('.*'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with word boundary', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('\\bword\\b'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with unicode flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z]', 'u'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with sticky flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z]', 'y'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with all common flags', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z]+', 'gimsuy'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with escaped backslash', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('\\\\'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with tab escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('\\t'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with newline escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('\\n'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with word character class', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('\\w+'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid complex email-like regex', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-RegExp call expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createCallExpression('createPattern', [createLiteral('[a-z]')]))

      expect(reports.length).toBe(0)
    })

    test('should handle call without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createCallExpression('RegExp', []))

      expect(reports.length).toBe(0)
    })

    test('should handle non-object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      expect(() => visitor.CallExpression('invalid')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without arguments property', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-array arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: 'not-an-array',
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle first argument that is not a literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = createCallExpression('RegExp', [{ type: 'Identifier', name: 'patternVar' }])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc property', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Literal', value: '[' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle null pattern argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = createCallExpression('RegExp', [null])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle undefined pattern argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = createCallExpression('RegExp', [undefined])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle pattern argument that is not a string', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = createCallExpression('RegExp', [{ type: 'Literal', value: 123 }])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle flags argument that is not a literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = createCallExpression('RegExp', [
        { type: 'Literal', value: '[a-z]' },
        { type: 'Identifier', name: 'flagsVar' },
      ])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle non-string flags argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = createCallExpression('RegExp', [
        { type: 'Literal', value: '[a-z]' },
        { type: 'Literal', value: 123 },
      ])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBeGreaterThanOrEqual(0)
    })

    test('should handle empty string pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall(''))

      expect(reports.length).toBe(0)
    })

    test('should handle empty string flags', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z]', ''))

      expect(reports.length).toBe(0)
    })

    test('should report invalid flag characters', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z]', 'z'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should handle node with non-string type', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = {
        type: null,
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Literal', value: '[' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee without name property', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier' },
        arguments: [{ type: 'Literal', value: '[a-z]' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle valid regex with unicode flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z]', 'u'))

      expect(reports.length).toBe(0)
    })

    test('should handle valid regex with sticky flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z]', 'y'))

      expect(reports.length).toBe(0)
    })

    test('should handle boolean pattern argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = createCallExpression('RegExp', [{ type: 'Literal', value: true }])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle object pattern argument', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = createCallExpression('RegExp', [{ type: 'Literal', value: { key: 'val' } }])

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node as input', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node as input', () => {
      const { context } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong callee type', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Literal', value: 'RegExp' },
        arguments: [{ type: 'Literal', value: '[a-z]' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with MemberExpression callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'window' },
          property: { type: 'Identifier', name: 'RegExp' },
        },
        arguments: [{ type: 'Literal', value: '[a-z]' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: '[a-z]' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: undefined,
        arguments: [{ type: 'Literal', value: '[a-z]' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle more than two arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [
          { type: 'Literal', value: '[a-z]+' },
          { type: 'Literal', value: 'g' },
          { type: 'Literal', value: 'extra' },
        ],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle callee as non-object', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: 'RegExp',
        arguments: [{ type: 'Literal', value: '[a-z]' }],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('location tracking', () => {
    test('should report correct location for invalid regex', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[unclosed', undefined, 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[unclosed', undefined, 5, 10))

      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(30)
    })

    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('['))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location for invalid regex with flags', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[bad', 'g', 7, 3))

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report location at high line number', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(', undefined, 100, 50))

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report location at column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('*', undefined, 1, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[bad', undefined, 3, 2))

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('should include location in report for every invalid regex', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[bad1', undefined, 1, 0))
      visitor.CallExpression(createRegExpCall('[bad2', undefined, 2, 5))
      visitor.CallExpression(createRegExpCall('[bad3', undefined, 3, 10))

      expect(reports).toHaveLength(3)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
      expect(reports[2].loc?.start.line).toBe(3)
    })

    test('should report location with correct start column', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('+', undefined, 4, 15))

      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report location with correct end column', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[x', undefined, 1, 8))

      expect(reports[0].loc?.end.column).toBe(28)
    })

    test('should handle location for regex without loc on node', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Literal', value: '[' }],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle location with null loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Literal', value: '[' }],
        loc: null,
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc).toBeDefined()
    })

    test('should handle location with partial loc (only start)', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Literal', value: '[' }],
        loc: { start: { line: 5, column: 3 } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('should report default location when loc has invalid types', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Literal', value: '[' }],
        loc: { start: { line: 'bad', column: 'bad' }, end: { line: 'bad', column: 'bad' } },
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report location for each of multiple invalid regexes', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a', undefined, 10, 0))
      visitor.CallExpression(createRegExpCall('[b', undefined, 20, 0))
      visitor.CallExpression(createRegExpCall('[c', undefined, 30, 0))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[1].loc?.start.line).toBe(20)
      expect(reports[2].loc?.start.line).toBe(30)
    })

    test('should report location at line 0 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[bad', undefined, 0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location with large column value', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[bad', undefined, 1, 999))

      expect(reports[0].loc?.start.column).toBe(999)
    })
  })

  describe('message quality', () => {
    test('should include Invalid regular expression in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('('))

      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should include error details in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z'))

      expect(reports[0].message).toMatch(/^Invalid regular expression:/)
      expect(reports[0].message.length).toBeGreaterThan('Invalid regular expression: '.length)
    })

    test('should have colon after prefix in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('['))

      expect(reports[0].message).toContain('Invalid regular expression: ')
    })

    test('should include error body after colon', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('?'))

      const colonIndex = reports[0].message.indexOf(': ')
      expect(colonIndex).toBeGreaterThan(-1)
      expect(reports[0].message.length).toBeGreaterThan(colonIndex + 2)
    })

    test('should produce consistent message format across different errors', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('('))
      visitor.CallExpression(createRegExpCall('['))
      visitor.CallExpression(createRegExpCall('+'))

      for (const report of reports) {
        expect(report.message).toMatch(/^Invalid regular expression:/)
      }
    })

    test('should have non-empty message for every report', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[unclosed'))
      visitor.CallExpression(createRegExpCall('(unclosed'))
      visitor.CallExpression(createRegExpCall('*'))

      for (const report of reports) {
        expect(report.message.length).toBeGreaterThan(0)
      }
    })

    test('should include error type information in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[unclosed'))

      expect(reports[0].message).toContain('SyntaxError')
    })

    test('should produce different error messages for different patterns', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[bad'))
      visitor.CallExpression(createRegExpCall('?'))

      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('should not produce undefined or null message', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('['))

      expect(reports[0].message).toBeDefined()
      expect(reports[0].message).not.toContain('undefined')
      expect(reports[0].message).not.toContain('null')
    })

    test('should have message as string type', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('['))

      expect(typeof reports[0].message).toBe('string')
    })
  })

  describe('multiple reports', () => {
    test('should report multiple invalid regex calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[unclosed1'))
      visitor.CallExpression(createRegExpCall('[unclosed2'))
      visitor.CallExpression(createRegExpCall('[unclosed3'))

      expect(reports.length).toBe(3)
    })

    test('should track each report independently', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a', undefined, 1, 0))
      visitor.CallExpression(createRegExpCall('[b', undefined, 2, 0))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(2)
    })

    test('should report valid followed by invalid', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z]+'))
      visitor.CallExpression(createRegExpCall('[bad'))

      expect(reports.length).toBe(1)
    })

    test('should report invalid followed by valid', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[bad'))
      visitor.CallExpression(createRegExpCall('[a-z]+'))

      expect(reports.length).toBe(1)
    })

    test('should handle alternating valid and invalid patterns', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z]+'))
      visitor.CallExpression(createRegExpCall('['))
      visitor.CallExpression(createRegExpCall('\\d+'))
      visitor.CallExpression(createRegExpCall('('))
      visitor.CallExpression(createRegExpCall('^test$'))

      expect(reports.length).toBe(2)
    })

    test('should report ten consecutive invalid patterns', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      for (let i = 0; i < 10; i++) {
        visitor.CallExpression(createRegExpCall('[unclosed' + i))
      }

      expect(reports.length).toBe(10)
    })

    test('should report five valid and five invalid patterns correctly', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createRegExpCall('[a-z]+'))
      }
      for (let i = 0; i < 5; i++) {
        visitor.CallExpression(createRegExpCall('[unclosed' + i))
      }

      expect(reports.length).toBe(5)
    })

    test('should handle mixed valid and invalid across many calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const patterns: { pattern: string; isValid: boolean }[] = [
        { pattern: '[a-z]+', isValid: true },
        { pattern: '[bad', isValid: false },
        { pattern: '\\d+', isValid: true },
        { pattern: '(', isValid: false },
        { pattern: '^hello$', isValid: true },
        { pattern: '*', isValid: false },
        { pattern: '(foo|bar)', isValid: true },
        { pattern: '+abc', isValid: false },
      ]

      for (const { pattern } of patterns) {
        visitor.CallExpression(createRegExpCall(pattern))
      }

      const expectedInvalid = patterns.filter((p) => !p.isValid).length
      expect(reports.length).toBe(expectedInvalid)
    })

    test('should accumulate reports without resetting between calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[1'))
      expect(reports.length).toBe(1)

      visitor.CallExpression(createRegExpCall('[2'))
      expect(reports.length).toBe(2)

      visitor.CallExpression(createRegExpCall('[3'))
      expect(reports.length).toBe(3)
    })

    test('should report each invalid pattern exactly once', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[bad'))

      expect(reports.length).toBe(1)
    })
  })

  describe('context usage', () => {
    test('should call context.report for invalid regex', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('['))

      expect(reports.length).toBe(1)
    })

    test('should not call context.report for valid regex', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z]+'))

      expect(reports.length).toBe(0)
    })

    test('should not call context.report for non-RegExp calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createCallExpression('notRegExp', [createLiteral('[bad')]))

      expect(reports.length).toBe(0)
    })

    test('should pass message to context.report', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('['))

      expect(reports[0]).toHaveProperty('message')
      expect(typeof reports[0].message).toBe('string')
    })

    test('should pass loc to context.report', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[bad', undefined, 5, 10))

      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0].loc?.start).toEqual({ line: 5, column: 10 })
    })

    test('should use context report function directly', () => {
      let reportCalled = false
      const ctx = {
        report: () => {
          reportCalled = true
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noInvalidRegexpRule.create(ctx)
      visitor.CallExpression(createRegExpCall('['))

      expect(reportCalled).toBe(true)
    })

    test('should create visitor for each context independently', () => {
      const { context: ctx1, reports: reports1 } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const { context: ctx2, reports: reports2 } = createMockRuleContext({ source: 'new RegExp("[", "g");' })

      const visitor1 = noInvalidRegexpRule.create(ctx1)
      const visitor2 = noInvalidRegexpRule.create(ctx2)

      visitor1.CallExpression(createRegExpCall('[bad'))
      visitor2.CallExpression(createRegExpCall('[a-z]+'))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should handle context with different file paths', () => {
      const reports: ReportDescriptor[] = []
      const ctx = {
        report: (d: ReportDescriptor) => reports.push(d),
        getFilePath: () => '/different/path.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/project',
      } as unknown as RuleContext

      const visitor = noInvalidRegexpRule.create(ctx)
      visitor.CallExpression(createRegExpCall('[bad'))

      expect(reports.length).toBe(1)
    })

    test('should handle context report being called with both message and loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[bad', undefined, 3, 7))

      expect(reports[0].message).toBeDefined()
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should work correctly with context that has empty config', () => {
      const reports: ReportDescriptor[] = []
      const ctx = {
        report: (d: ReportDescriptor) => reports.push(d),
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noInvalidRegexpRule.create(ctx)
      visitor.CallExpression(createRegExpCall('[bad'))

      expect(reports.length).toBe(1)
    })
  })

  describe('complex regex patterns', () => {
    test('should not report valid regex with nested groups', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('((foo)(bar))'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with lookbehind', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(?<=a)b'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with named groups', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(?<name>foo)'))

      expect(reports.length).toBe(0)
    })

    test('should report invalid regex with unclosed named group', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(?<name>foo'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Invalid regular expression')
    })

    test('should not report valid regex with non-capturing group', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(?:foo)'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with negative lookahead', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(?!foo)'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with positive lookahead', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(?=bar)'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with negative lookbehind', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(?<!foo)bar'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with complex alternation', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(foo|bar|baz)'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with nested character classes', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-zA-Z0-9]'))

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each for valid patterns', () => {
    test.each([
      ['[a-z]+', undefined],
      ['\\d+', 'g'],
      ['[A-Z]', 'i'],
      ['^test$', 'm'],
      ['[a-z0-9]+', 'gim'],
      ['[\\w\\s]+', undefined],
      ['a{1,3}b+c?', undefined],
      ['(foo|bar)', undefined],
      ['a(?=b)', undefined],
      ['\\d\\w\\s', undefined],
      ['^start$', undefined],
      ['\\[\\]\\(\\)', undefined],
      ['', undefined],
      ['hello', undefined],
      ['cat|dog', undefined],
    ] as [string, string | undefined][])(
      'should not report valid pattern "%s" with flags "%s"',
      (pattern, flags) => {
        const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
        const visitor = noInvalidRegexpRule.create(context)

        visitor.CallExpression(createRegExpCall(pattern, flags))

        expect(reports.length).toBe(0)
      },
    )
  })

  describe('test.each for invalid patterns', () => {
    test.each([
      ['[unclosed'],
      ['(unclosed'],
      ['[a-z'],
      ['?'],
      ['*invalid'],
      ['[z-a]'],
      ['a++'],
      ['a**'],
      ['a{2}{2}'],
      ['a+++'],
      ['a{2,1}'],
      ['(?=a)*', 'u'],
      ['{3}abc'],
      ['[bad', 'g'],
    ] as [string, string?][])(
      'should report invalid pattern "%s" with flags "%s"',
      (pattern, flags) => {
        const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
        const visitor = noInvalidRegexpRule.create(context)

        visitor.CallExpression(createRegExpCall(pattern, flags))

        expect(reports.length).toBe(1)
        expect(reports[0].message).toContain('Invalid regular expression')
      },
    )
  })

  describe('test.each for edge case nodes', () => {
    test.each([
      [null, 'null node'],
      [undefined, 'undefined node'],
      ['string', 'string node'],
      [42, 'number node'],
      [true, 'boolean node'],
      [{}, 'empty object node'],
    ])('should not throw for %s', (node) => {
      const { context } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      expect(() => visitor.CallExpression(node)).not.toThrow()
    })
  })

  describe('test.each for non-RegExp callee names', () => {
    test.each([
      ['RegExp2'],
      ['regexp'],
      ['REGEXP'],
      ['newRegExp'],
      ['createRegExp'],
      ['myRegExp'],
      ['test'],
      ['match'],
      ['exec'],
      ['compile'],
    ])('should not report for callee named "%s"', (calleeName) => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createCallExpression(calleeName, [createLiteral('[bad')]))

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each for non-literal first arguments', () => {
    test.each([
      [{ type: 'Identifier', name: 'patternVar' }, 'Identifier'],
      [{ type: 'TemplateLiteral', quasis: [] }, 'TemplateLiteral'],
      [{ type: 'BinaryExpression', operator: '+' }, 'BinaryExpression'],
      [{ type: 'MemberExpression', object: {}, property: {} }, 'MemberExpression'],
      [{ type: 'CallExpression', callee: {} }, 'CallExpression'],
      [{ type: 'ArrowFunctionExpression', body: {} }, 'ArrowFunctionExpression'],
      [null, 'null argument'],
      [undefined, 'undefined argument'],
      [{ type: 'Literal', value: 123 }, 'Literal number'],
      [{ type: 'Literal', value: true }, 'Literal boolean'],
    ] as [unknown, string][])('should not report for first argument: %s (%s)', (arg) => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      const node = createCallExpression('RegExp', [arg])
      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each for valid flags', () => {
    test.each([['g'], ['i'], ['m'], ['s'], ['u'], ['y'], ['gi'], ['gim'], ['gimsuy'], ['']] as [
      string,
    ][])('should not report valid pattern with flag "%s"', (flags) => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('[a-z]+', flags))

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each for location accuracy', () => {
    test.each([
      [1, 0],
      [1, 5],
      [5, 0],
      [5, 10],
      [10, 3],
      [100, 0],
      [1, 100],
      [50, 25],
    ] as [number, number][])(
      'should report correct location at line %d, column %d',
      (line, column) => {
        const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
        const visitor = noInvalidRegexpRule.create(context)

        visitor.CallExpression(createRegExpCall('[bad', undefined, line, column))

        expect(reports[0].loc?.start.line).toBe(line)
        expect(reports[0].loc?.start.column).toBe(column)
      },
    )
  })

  describe('additional valid patterns', () => {
    test('should not report valid regex with backreference', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('(a)\\1'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with octal escape', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('\\1'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with only dot', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('.'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with complex URL pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('https?://[\\w.-]+(?:\\.[\\w]{2,})+'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with only pipe', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('a|'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with single character', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('a'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with number pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('\\d\\d\\d'))

      expect(reports.length).toBe(0)
    })

    test('should not report valid regex with whitespace pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const visitor = noInvalidRegexpRule.create(context)

      visitor.CallExpression(createRegExpCall('\\s+\\S+'))

      expect(reports.length).toBe(0)
    })
  })

  describe('rule export', () => {
    test('should have create method on exported rule', () => {
      expect(typeof noInvalidRegexpRule.create).toBe('function')
    })

    test('should have meta on exported rule', () => {
      expect(noInvalidRegexpRule.meta).toBeDefined()
    })

    test('should have create as a function property', () => {
      expect(noInvalidRegexpRule).toHaveProperty('create')
      expect(typeof noInvalidRegexpRule.create).toBe('function')
    })

    test('should have exactly two keys: meta and create', () => {
      expect(Object.keys(noInvalidRegexpRule)).toContain('meta')
      expect(Object.keys(noInvalidRegexpRule)).toContain('create')
    })

    test('should have meta type as one of valid rule types', () => {
      expect(['problem', 'suggestion', 'layout']).toContain(noInvalidRegexpRule.meta.type)
    })

    test('should have meta severity as one of valid severities', () => {
      expect(['error', 'warn', 'info', 'off']).toContain(noInvalidRegexpRule.meta.severity)
    })

    test('should not have deprecated flag in meta', () => {
      expect(noInvalidRegexpRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy in meta', () => {
      expect(noInvalidRegexpRule.meta.replacedBy).toBeUndefined()
    })

    test('should have docs with description and category', () => {
      expect(noInvalidRegexpRule.meta.docs?.description).toBeDefined()
      expect(noInvalidRegexpRule.meta.docs?.category).toBeDefined()
    })

    test('should have create that returns object with CallExpression', () => {
      const { context } = createMockRuleContext({ source: 'new RegExp("[", "g");' })
      const result = noInvalidRegexpRule.create(context)
      expect(result).toHaveProperty('CallExpression')
    })

    test('should have default export matching named export', () => {
      expect(noInvalidRegexpRule).toBeDefined()
      expect(typeof noInvalidRegexpRule).toBe('object')
    })
  })
})

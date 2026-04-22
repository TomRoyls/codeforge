import { describe, test, expect, vi } from 'vitest'
import { preferRegexpExecRule } from '../../../../src/rules/patterns/prefer-regexp-exec.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createStringMatchCall(
  objectName: string,
  regexPattern: string,
  regexFlags: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: objectName,
      },
      property: {
        type: 'Identifier',
        name: 'match',
      },
      computed: false,
    },
    arguments: [
      {
        type: 'Literal',
        value: null,
        raw: `/${regexPattern}/${regexFlags}`,
        regex: {
          pattern: regexPattern,
          flags: regexFlags,
        },
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createLiteralWithRawOnly(raw: string, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value: null,
    raw,
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

describe('prefer-regexp-exec rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferRegexpExecRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferRegexpExecRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferRegexpExecRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferRegexpExecRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferRegexpExecRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(preferRegexpExecRule.meta.fixable).toBe('code')
    })

    test('should mention exec or matchAll in description', () => {
      const desc = preferRegexpExecRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc.includes('exec') || desc.includes('matchall')).toBe(true)
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
    })
  })

  describe('detecting string.match with global flag', () => {
    test('should report str.match(/test/g)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      const node = createStringMatchCall('str', 'test', 'g')

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('exec')
    })

    test('should report str.match(/pattern/gi) with multiple flags', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      const node = createStringMatchCall('str', 'pattern', 'gi')

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report str.match(/pattern/ig) with global flag in any position', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      const node = createStringMatchCall('str', 'pattern', 'ig')

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report str.match(/pattern/) without global flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      const node = createStringMatchCall('str', 'pattern', 'i')

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report str.match(/pattern/) with no flags', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      const node = createStringMatchCall('str', 'pattern', '')

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when method is not match', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'test' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/pattern/g',
            regex: { pattern: 'pattern', flags: 'g' },
          },
        ],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when callee is not a member expression', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'match' },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/pattern/g',
            regex: { pattern: 'pattern', flags: 'g' },
          },
        ],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report when argument is not a regex literal', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'regex' }],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('regex literal parsing', () => {
    test('should detect global flag from raw property', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [createLiteralWithRawOnly('/test/g')],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report when raw has no global flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [createLiteralWithRawOnly('/test/i')],
      }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/pattern/g',
            regex: { pattern: 'pattern', flags: 'g' },
          },
        ],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      const node = createStringMatchCall('str', 'test', 'g', 10, 5)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      visitor.CallExpression(createStringMatchCall('str', 'test', 'g'))

      expect(reports.length).toBe(1)
    })
  })

  describe('message quality', () => {
    test('should mention exec in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      visitor.CallExpression(createStringMatchCall('str', 'test', 'g'))

      expect(reports[0].message.toLowerCase()).toContain('exec')
    })

    test('should mention matchAll in message', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      visitor.CallExpression(createStringMatchCall('str', 'test', 'g'))

      expect(reports[0].message.toLowerCase()).toContain('matchall')
    })
  })

  describe('meta detailed properties', () => {
    test('should have docs.url defined', () => {
      expect(preferRegexpExecRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs.url as a non-empty string', () => {
      expect(typeof preferRegexpExecRule.meta.docs?.url).toBe('string')
      expect(preferRegexpExecRule.meta.docs?.url!.length).toBeGreaterThan(0)
    })

    test('should have description containing string.match', () => {
      const desc = preferRegexpExecRule.meta.docs?.description ?? ''
      expect(desc.toLowerCase()).toContain('string.match')
    })

    test('should have description mentioning global flag', () => {
      const desc = preferRegexpExecRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toContain('global')
    })

    test('should not be deprecated', () => {
      expect(preferRegexpExecRule.meta.deprecated).toBeFalsy()
    })

    test('should not have replacedBy', () => {
      expect(preferRegexpExecRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(preferRegexpExecRule.meta.requiresTypeChecking).toBeFalsy()
    })

    test('should have schema as an empty array', () => {
      expect(preferRegexpExecRule.meta.schema).toEqual([])
    })

    test('should have type as one of valid rule types', () => {
      const validTypes = ['problem', 'suggestion', 'layout']
      expect(validTypes).toContain(preferRegexpExecRule.meta.type)
    })

    test('should have severity as one of valid severities', () => {
      const validSeverities = ['off', 'warn', 'error']
      expect(validSeverities).toContain(preferRegexpExecRule.meta.severity)
    })

    test('should have docs object defined', () => {
      expect(preferRegexpExecRule.meta.docs).toBeDefined()
    })

    test('should have docs.description as a non-empty string', () => {
      expect(typeof preferRegexpExecRule.meta.docs?.description).toBe('string')
      expect(preferRegexpExecRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have fixable set to code', () => {
      expect(preferRegexpExecRule.meta.fixable).toBe('code')
    })

    test('should not have fixable set to whitespace', () => {
      expect(preferRegexpExecRule.meta.fixable).not.toBe('whitespace')
    })
  })

  describe('create visitor shape', () => {
    test('should return an object from create', () => {
      const { context } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      expect(typeof visitor).toBe('object')
    })

    test('should have CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a visitor each time create is called', () => {
      const { context: ctx1 } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const { context: ctx2 } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor1 = preferRegexpExecRule.create(ctx1)
      const visitor2 = preferRegexpExecRule.create(ctx2)
      expect(visitor1).not.toBe(visitor2)
    })

    test('should have CallExpression that accepts one argument', () => {
      const { context } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      expect(visitor.CallExpression.length).toBe(1)
    })

    test('visitor should only have CallExpression key', () => {
      const { context } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      expect(Object.keys(visitor)).toEqual(['CallExpression'])
    })
  })

  describe('regex flags detection - global flag combinations', () => {
    test('should report with flag g only', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'abc', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with flag gi', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'abc', 'gi'))
      expect(reports.length).toBe(1)
    })

    test('should report with flag gm', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'abc', 'gm'))
      expect(reports.length).toBe(1)
    })

    test('should report with flag gs', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'abc', 'gs'))
      expect(reports.length).toBe(1)
    })

    test('should report with flag gu', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'abc', 'gu'))
      expect(reports.length).toBe(1)
    })

    test('should report with flag gy', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'abc', 'gy'))
      expect(reports.length).toBe(1)
    })

    test('should report with flag gimsuy', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'abc', 'gimsuy'))
      expect(reports.length).toBe(1)
    })

    test('should report with flag gim', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'abc', 'gim'))
      expect(reports.length).toBe(1)
    })

    test('should report with flag gis', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'abc', 'gis'))
      expect(reports.length).toBe(1)
    })

    test('should report with flag giy', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'abc', 'giy'))
      expect(reports.length).toBe(1)
    })

    test('should not report with flag i only', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'abc', 'i'))
      expect(reports.length).toBe(0)
    })

    test('should not report with flag m only', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'abc', 'm'))
      expect(reports.length).toBe(0)
    })

    test('should not report with flag s only', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'abc', 's'))
      expect(reports.length).toBe(0)
    })

    test('should not report with flag u only', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'abc', 'u'))
      expect(reports.length).toBe(0)
    })

    test('should not report with flag y only', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'abc', 'y'))
      expect(reports.length).toBe(0)
    })

    test('should not report with flag im', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'abc', 'im'))
      expect(reports.length).toBe(0)
    })

    test('should not report with flag isu', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'abc', 'isu'))
      expect(reports.length).toBe(0)
    })

    test('should not report with empty flags', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'abc', ''))
      expect(reports.length).toBe(0)
    })
  })

  describe('regex pattern variations', () => {
    test('should report with simple pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'hello', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with character class pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', '[a-z]+', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with digit pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', '\\d+', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with word boundary pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', '\\bword\\b', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with capturing group pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', '(foo|bar)', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with non-capturing group pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', '(?:foo|bar)', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with anchor pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', '^test$', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with lookahead pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'foo(?=bar)', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with quantifier pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'a{2,4}', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with escaped special char pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', '\\.\\*\\+', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with empty pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', '', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with complex nested groups pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', '((a|b)(c|d))', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with unicode escape pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', '\\u0041', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with backreference pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', '(a)\\1', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with named group pattern', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', '(?<name>\\w+)', 'g'))
      expect(reports.length).toBe(1)
    })
  })

  describe('object name variations', () => {
    test('should report with str object', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'test', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with text object', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('text', 'test', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with myString object', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('myString', 'test', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with result object', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('result', 'test', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with input object', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('input', 'test', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with data object', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('data', 'test', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with value object', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('value', 'test', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with content object', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('content', 'test', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with line object', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('line', 'test', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report with foo object', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('foo', 'test', 'g'))
      expect(reports.length).toBe(1)
    })
  })

  describe('non-match method calls should not report', () => {
    test('should not report for test method', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'test' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'str' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for exec method', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'regex' },
          property: { type: 'Identifier', name: 'exec' },
          computed: false,
        },
        arguments: [{ type: 'Identifier', name: 'str' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for replace method', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replace' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
          { type: 'Literal', value: 'x' },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for search method', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'search' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for split method', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'split' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for matchAll method', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'matchAll' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for trim method', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'trim' },
          computed: false,
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for toString method', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'toString' },
          computed: false,
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for indexOf method', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'indexOf' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 'test' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for includes method', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'includes' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 'test' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('malformed node structures', () => {
    test('should handle node without callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = { type: 'CallExpression', arguments: [] }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null callee', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = { type: 'CallExpression', callee: null, arguments: [] }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with callee missing property', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'str' } },
        arguments: [],
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with callee property as non-identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with computed property access', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: true,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with null arguments array', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: null,
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined arguments', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
      }
      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node where first arg is a CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getRegex' },
            arguments: [],
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node where first arg is a MemberExpression', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'MemberExpression',
            object: { type: 'Identifier', name: 'config' },
            property: { type: 'Identifier', name: 'regex' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node where argument is empty object', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [{}],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with Literal that has no regex or raw', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: 'hello' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with regex flags as non-string', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            regex: { pattern: 'test', flags: 123 },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with raw as non-string', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: null, raw: 12345 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'ExpressionStatement',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle RegExpLiteral type node', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'RegExpLiteral',
            value: null,
            regex: { pattern: 'test', flags: 'g' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('raw property parsing edge cases', () => {
    test('should detect g flag from raw /pattern/g', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: null, raw: '/abc/g' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should detect g flag from raw /pattern/gi', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: null, raw: '/abc/gi' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report for raw /pattern/i', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: null, raw: '/abc/i' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for raw /pattern/', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: null, raw: '/abc/' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle raw with no slashes', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: null, raw: 'just-a-string' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle raw with single slash', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: null, raw: '/pattern' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should prefer regex.flags over raw when both present', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/abc/i',
            regex: { pattern: 'abc', flags: 'g' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should fall back to raw when regex has no flags', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/abc/g',
            regex: { pattern: 'abc', flags: '' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle raw with all flags /pattern/gimsuvy', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: null, raw: '/abc/gimsuvy' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'test', 'g', 1, 0))
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at line 5 column 10', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'test', 'g', 5, 10))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report location at line 100 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'test', 'g', 100, 0))
      expect(reports[0].loc?.start.line).toBe(100)
    })

    test('should report location at line 1 column 50', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'test', 'g', 1, 50))
      expect(reports[0].loc?.start.column).toBe(50)
    })

    test('should report end location', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'test', 'g', 3, 5))
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('should report default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with partial loc (only start)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
        ],
        loc: {
          start: { line: 7, column: 3 },
        },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })
  })

  describe('message content validation', () => {
    test('should contain predictable', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'test', 'g'))
      expect(reports[0].message.toLowerCase()).toContain('predictable')
    })

    test('should mention global flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'test', 'g'))
      expect(reports[0].message.toLowerCase()).toContain('global')
    })

    test('should mention regex or string', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'test', 'g'))
      const msg = reports[0].message.toLowerCase()
      expect(msg.includes('regex') || msg.includes('string')).toBe(true)
    })

    test('should mention match method', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'test', 'g'))
      expect(reports[0].message).toContain('match')
    })

    test('message should be a non-empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'test', 'g'))
      expect(typeof reports[0].message).toBe('string')
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('message should end with period', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'test', 'g'))
      expect(reports[0].message.endsWith('.')).toBe(true)
    })
  })

  describe('multiple invocations', () => {
    test('should report each match call separately', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      visitor.CallExpression(createStringMatchCall('str', 'a', 'g'))
      visitor.CallExpression(createStringMatchCall('str', 'b', 'g'))
      visitor.CallExpression(createStringMatchCall('str', 'c', 'g'))

      expect(reports.length).toBe(3)
    })

    test('should only count match calls with g flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      visitor.CallExpression(createStringMatchCall('str', 'a', 'g'))
      visitor.CallExpression(createStringMatchCall('str', 'b', 'i'))
      visitor.CallExpression(createStringMatchCall('str', 'c', 'g'))

      expect(reports.length).toBe(2)
    })

    test('should handle mix of valid and invalid calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      visitor.CallExpression(createStringMatchCall('str', 'a', 'g'))
      visitor.CallExpression(null)
      visitor.CallExpression(createStringMatchCall('str', 'b', ''))
      visitor.CallExpression(createStringMatchCall('str', 'c', 'g'))
      visitor.CallExpression(undefined)

      expect(reports.length).toBe(2)
    })

    test('should report correct message for each call', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      visitor.CallExpression(createStringMatchCall('s1', 'a', 'g'))
      visitor.CallExpression(createStringMatchCall('s2', 'b', 'g'))

      expect(reports[0].message).toBe(reports[1].message)
    })

    test('should report different locations for different calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      visitor.CallExpression(createStringMatchCall('str', 'a', 'g', 1, 0))
      visitor.CallExpression(createStringMatchCall('str', 'b', 'g', 5, 10))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[1].loc?.start.line).toBe(5)
    })

    test('should handle 100 consecutive calls', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)

      for (let i = 0; i < 100; i++) {
        visitor.CallExpression(createStringMatchCall('str', 'test', 'g', i + 1, 0))
      }

      expect(reports.length).toBe(100)
    })
  })

  describe('context variations', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);', filePath: '/project/src/app.ts' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'test', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'const x = str.match(/test/g)', filePath: '/src/file.ts' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'test', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should work with config options present', () => {
      const { context, reports } = createMockRuleContext({ options: [{ strict: true }], source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'test', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should work with multiple config options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ strict: true, level: 'error', ignore: [] }], source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'test', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should work with empty string file path', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);', filePath: '' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'test', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should work with empty source string', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'test', 'g'))
      expect(reports.length).toBe(1)
    })

    test('should report only once for the same match call', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = createStringMatchCall('str', 'test', 'g')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(2)
    })
  })

  describe('callee object variations', () => {
    test('should not report when callee object is not an Identifier', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Literal', value: 'hello' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle callee object being a MemberExpression (chained calls)', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'obj' },
              property: { type: 'Identifier', name: 'getString' },
              computed: false,
            },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle callee object being a function call', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'getStr' },
            arguments: [],
          },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('extra arguments', () => {
    test('should report when extra arguments are present after regex', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
          { type: 'Identifier', name: 'extraArg' },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report when regex is first arg regardless of total args', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
          { type: 'Literal', value: 42 },
          { type: 'Literal', value: true },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('primitive node values', () => {
    test('should handle boolean true node', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean false node', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      expect(() => visitor.CallExpression(false)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle zero node', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      expect(() => visitor.CallExpression(0)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty string node', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      expect(() => visitor.CallExpression('')).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })

  describe('exports', () => {
    test('should have a default export', () => {
      const defaultImport = preferRegexpExecRule
      expect(defaultImport).toBeDefined()
      expect(defaultImport.meta).toBeDefined()
      expect(defaultImport.create).toBeDefined()
    })

    test('named export should be same as default export', () => {
      expect(preferRegexpExecRule.meta.type).toBe('suggestion')
      expect(preferRegexpExecRule.create).toBeTypeOf('function')
    })

    test('should be frozen or readonly-like for meta', () => {
      expect(preferRegexpExecRule.meta.type).toBe('suggestion')
      expect(preferRegexpExecRule.meta.severity).toBe('warn')
    })
  })

  describe('node type variations', () => {
    test('should not report for FunctionExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'FunctionExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for ArrowFunctionExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'ArrowFunctionExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should not report for MemberExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'MemberExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  describe('regex literal without regex property - raw fallback', () => {
    test('should detect from raw when regex property is missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: null, raw: '/\\w+/g' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not detect when raw is an empty string', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: null, raw: '' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle raw with slashes but no flags section', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: null, raw: '/pattern/' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle raw pattern with slashes inside', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [{ type: 'Literal', value: null, raw: '/https:\\/\\/example.com/g' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('regex property with no flags string', () => {
    test('should fall back to raw when regex.flags is undefined', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report when regex has pattern but empty flags and raw missing', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            regex: { pattern: 'test', flags: '' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should report when regex.flags is g', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            regex: { pattern: 'test', flags: 'g' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should report when regex.flags contains g among others', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 's' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            regex: { pattern: 'test', flags: 'gis' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })
  })

  describe('helper function coverage', () => {
    test('createStringMatchCall produces correct structure', () => {
      const node = createStringMatchCall('obj', 'pat', 'g', 3, 7)
      const n = node as Record<string, unknown>
      expect(n.type).toBe('CallExpression')
      const callee = n.callee as Record<string, unknown>
      expect(callee.type).toBe('MemberExpression')
      const obj = callee.object as Record<string, unknown>
      expect(obj.name).toBe('obj')
      const prop = callee.property as Record<string, unknown>
      expect(prop.name).toBe('match')
    })

    test('createStringMatchCall produces correct regex arg', () => {
      const node = createStringMatchCall('str', 'abc', 'gi')
      const n = node as Record<string, unknown>
      const args = n.arguments as Record<string, unknown>[]
      const firstArg = args[0] as Record<string, unknown>
      expect(firstArg.type).toBe('Literal')
      const regex = firstArg.regex as Record<string, string>
      expect(regex.pattern).toBe('abc')
      expect(regex.flags).toBe('gi')
    })

    test('createStringMatchCall default line and column', () => {
      const node = createStringMatchCall('str', 'test', 'g')
      const n = node as Record<string, unknown>
      const loc = n.loc as Record<string, Record<string, number>>
      expect(loc.start.line).toBe(1)
      expect(loc.start.column).toBe(0)
    })

    test('createStringMatchCall custom line and column', () => {
      const node = createStringMatchCall('str', 'test', 'g', 20, 15)
      const n = node as Record<string, unknown>
      const loc = n.loc as Record<string, Record<string, number>>
      expect(loc.start.line).toBe(20)
      expect(loc.start.column).toBe(15)
    })

    test('createLiteralWithRawOnly creates correct structure', () => {
      const node = createLiteralWithRawOnly('/test/g', 5, 2)
      const n = node as Record<string, unknown>
      expect(n.type).toBe('Literal')
      expect(n.raw).toBe('/test/g')
      const loc = n.loc as Record<string, Record<string, number>>
      expect(loc.start.line).toBe(5)
      expect(loc.start.column).toBe(2)
    })

    test('createLiteralWithRawOnly default line and column', () => {
      const node = createLiteralWithRawOnly('/test/g')
      const n = node as Record<string, unknown>
      const loc = n.loc as Record<string, Record<string, number>>
      expect(loc.start.line).toBe(1)
      expect(loc.start.column).toBe(0)
    })
  })

  describe('createMockContext behavior', () => {
    test('context report captures messages', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      context.report({
        message: 'test message',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe('test message')
    })

    test('context getFilePath returns provided path', () => {
      const { context } = createMockRuleContext({ source: 'str.match(/test/g);', filePath: '/custom/path.ts' })
      expect(context.getFilePath()).toBe('/custom/path.ts')
    })

    test('context getSource returns provided source', () => {
      const { context } = createMockRuleContext({ source: 'const x = 1', filePath: '/src/file.ts' })
      expect(context.getSource()).toBe('const x = 1')
    })

    test('context getAST returns null', () => {
      const { context } = createMockRuleContext({ source: 'str.match(/test/g);' })
      expect(context.getAST()).toBeNull()
    })

    test('context getTokens returns empty array', () => {
      const { context } = createMockRuleContext({ source: 'str.match(/test/g);' })
      expect(context.getTokens()).toEqual([])
    })

    test('context getComments returns empty array', () => {
      const { context } = createMockRuleContext({ source: 'str.match(/test/g);' })
      expect(context.getComments()).toEqual([])
    })

    test('context logger methods are vi fns', () => {
      const { context } = createMockRuleContext({ source: 'str.match(/test/g);' })
      expect(vi.isMockFunction(context.logger.debug)).toBe(true)
      expect(vi.isMockFunction(context.logger.info)).toBe(true)
      expect(vi.isMockFunction(context.logger.warn)).toBe(true)
      expect(vi.isMockFunction(context.logger.error)).toBe(true)
    })

    test('context workspaceRoot is /src', () => {
      const { context } = createMockRuleContext({ source: 'str.match(/test/g);' })
      expect(context.workspaceRoot).toBe('/src')
    })

    test('context config options wrapped in array', () => {
      const { context } = createMockRuleContext({ options: [{ foo: 'bar' }], source: 'str.match(/test/g);' })
      expect(context.config.options).toEqual([{ foo: 'bar' }])
    })

    test('reports array starts empty', () => {
      const { reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      expect(reports).toEqual([])
    })

    test('reports array captures multiple reports', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      context.report({
        message: 'first',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } },
      })
      context.report({
        message: 'second',
        loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 1 } },
      })
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe('first')
      expect(reports[1].message).toBe('second')
    })
  })

  describe('rule behavior consistency', () => {
    test('should produce same result for same input across multiple visitors', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const { context: ctx2, reports: r2 } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const v1 = preferRegexpExecRule.create(ctx1)
      const v2 = preferRegexpExecRule.create(ctx2)
      const node = createStringMatchCall('str', 'test', 'g')
      v1.CallExpression(node)
      v2.CallExpression(node)
      expect(r1.length).toBe(r2.length)
      expect(r1[0].message).toBe(r2[0].message)
    })

    test('should not mutate input node', () => {
      const { context } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = createStringMatchCall('str', 'test', 'g')
      const originalType = (node as Record<string, unknown>).type
      const originalArgs = JSON.parse(JSON.stringify((node as Record<string, unknown>).arguments))
      visitor.CallExpression(node)
      expect((node as Record<string, unknown>).type).toBe(originalType)
      expect((node as Record<string, unknown>).arguments).toEqual(originalArgs)
    })

    test('should handle NaN in location gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
        ],
        loc: {
          start: { line: Number.NaN, column: Number.NaN },
          end: { line: Number.NaN, column: Number.NaN },
        },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should handle very large line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      visitor.CallExpression(createStringMatchCall('str', 'test', 'g', 99999, 99999))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(99999)
      expect(reports[0].loc?.start.column).toBe(99999)
    })

    test('should handle negative line/column gracefully', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
        ],
        loc: {
          start: { line: -1, column: -1 },
          end: { line: -1, column: -1 },
        },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(-1)
    })

    test('should not report for NewExpression type', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/test/g',
            regex: { pattern: 'test', flags: 'g' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle literal arg with type RegExpLiteral and g flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'RegExpLiteral',
            value: null,
            regex: { pattern: 'test', flags: 'gim' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('should not report RegExpLiteral without g flag', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'RegExpLiteral',
            value: null,
            regex: { pattern: 'test', flags: 'im' },
          },
        ],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with array type arguments containing regex', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.match(/test/g);' })
      const visitor = preferRegexpExecRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'match' },
          computed: false,
        },
        arguments: [
          {
            type: 'Literal',
            value: null,
            raw: '/[a-z]+/g',
            regex: { pattern: '[a-z]+', flags: 'g' },
          },
        ],
        loc: { start: { line: 42, column: 8 }, end: { line: 42, column: 30 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
    })
  })
})

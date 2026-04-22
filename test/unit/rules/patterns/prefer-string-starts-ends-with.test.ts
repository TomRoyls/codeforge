import { describe, test, expect, vi } from 'vitest'
import { preferStringStartsEndsWithRule } from '../../../../src/rules/patterns/prefer-string-starts-ends-with.js'
import type { RuleContext } from '../../../../src/plugins/types.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'

function createCallExpression(callee: unknown, args: unknown[], line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createMemberExpression(object: unknown, property: string, line = 1, column = 0): unknown {
  return {
    type: 'MemberExpression',
    object,
    property: {
      type: 'Identifier',
      name: property,
      loc: {
        start: { line, column: column + 5 },
        end: { line, column: column + 10 },
      },
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createRegexLiteral(regex: RegExp, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value: regex,
    regex: {
      pattern: regex.source,
      flags: regex.flags,
    },
    loc: {
      start: { line, column },
      end: { line, column: column + 10 },
    },
  }
}

function createIdentifier(name: string, line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name,
    loc: {
      start: { line, column },
      end: { line, column: column + name.length },
    },
  }
}

function createBinaryExpression(
  left: unknown,
  right: unknown,
  operator: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'BinaryExpression',
    left,
    right,
    operator,
    loc: {
      start: { line, column },
      end: { line, column: column + 20 },
    },
  }
}

function createLiteral(value: unknown, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

describe('prefer-string-starts-ends-with rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(preferStringStartsEndsWithRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(preferStringStartsEndsWithRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(preferStringStartsEndsWithRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(preferStringStartsEndsWithRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(preferStringStartsEndsWithRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(preferStringStartsEndsWithRule.meta.fixable).toBe('code')
    })

    test('should mention startsWith and endsWith in description', () => {
      const description = preferStringStartsEndsWithRule.meta.docs?.description.toLowerCase()
      expect(description).toContain('starts')
      expect(description).toContain('ends')
    })

    test('should have a non-empty description', () => {
      expect(preferStringStartsEndsWithRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have type property as a string', () => {
      expect(typeof preferStringStartsEndsWithRule.meta.type).toBe('string')
    })

    test('should have severity property as a string', () => {
      expect(typeof preferStringStartsEndsWithRule.meta.severity).toBe('string')
    })

    test('should have docs property defined', () => {
      expect(preferStringStartsEndsWithRule.meta.docs).toBeDefined()
    })

    test('should have docs.url defined', () => {
      expect(preferStringStartsEndsWithRule.meta.docs?.url).toBeDefined()
    })

    test('should have a valid docs.url containing rule name', () => {
      expect(preferStringStartsEndsWithRule.meta.docs?.url).toContain(
        'prefer-string-starts-ends-with',
      )
    })

    test('should have fixable value of code', () => {
      expect(preferStringStartsEndsWithRule.meta.fixable).toBe('code')
    })

    test('should not be deprecated', () => {
      expect(preferStringStartsEndsWithRule.meta.deprecated).toBeFalsy()
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(preferStringStartsEndsWithRule.meta.schema)).toBe(true)
    })

    test('should have meta object defined', () => {
      expect(preferStringStartsEndsWithRule.meta).toBeDefined()
    })

    test('should have recommended as boolean true', () => {
      expect(preferStringStartsEndsWithRule.meta.docs?.recommended).toBe(true)
    })

    test('should have category as string', () => {
      expect(typeof preferStringStartsEndsWithRule.meta.docs?.category).toBe('string')
    })

    test('should have description mentioning readability', () => {
      const description = preferStringStartsEndsWithRule.meta.docs?.description.toLowerCase()
      expect(description).toContain('readability')
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(visitor).toHaveProperty('BinaryExpression')
    })

    test('should return CallExpression as a function', () => {
      const { context } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return BinaryExpression as a function', () => {
      const { context } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(typeof visitor.BinaryExpression).toBe('function')
    })

    test('should return exactly two visitor methods', () => {
      const { context } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(Object.keys(visitor).length).toBe(2)
    })

    test('should not return undefined visitor', () => {
      const { context } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(visitor).toBeDefined()
      expect(visitor).not.toBeNull()
    })

    test('should create a new visitor instance each time', () => {
      const { context } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor1 = preferStringStartsEndsWithRule.create(context)
      const visitor2 = preferStringStartsEndsWithRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should accept context without throwing', () => {
      const { context } = createMockRuleContext({ source: '/^abc/.test(str);' })

      expect(() => preferStringStartsEndsWithRule.create(context)).not.toThrow()
    })

    test('should create visitor that handles being called with no arguments', () => {
      const { context } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(() => visitor.CallExpression()).not.toThrow()
    })
  })

  describe('regex .test() pattern detection', () => {
    test('should report regex test with startsWith pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('startsWith')
    })

    test('should report regex test with endsWith pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/abc$/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('endsWith')
    })

    test('should report simple alphanumeric startsWith pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^Hello/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report simple alphanumeric endsWith pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/World$/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex with underscore in startsWith pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^my_prefix/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex with numbers in startsWith pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^test123/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex with underscore in endsWith pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/suffix_name$/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex with numbers in endsWith pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/v2$/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex with mixed alphanumeric endsWith pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/abc123xyz$/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex with single char startsWith pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^a/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex with single char endsWith pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/z$/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex with space in startsWith pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^hello world/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex with space in endsWith pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/hello world$/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report long alphanumeric startsWith pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^VeryLongPrefix12345/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('text')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report long alphanumeric endsWith pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/VeryLongSuffix12345$/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('text')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('regex .match() pattern detection', () => {
    test('should report string match with startsWith regex', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'match')
      const regex = createRegexLiteral(/^abc/)
      const args = [regex]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('startsWith')
    })

    test('should report string match with endsWith regex', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'match')
      const regex = createRegexLiteral(/abc$/)
      const args = [regex]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('endsWith')
    })

    test('should report match with single char startsWith regex', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('s')
      const callee = createMemberExpression(strIdent, 'match')
      const regex = createRegexLiteral(/^x/)
      const args = [regex]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report match with underscored startsWith regex', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'match')
      const regex = createRegexLiteral(/^my_value/)
      const args = [regex]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report match with numeric endsWith regex', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'match')
      const regex = createRegexLiteral(/2024$/)
      const args = [regex]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('indexOf() === 0 pattern detection', () => {
    test('should report indexOf === 0 pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('prefix')])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('startsWith')
    })

    test('should report indexOf == 0 pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('prefix')])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report 0 === indexOf pattern (reversed)', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('prefix')])
      const node = createBinaryExpression(createLiteral(0), indexOfCall, '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report 0 == indexOf pattern (reversed loose)', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('abc')])
      const node = createBinaryExpression(createLiteral(0), indexOfCall, '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report indexOf on different variable names', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('myStringVar')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('prefix')])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('lastIndexOf() pattern detection', () => {
    test('should report lastIndexOf compared to length expression', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const lastIndexOfCallee = createMemberExpression(strIdent, 'lastIndexOf')
      const lastIndexOfCall = createCallExpression(lastIndexOfCallee, [createLiteral('suffix')])
      const lengthMember = createMemberExpression(strIdent, 'length')
      const node = createBinaryExpression(lastIndexOfCall, lengthMember, '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('endsWith')
    })

    test('should report lastIndexOf with == operator', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('s')
      const lastIndexOfCallee = createMemberExpression(strIdent, 'lastIndexOf')
      const lastIndexOfCall = createCallExpression(lastIndexOfCallee, [createLiteral('x')])
      const lengthMember = createMemberExpression(strIdent, 'length')
      const node = createBinaryExpression(lastIndexOfCall, lengthMember, '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report reversed lastIndexOf === length pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('text')
      const lastIndexOfCallee = createMemberExpression(strIdent, 'lastIndexOf')
      const lastIndexOfCall = createCallExpression(lastIndexOfCallee, [createLiteral('end')])
      const lengthMember = createMemberExpression(strIdent, 'length')
      const node = createBinaryExpression(lengthMember, lastIndexOfCall, '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report lastIndexOf on long variable name', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('myLongVariableName')
      const lastIndexOfCallee = createMemberExpression(strIdent, 'lastIndexOf')
      const lastIndexOfCall = createCallExpression(lastIndexOfCallee, [createLiteral('tail')])
      const lengthMember = createMemberExpression(strIdent, 'length')
      const node = createBinaryExpression(lastIndexOfCall, lengthMember, '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('NOT reporting', () => {
    test('should not report regex test with pattern containing dot special char', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc\./)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex test with case-insensitive flag', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/i)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex test with multiline flag', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/abc$/m)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex test with both ^ and $', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc$/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex test without ^ or $', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/abc/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report non-regex literal test call', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const stringLit = createLiteral('abc')
      const callee = createMemberExpression(stringLit, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report test call with wrong number of arguments', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str'), createLiteral('extra')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report test call with no arguments', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report string match with complex regex', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'match')
      const regex = createRegexLiteral(/^abc\./)
      const args = [regex]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report string match with flags', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'match')
      const regex = createRegexLiteral(/^abc/i)
      const args = [regex]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf !== 0', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('prefix')])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '!==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf > 0', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('prefix')])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '>')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf === non-zero', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('prefix')])
      const node = createBinaryExpression(indexOfCall, createLiteral(5), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf with multiple arguments', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [
        createLiteral('prefix'),
        createLiteral(5),
      ])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report lastIndexOf with non-length comparison', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const lastIndexOfCallee = createMemberExpression(strIdent, 'lastIndexOf')
      const lastIndexOfCall = createCallExpression(lastIndexOfCallee, [createLiteral('suffix')])
      const node = createBinaryExpression(lastIndexOfCall, createLiteral(5), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report lastIndexOf without arguments', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const lastIndexOfCallee = createMemberExpression(strIdent, 'lastIndexOf')
      const lastIndexOfCall = createCallExpression(lastIndexOfCallee, [])
      const lengthMember = createMemberExpression(strIdent, 'length')
      const node = createBinaryExpression(lastIndexOfCall, lengthMember, '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report other method calls on regex like exec', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'exec')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report other method calls on string like trim', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'trim')
      const node = createCallExpression(callee, [])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex with star quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc*/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex with plus quantifier', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc+/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex with question mark', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc?/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex with parentheses', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^(abc)/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex with pipe alternation', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc|def/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex with brackets', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^[abc]/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report regex with global flag (g flag is allowed)', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/g)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report regex with both i and m flags', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/im)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report match call with multiple arguments', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'match')
      const regex = createRegexLiteral(/^abc/)
      const args = [regex, createLiteral('extra')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report match with non-regex argument', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'match')
      const args = [createLiteral('not-a-regex')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf with != operator', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('prefix')])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '!=')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report lastIndexOf with !== operator', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const lastIndexOfCallee = createMemberExpression(strIdent, 'lastIndexOf')
      const lastIndexOfCall = createCallExpression(lastIndexOfCallee, [createLiteral('suffix')])
      const lengthMember = createMemberExpression(strIdent, 'length')
      const node = createBinaryExpression(lastIndexOfCall, lengthMember, '!==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report match with multiline flag regex', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'match')
      const regex = createRegexLiteral(/abc$/m)
      const args = [regex]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node in CallExpression', () => {
      const { context } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node in CallExpression', () => {
      const { context } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node in CallExpression (string)', () => {
      const { context } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
    })

    test('should handle non-object node in CallExpression (number)', () => {
      const { context } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle non-object node in CallExpression (boolean)', () => {
      const { context } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(() => visitor.CallExpression(true)).not.toThrow()
    })

    test('should handle null node in BinaryExpression', () => {
      const { context } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(() => visitor.BinaryExpression(null)).not.toThrow()
    })

    test('should handle undefined node in BinaryExpression', () => {
      const { context } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(() => visitor.BinaryExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node in BinaryExpression (string)', () => {
      const { context } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(() => visitor.BinaryExpression('string')).not.toThrow()
    })

    test('should handle non-object node in BinaryExpression (number)', () => {
      const { context } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      expect(() => visitor.BinaryExpression(123)).not.toThrow()
    })

    test('should handle node without loc in CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const regexObj = regex as Record<string, unknown>
      delete regexObj.loc
      const callee = createMemberExpression(regex, 'test')
      const calleeObj = callee as Record<string, unknown>
      delete calleeObj.loc
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)
      const nodeObj = node as Record<string, unknown>
      delete nodeObj.loc

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle node without loc in BinaryExpression', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('prefix')])
      const indexOfCallObj = indexOfCall as Record<string, unknown>
      delete indexOfCallObj.loc
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '===')
      const nodeObj = node as Record<string, unknown>
      delete nodeObj.loc

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle undefined options array', () => {
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
        getSource: () => '/^abc/.test(str);',
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

      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle CallExpression with empty callee', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const node = { type: 'CallExpression', callee: null, arguments: [] }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle BinaryExpression with missing left/right', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const node = { type: 'BinaryExpression', left: null, right: null, operator: '===' }

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle node with wrong type string in CallExpression', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const node = { type: 'OtherExpression', callee: null, arguments: [] }

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle regex literal with null value', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = { type: 'Literal', value: null, regex: { pattern: '^abc', flags: '' } }
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle callee property being non-identifier', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const calleeObj = callee as Record<string, unknown>
      calleeObj.property = { type: 'Literal', value: 'test' }
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty startsWith regex pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty endsWith regex pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/$/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle match on member expression object', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const innerObj = createIdentifier('obj')
      const strMember = createMemberExpression(innerObj, 'str')
      const callee = createMemberExpression(strMember, 'match')
      const regex = createRegexLiteral(/^abc/)
      const args = [regex]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report correct location for regex test startsWith', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/, 10, 5)
      const callee = createMemberExpression(regex, 'test', 10, 5)
      const args = [createIdentifier('str', 10, 15)]
      const node = createCallExpression(callee, args, 10, 5)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should report correct location for regex test endsWith', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/xyz$/, 15, 8)
      const callee = createMemberExpression(regex, 'test', 15, 8)
      const args = [createIdentifier('str', 15, 18)]
      const node = createCallExpression(callee, args, 15, 8)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(15)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('should report correct location for indexOf pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str', 20, 3)
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf', 20, 3)
      const indexOfCall = createCallExpression(
        indexOfCallee,
        [createLiteral('prefix', 20, 12)],
        20,
        3,
      )
      const node = createBinaryExpression(indexOfCall, createLiteral(0, 20, 25), '===', 20, 3)

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report correct location for match startsWith', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str', 5, 10)
      const callee = createMemberExpression(strIdent, 'match', 5, 10)
      const regex = createRegexLiteral(/^abc/, 5, 18)
      const args = [regex]
      const node = createCallExpression(callee, args, 5, 10)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report correct location for match endsWith', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str', 8, 2)
      const callee = createMemberExpression(strIdent, 'match', 8, 2)
      const regex = createRegexLiteral(/abc$/, 8, 10)
      const args = [regex]
      const node = createCallExpression(callee, args, 8, 2)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(8)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('should report location with end position', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/, 3, 0)
      const callee = createMemberExpression(regex, 'test', 3, 0)
      const args = [createIdentifier('str', 3, 12)]
      const node = createCallExpression(callee, args, 3, 0)

      visitor.CallExpression(node)

      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('should report location for lastIndexOf pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str', 12, 4)
      const lastIndexOfCallee = createMemberExpression(strIdent, 'lastIndexOf', 12, 4)
      const lastIndexOfCall = createCallExpression(
        lastIndexOfCallee,
        [createLiteral('suffix', 12, 14)],
        12,
        4,
      )
      const lengthMember = createMemberExpression(strIdent, 'length', 12, 30)
      const node = createBinaryExpression(lastIndexOfCall, lengthMember, '===', 12, 4)

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report location at line 1 column 0', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/, 1, 0)
      const callee = createMemberExpression(regex, 'test', 1, 0)
      const args = [createIdentifier('str', 1, 12)]
      const node = createCallExpression(callee, args, 1, 0)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report location at high line numbers', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/, 500, 20)
      const callee = createMemberExpression(regex, 'test', 500, 20)
      const args = [createIdentifier('str', 500, 32)]
      const node = createCallExpression(callee, args, 500, 20)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.line).toBe(500)
      expect(reports[0].loc?.start.column).toBe(20)
    })

    test('should report location for reversed indexOf pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str', 7, 0)
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf', 7, 0)
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('a', 7, 10)], 7, 0)
      const node = createBinaryExpression(createLiteral(0, 7, 20), indexOfCall, '===', 7, 0)

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('should have both start and end in location for regex test', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/, 2, 4)
      const callee = createMemberExpression(regex, 'test', 2, 4)
      const args = [createIdentifier('str', 2, 16)]
      const node = createCallExpression(callee, args, 2, 4)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
      expect(typeof reports[0].loc?.start.line).toBe('number')
      expect(typeof reports[0].loc?.start.column).toBe('number')
      expect(typeof reports[0].loc?.end.line).toBe('number')
      expect(typeof reports[0].loc?.end.column).toBe('number')
    })

    test('should provide default location when node has no loc', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const regexObj = regex as Record<string, unknown>
      delete regexObj.loc
      const callee = createMemberExpression(regex, 'test')
      const calleeObj = callee as Record<string, unknown>
      delete calleeObj.loc
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)
      const nodeObj = node as Record<string, unknown>
      delete nodeObj.loc

      visitor.CallExpression(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('should report correct location for indexOf on line 1', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('s', 1, 0)
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf', 1, 0)
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('x', 1, 8)], 1, 0)
      const node = createBinaryExpression(indexOfCall, createLiteral(0, 1, 16), '===', 1, 0)

      visitor.BinaryExpression(node)

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should preserve exact column offset for regex match', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str', 4, 7)
      const callee = createMemberExpression(strIdent, 'match', 4, 7)
      const regex = createRegexLiteral(/^prefix/, 4, 15)
      const args = [regex]
      const node = createCallExpression(callee, args, 4, 7)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('should report location with column 0', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/end$/, 3, 0)
      const callee = createMemberExpression(regex, 'test', 3, 0)
      const args = [createIdentifier('str', 3, 10)]
      const node = createCallExpression(callee, args, 3, 0)

      visitor.CallExpression(node)

      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  describe('message quality', () => {
    test('should mention startsWith in message for startsWith regex test', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('startswith')
    })

    test('should mention endsWith in message for endsWith regex test', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/abc$/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('endswith')
    })

    test('should have a non-empty message', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports[0].message).toBeTruthy()
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('should mention start in startsWith regex test message', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^prefix/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('start')
    })

    test('should mention end in endsWith regex test message', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/suffix$/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('end')
    })

    test('should mention start in indexOf message', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('prefix')])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '===')

      visitor.BinaryExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('start')
    })

    test('should mention startsWith in indexOf message', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('prefix')])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '===')

      visitor.BinaryExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('startswith')
    })

    test('should mention endsWith in lastIndexOf message', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const lastIndexOfCallee = createMemberExpression(strIdent, 'lastIndexOf')
      const lastIndexOfCall = createCallExpression(lastIndexOfCallee, [createLiteral('suffix')])
      const lengthMember = createMemberExpression(strIdent, 'length')
      const node = createBinaryExpression(lastIndexOfCall, lengthMember, '===')

      visitor.BinaryExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('endswith')
    })

    test('should mention endsWith in match endsWith message', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'match')
      const regex = createRegexLiteral(/suffix$/)
      const args = [regex]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('endswith')
    })

    test('should mention regex in regex test message', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const args = [createIdentifier('str')]
      const node = createCallExpression(callee, args)

      visitor.CallExpression(node)

      expect(reports[0].message.toLowerCase()).toContain('regex')
    })
  })

  describe('multiple reports', () => {
    test('should report separately for each regex test call', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex1 = createRegexLiteral(/^abc/)
      const callee1 = createMemberExpression(regex1, 'test')
      const node1 = createCallExpression(callee1, [createIdentifier('str')])

      const regex2 = createRegexLiteral(/xyz$/)
      const callee2 = createMemberExpression(regex2, 'test')
      const node2 = createCallExpression(callee2, [createIdentifier('str')])

      visitor.CallExpression(node1)
      visitor.CallExpression(node2)

      expect(reports.length).toBe(2)
    })

    test('should report separately for each match call', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')

      const callee1 = createMemberExpression(strIdent, 'match')
      const node1 = createCallExpression(callee1, [createRegexLiteral(/^abc/)])

      const callee2 = createMemberExpression(strIdent, 'match')
      const node2 = createCallExpression(callee2, [createRegexLiteral(/def$/)])

      visitor.CallExpression(node1)
      visitor.CallExpression(node2)

      expect(reports.length).toBe(2)
    })

    test('should report separately for multiple indexOf calls', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee1 = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall1 = createCallExpression(indexOfCallee1, [createLiteral('a')])
      const node1 = createBinaryExpression(indexOfCall1, createLiteral(0), '===')

      const indexOfCallee2 = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall2 = createCallExpression(indexOfCallee2, [createLiteral('b')])
      const node2 = createBinaryExpression(indexOfCall2, createLiteral(0), '===')

      visitor.BinaryExpression(node1)
      visitor.BinaryExpression(node2)

      expect(reports.length).toBe(2)
    })

    test('should report both CallExpression and BinaryExpression patterns', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const callNode = createCallExpression(callee, [createIdentifier('str')])

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('x')])
      const binaryNode = createBinaryExpression(indexOfCall, createLiteral(0), '===')

      visitor.CallExpression(callNode)
      visitor.BinaryExpression(binaryNode)

      expect(reports.length).toBe(2)
    })

    test('should report three different patterns', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex1 = createRegexLiteral(/^abc/)
      const callee1 = createMemberExpression(regex1, 'test')
      visitor.CallExpression(createCallExpression(callee1, [createIdentifier('s')]))

      const regex2 = createRegexLiteral(/xyz$/)
      const callee2 = createMemberExpression(regex2, 'test')
      visitor.CallExpression(createCallExpression(callee2, [createIdentifier('s')]))

      const strIdent = createIdentifier('s')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('a')])
      visitor.BinaryExpression(createBinaryExpression(indexOfCall, createLiteral(0), '==='))

      expect(reports.length).toBe(3)
    })

    test('should report mix of valid and invalid patterns correctly', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex1 = createRegexLiteral(/^abc/)
      const callee1 = createMemberExpression(regex1, 'test')
      visitor.CallExpression(createCallExpression(callee1, [createIdentifier('s')]))

      const regex2 = createRegexLiteral(/^abc\./)
      const callee2 = createMemberExpression(regex2, 'test')
      visitor.CallExpression(createCallExpression(callee2, [createIdentifier('s')]))

      const regex3 = createRegexLiteral(/xyz$/)
      const callee3 = createMemberExpression(regex3, 'test')
      visitor.CallExpression(createCallExpression(callee3, [createIdentifier('s')]))

      expect(reports.length).toBe(2)
    })

    test('should accumulate reports across match and test calls', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('s')
      const matchCallee = createMemberExpression(strIdent, 'match')
      visitor.CallExpression(createCallExpression(matchCallee, [createRegexLiteral(/^a/)]))

      const testCallee = createMemberExpression(createRegexLiteral(/z$/), 'test')
      visitor.CallExpression(createCallExpression(testCallee, [createIdentifier('s')]))

      expect(reports.length).toBe(2)
      expect(reports[0].message.toLowerCase()).toContain('startswith')
      expect(reports[1].message.toLowerCase()).toContain('endswith')
    })

    test('should report five startsWith patterns separately', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      for (let i = 0; i < 5; i++) {
        const regex = createRegexLiteral(new RegExp(`^prefix${i}`))
        const callee = createMemberExpression(regex, 'test')
        visitor.CallExpression(createCallExpression(callee, [createIdentifier('s')]))
      }

      expect(reports.length).toBe(5)
    })

    test('should report five endsWith patterns separately', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      for (let i = 0; i < 5; i++) {
        const regex = createRegexLiteral(new RegExp(`suffix${i}$`))
        const callee = createMemberExpression(regex, 'test')
        visitor.CallExpression(createCallExpression(callee, [createIdentifier('s')]))
      }

      expect(reports.length).toBe(5)
    })

    test('should handle interleaved valid and invalid nodes', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createRegexLiteral(/^a/), 'test'), [
          createIdentifier('s'),
        ]),
      )

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createRegexLiteral(/abc/), 'test'), [
          createIdentifier('s'),
        ]),
      )

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createRegexLiteral(/z$/), 'test'), [
          createIdentifier('s'),
        ]),
      )

      visitor.CallExpression(
        createCallExpression(createMemberExpression(createRegexLiteral(/^abc/i), 'test'), [
          createIdentifier('s'),
        ]),
      )

      const strIdent = createIdentifier('s')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      visitor.BinaryExpression(
        createBinaryExpression(
          createCallExpression(indexOfCallee, [createLiteral('x')]),
          createLiteral(0),
          '===',
        ),
      )

      expect(reports.length).toBe(3)
    })
  })

  describe('context handling', () => {
    test('should work with different file paths', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);', filePath: '/project/src/utils.ts' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('str')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with different source code', () => {
      const { context, reports } = createMockRuleContext({ source: 'str.indexOf("x") === 0', filePath: '/src/file.ts' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('x')])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should work with custom options', () => {
      const { context, reports } = createMockRuleContext({ options: [{ someOption: true }], source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^test/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('str')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle context being used for multiple creates', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })

      const visitor1 = preferStringStartsEndsWithRule.create(context)
      const visitor2 = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('str')])

      visitor1.CallExpression(node)
      visitor2.CallExpression(node)

      expect(reports.length).toBe(2)
    })

    test('should use the same reports array for all visitor calls', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex1 = createRegexLiteral(/^abc/)
      const callee1 = createMemberExpression(regex1, 'test')
      visitor.CallExpression(createCallExpression(callee1, [createIdentifier('s')]))

      const regex2 = createRegexLiteral(/xyz$/)
      const callee2 = createMemberExpression(regex2, 'test')
      visitor.CallExpression(createCallExpression(callee2, [createIdentifier('s')]))

      expect(reports.length).toBe(2)
    })

    test('should handle empty source code', () => {
      const { context, reports } = createMockRuleContext({ source: '', filePath: '/src/file.ts' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('str')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle very long file path', () => {
      const longPath = '/very/long/path/that/goes/on/and/on/src/components/utils/helper.ts'
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);', filePath: longPath })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('str')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle binary expression with non-matching operator in context', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const lastIndexOfCallee = createMemberExpression(strIdent, 'lastIndexOf')
      const lastIndexOfCall = createCallExpression(lastIndexOfCallee, [createLiteral('x')])
      const node = createBinaryExpression(lastIndexOfCall, createLiteral(5), '>')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should handle context with workspace root', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('s')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should handle binary expression with indexOf and non-zero literal', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('s')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('x')])
      const node = createBinaryExpression(indexOfCall, createLiteral(-1), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each: regex startsWith patterns', () => {
    test.each([
      { pattern: /^a/, label: 'single letter a' },
      { pattern: /^Z/, label: 'single letter Z' },
      { pattern: /^abc/, label: 'simple abc' },
      { pattern: /^ABC/, label: 'uppercase ABC' },
      { pattern: /^Hello/, label: 'Hello' },
      { pattern: /^test123/, label: 'alphanumeric test123' },
      { pattern: /^my_var/, label: 'underscore my_var' },
      { pattern: /^hello_world/, label: 'underscore hello_world' },
      { pattern: /^a1b2c3/, label: 'mixed alphanumeric a1b2c3' },
      { pattern: /^LongPrefix/, label: 'LongPrefix' },
      { pattern: /^x/, label: 'single x' },
      { pattern: /^Data2024/, label: 'Data2024' },
    ])('should report startsWith regex /$label/ via test()', ({ pattern }) => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(pattern)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('str')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('startsWith')
    })
  })

  describe('test.each: regex endsWith patterns', () => {
    test.each([
      { pattern: /z$/, label: 'single z' },
      { pattern: /Z$/, label: 'single Z' },
      { pattern: /abc$/, label: 'simple abc' },
      { pattern: /XYZ$/, label: 'uppercase XYZ' },
      { pattern: /World$/, label: 'World' },
      { pattern: /2024$/, label: 'year 2024' },
      { pattern: /my_var$/, label: 'underscore my_var' },
      { pattern: /suffix_name$/, label: 'underscore suffix_name' },
      { pattern: /a1b2c3$/, label: 'mixed alphanumeric a1b2c3' },
      { pattern: /LongSuffix$/, label: 'LongSuffix' },
      { pattern: /x$/, label: 'single x' },
      { pattern: /tail$/, label: 'tail' },
    ])('should report endsWith regex /$label/ via test()', ({ pattern }) => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(pattern)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('str')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('endsWith')
    })
  })

  describe('test.each: regex patterns that should NOT report', () => {
    test.each([
      { pattern: /^abc\./, label: 'dot metachar' },
      { pattern: /^abc\*/, label: 'star quantifier' },
      { pattern: /^abc\+/, label: 'plus quantifier' },
      { pattern: /^abc\?/, label: 'question quantifier' },
      { pattern: /^abc$/, label: 'both anchors' },
      { pattern: /abc/, label: 'no anchors' },
      { pattern: /^abc/i, label: 'case insensitive flag' },
      { pattern: /abc$/m, label: 'multiline flag' },
      { pattern: /^abc|def/, label: 'alternation' },
      { pattern: /^[abc]/, label: 'character class' },
      { pattern: /^(abc)/, label: 'capturing group' },
      { pattern: /^abc$/, label: 'both anchors exact' },
    ])('should NOT report regex /$label/', ({ pattern }) => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(pattern)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('str')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each: indexOf operators', () => {
    test.each([
      { operator: '===', shouldReport: true },
      { operator: '==', shouldReport: true },
      { operator: '!==', shouldReport: false },
      { operator: '!=', shouldReport: false },
      { operator: '>', shouldReport: false },
      { operator: '<', shouldReport: false },
      { operator: '>=', shouldReport: false },
      { operator: '<=', shouldReport: false },
    ])('indexOf $operator 0 should $shouldReport report', ({ operator, shouldReport }) => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('x')])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), operator)

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(shouldReport ? 1 : 0)
    })
  })

  describe('test.each: match startsWith patterns', () => {
    test.each([
      { pattern: /^a/, label: 'single letter a' },
      { pattern: /^prefix/, label: 'prefix' },
      { pattern: /^ABC/, label: 'uppercase ABC' },
      { pattern: /^test_1/, label: 'underscore test_1' },
      { pattern: /^hello world/, label: 'hello world with space' },
      { pattern: /^Data2024/, label: 'Data2024' },
    ])('should report match startsWith regex /$label/', ({ pattern }) => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'match')
      const node = createCallExpression(callee, [createRegexLiteral(pattern)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('startsWith')
    })
  })

  describe('test.each: match endsWith patterns', () => {
    test.each([
      { pattern: /z$/, label: 'single z' },
      { pattern: /suffix$/, label: 'suffix' },
      { pattern: /XYZ$/, label: 'uppercase XYZ' },
      { pattern: /test_1$/, label: 'underscore test_1' },
      { pattern: /hello world$/, label: 'hello world with space' },
      { pattern: /2024$/, label: 'year 2024' },
    ])('should report match endsWith regex /$label/', ({ pattern }) => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'match')
      const node = createCallExpression(callee, [createRegexLiteral(pattern)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('endsWith')
    })
  })

  describe('test.each: match patterns that should NOT report', () => {
    test.each([
      { pattern: /^abc\./, label: 'dot metachar' },
      { pattern: /^abc/i, label: 'case insensitive flag' },
      { pattern: /^abc$/, label: 'both anchors' },
      { pattern: /abc/, label: 'no anchors' },
      { pattern: /^abc|def/, label: 'alternation' },
    ])('should NOT report match regex /$label/', ({ pattern }) => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'match')
      const node = createCallExpression(callee, [createRegexLiteral(pattern)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('test.each: lastIndexOf operators', () => {
    test.each([
      { operator: '===', shouldReport: true },
      { operator: '==', shouldReport: true },
      { operator: '!==', shouldReport: false },
      { operator: '!=', shouldReport: false },
    ])(
      'lastIndexOf $operator str.length should $shouldReport report',
      ({ operator, shouldReport }) => {
        const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
        const visitor = preferStringStartsEndsWithRule.create(context)

        const strIdent = createIdentifier('str')
        const lastIndexOfCallee = createMemberExpression(strIdent, 'lastIndexOf')
        const lastIndexOfCall = createCallExpression(lastIndexOfCallee, [createLiteral('x')])
        const lengthMember = createMemberExpression(strIdent, 'length')
        const node = createBinaryExpression(lastIndexOfCall, lengthMember, operator)

        visitor.BinaryExpression(node)

        expect(reports.length).toBe(shouldReport ? 1 : 0)
      },
    )
  })

  describe('additional detection tests', () => {
    test('should report regex test /^http/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^http/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('url')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('startsWith')
    })

    test('should report regex test /.json$/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/json$/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('filename')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('endsWith')
    })

    test('should report regex test /^https/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^https/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('url')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex test /Error$/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/Error$/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('msg')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report match /^get/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('method')
      const callee = createMemberExpression(strIdent, 'match')
      const node = createCallExpression(callee, [createRegexLiteral(/^get/)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report match /Controller$/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('className')
      const callee = createMemberExpression(strIdent, 'match')
      const node = createCallExpression(callee, [createRegexLiteral(/Controller$/)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report indexOf === 0 with string argument', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('path')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('/')])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report 0 == indexOf with string argument', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('path')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('/')])
      const node = createBinaryExpression(createLiteral(0), indexOfCall, '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report lastIndexOf === str.length with suffix', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('filename')
      const lastIndexOfCallee = createMemberExpression(strIdent, 'lastIndexOf')
      const lastIndexOfCall = createCallExpression(lastIndexOfCallee, [createLiteral('.ts')])
      const lengthMember = createMemberExpression(strIdent, 'length')
      const node = createBinaryExpression(lastIndexOfCall, lengthMember, '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex test /^v\d/ as NOT reportable (has backslash)', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^v\d/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('version')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex with escaped chars at end', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/abc\d$/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('str')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report regex /^www/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^www/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('hostname')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex /js$/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/js$/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('ext')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report regex /^$/ (both anchors empty)', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^$/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('str')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report regex test /^getUser/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^getUser/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('fn')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex test /Service$/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/Service$/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('name')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report match /^import/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('line')
      const callee = createMemberExpression(strIdent, 'match')
      const node = createCallExpression(callee, [createRegexLiteral(/^import/)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report match /export$/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('line')
      const callee = createMemberExpression(strIdent, 'match')
      const node = createCallExpression(callee, [createRegexLiteral(/export$/)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex test /^on/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^on/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('prop')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex test /Click$/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/Click$/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('prop')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report regex with word boundary at start', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^\babc/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('str')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex with word boundary at end', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/abc\b$/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('str')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report regex test /^is/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^is/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('name')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex test /abled$/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/abled$/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('name')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report indexOf === 0 with different identifiers', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('fileName')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('.')])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report regex test /^abc/s flag', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/s)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('str')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex test with s flag (dotAll is allowed)', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^test/s)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('str')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report regex test /^abc/gi flag', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/gi)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('str')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report regex test /^abc/gm flag', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/gm)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('str')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report regex test /^has/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^has/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('name')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex test /Handler$/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/Handler$/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('name')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report regex test /^abc/im flag combination', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^abc/im)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('str')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report regex test /^src/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^src/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('path')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex test /test$/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/test$/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('path')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should not report slice method call', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'slice')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report substring method call', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'substring')
      const node = createCallExpression(callee, [createLiteral(0), createLiteral(3)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report includes method call', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'includes')
      const node = createCallExpression(callee, [createLiteral('abc')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report replace method call', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'replace')
      const node = createCallExpression(callee, [createRegexLiteral(/^abc/), createLiteral('x')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report search method call', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'search')
      const node = createCallExpression(callee, [createRegexLiteral(/^abc/)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report split method call', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const callee = createMemberExpression(strIdent, 'split')
      const node = createCallExpression(callee, [createRegexLiteral(/^abc/)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should not report indexOf compared to string literal', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('x')])
      const node = createBinaryExpression(indexOfCall, createLiteral('0'), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(0)
    })

    test('should report indexOf === 0 with empty string arg', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('str')
      const indexOfCallee = createMemberExpression(strIdent, 'indexOf')
      const indexOfCall = createCallExpression(indexOfCallee, [createLiteral('')])
      const node = createBinaryExpression(indexOfCall, createLiteral(0), '===')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report match on obj prop member expression', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const obj = createIdentifier('config')
      const prop = createMemberExpression(obj, 'name')
      const callee = createMemberExpression(prop, 'match')
      const node = createCallExpression(callee, [createRegexLiteral(/^prod/)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report test on regex variable name pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^is_valid/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('input')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report test on regex with all uppercase endsWith', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/ABCD$/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('input')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report match /^set/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('method')
      const callee = createMemberExpression(strIdent, 'match')
      const node = createCallExpression(callee, [createRegexLiteral(/^set/)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report match /Module$/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('name')
      const callee = createMemberExpression(strIdent, 'match')
      const node = createCallExpression(callee, [createRegexLiteral(/Module$/)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report lastIndexOf == str.length with == operator', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('s')
      const lastIndexOfCallee = createMemberExpression(strIdent, 'lastIndexOf')
      const lastIndexOfCall = createCallExpression(lastIndexOfCallee, [createLiteral('x')])
      const lengthMember = createMemberExpression(strIdent, 'length')
      const node = createBinaryExpression(lastIndexOfCall, lengthMember, '==')

      visitor.BinaryExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex /^BEGIN/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/^BEGIN/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('line')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report regex /END$/ pattern', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const regex = createRegexLiteral(/END$/)
      const callee = createMemberExpression(regex, 'test')
      const node = createCallExpression(callee, [createIdentifier('line')])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report match /^class / pattern with space', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('code')
      const callee = createMemberExpression(strIdent, 'match')
      const node = createCallExpression(callee, [createRegexLiteral(/^class /)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })

    test('should report match / default$/ pattern with space', () => {
      const { context, reports } = createMockRuleContext({ source: '/^abc/.test(str);' })
      const visitor = preferStringStartsEndsWithRule.create(context)

      const strIdent = createIdentifier('code')
      const callee = createMemberExpression(strIdent, 'match')
      const node = createCallExpression(callee, [createRegexLiteral(/ default$/)])

      visitor.CallExpression(node)

      expect(reports.length).toBe(1)
    })
  })
})

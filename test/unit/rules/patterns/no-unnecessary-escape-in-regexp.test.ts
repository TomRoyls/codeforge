import { describe, test, expect, vi } from 'vitest'
import { noUnnecessaryEscapeInRegexpRule } from '../../../../src/rules/patterns/no-unnecessary-escape-in-regexp.js'
import noUnnecessaryEscapeDefaultExport from '../../../../src/rules/patterns/no-unnecessary-escape-in-regexp.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = '"test"',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
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

function createLiteral(raw: string, value: string, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    raw,
    value,
    loc: {
      start: { line, column },
      end: { line, column: column + raw.length },
    },
  }
}

function createRegExpLiteral(raw: string, pattern: string, line = 1, column = 0): unknown {
  return {
    type: 'RegExpLiteral',
    raw,
    pattern,
    loc: {
      start: { line, column },
      end: { line, column: column + raw.length },
    },
  }
}

describe('no-unnecessary-escape-in-regexp rule', () => {
  describe('meta', () => {
    test('should have suggestion type', () => {
      expect(noUnnecessaryEscapeInRegexpRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noUnnecessaryEscapeInRegexpRule.meta.severity).toBe('warn')
    })

    test('should be recommended', () => {
      expect(noUnnecessaryEscapeInRegexpRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noUnnecessaryEscapeInRegexpRule.meta.docs?.category).toBe('patterns')
    })

    test('should have schema defined', () => {
      expect(noUnnecessaryEscapeInRegexpRule.meta.schema).toBeDefined()
    })

    test('should be fixable', () => {
      expect(noUnnecessaryEscapeInRegexpRule.meta.fixable).toBe('code')
    })

    test('should have docs object', () => {
      expect(noUnnecessaryEscapeInRegexpRule.meta.docs).toBeDefined()
      expect(typeof noUnnecessaryEscapeInRegexpRule.meta.docs).toBe('object')
    })

    test('should have docs description as non-empty string', () => {
      expect(typeof noUnnecessaryEscapeInRegexpRule.meta.docs?.description).toBe('string')
      expect(noUnnecessaryEscapeInRegexpRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have docs description mentioning escape', () => {
      expect(noUnnecessaryEscapeInRegexpRule.meta.docs?.description.toLowerCase()).toContain(
        'escape',
      )
    })

    test('should have docs description mentioning regex or regular expression', () => {
      const desc = noUnnecessaryEscapeInRegexpRule.meta.docs?.description.toLowerCase()
      const mentionsRegex = desc?.includes('regex') || desc?.includes('regular')
      expect(mentionsRegex).toBe(true)
    })

    test('should have docs url defined', () => {
      expect(noUnnecessaryEscapeInRegexpRule.meta.docs?.url).toBeDefined()
      expect(typeof noUnnecessaryEscapeInRegexpRule.meta.docs?.url).toBe('string')
    })

    test('should have docs url starting with https', () => {
      expect(noUnnecessaryEscapeInRegexpRule.meta.docs?.url).toMatch(/^https:/)
    })

    test('should have schema as empty array', () => {
      const schema = noUnnecessaryEscapeInRegexpRule.meta.schema
      expect(Array.isArray(schema)).toBe(true)
      expect(schema).toHaveLength(0)
    })

    test('should have meta as object with required properties', () => {
      const meta = noUnnecessaryEscapeInRegexpRule.meta
      expect(meta).toHaveProperty('type')
      expect(meta).toHaveProperty('severity')
      expect(meta).toHaveProperty('docs')
    })

    test('should not be deprecated', () => {
      expect(noUnnecessaryEscapeInRegexpRule.meta.deprecated).toBeFalsy()
    })

    test('should not have replacedBy', () => {
      expect(noUnnecessaryEscapeInRegexpRule.meta.replacedBy).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noUnnecessaryEscapeInRegexpRule.meta.requiresTypeChecking).toBeFalsy()
    })

    test('should have valid RuleType', () => {
      const validTypes = ['problem', 'suggestion', 'layout']
      expect(validTypes).toContain(noUnnecessaryEscapeInRegexpRule.meta.type)
    })

    test('should have valid Severity', () => {
      const validSeverities = ['off', 'warn', 'error']
      expect(validSeverities).toContain(noUnnecessaryEscapeInRegexpRule.meta.severity)
    })

    test('should have docs recommended as boolean', () => {
      expect(typeof noUnnecessaryEscapeInRegexpRule.meta.docs?.recommended).toBe('boolean')
    })

    test('should have docs category as string', () => {
      expect(typeof noUnnecessaryEscapeInRegexpRule.meta.docs?.category).toBe('string')
    })

    test('should have fixable as valid value', () => {
      const validFixable = ['code', 'whitespace']
      expect(validFixable).toContain(noUnnecessaryEscapeInRegexpRule.meta.fixable)
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      expect(visitor).toHaveProperty('Literal')
      expect(visitor).toHaveProperty('RegExpLiteral')
    })

    test('should return visitor as a plain object', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      expect(typeof visitor).toBe('object')
      expect(visitor).not.toBeNull()
    })

    test('should return visitor with Literal as a function', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      expect(typeof visitor.Literal).toBe('function')
    })

    test('should return visitor with RegExpLiteral as a function', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      expect(typeof visitor.RegExpLiteral).toBe('function')
    })

    test('should return new visitor object each time create is called', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryEscapeInRegexpRule.create(context)
      const visitor2 = noUnnecessaryEscapeInRegexpRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should have visitor methods that return undefined', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const result = visitor.Literal(null)
      expect(result).toBeUndefined()
    })

    test('should have visitor RegExpLiteral that returns undefined', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const result = visitor.RegExpLiteral(null)
      expect(result).toBeUndefined()
    })

    test('should accept context with default options', () => {
      const { context } = createMockContext({})
      expect(() => noUnnecessaryEscapeInRegexpRule.create(context)).not.toThrow()
    })

    test('should accept context with no options', () => {
      const { context } = createMockContext()
      expect(() => noUnnecessaryEscapeInRegexpRule.create(context)).not.toThrow()
    })

    test('should have visitor with exactly Literal and RegExpLiteral keys', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)
      const keys = Object.keys(visitor)

      expect(keys).toContain('Literal')
      expect(keys).toContain('RegExpLiteral')
    })
  })

  describe('detecting unnecessary escape in double-quoted strings', () => {
    test('should report escaped single quote in double-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"test\\\'s value"', "test's value")

      visitor.Literal(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary escape character')
      expect(reports[0].message).toContain("'")
      expect(reports[0].message).toContain('double-quoted')
    })

    test('should report multiple unnecessary escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral("\"test\\'s \\'value\\'\"", "test's 'value'")

      visitor.Literal(node)

      expect(reports.length).toBe(3)
    })

    test('should not report escaped double quote in double-quoted string (necessary)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"test\\"value"', 'test"value')

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should report escaped single quote at the beginning of double-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"\\\'start"', "'start")

      visitor.Literal(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'")
    })

    test('should report escaped single quote at the end of double-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"end\\\'"', "end'")

      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should report consecutive escaped single quotes in double-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral("\"\\'\\'\\'\"", "'''")

      visitor.Literal(node)

      expect(reports.length).toBe(3)
    })

    test('should report escaped single quote surrounded by text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"hello\\\'world"', "hello'world")

      visitor.Literal(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'")
      expect(reports[0].message).toContain('double-quoted')
    })

    test('should not report any escapes in double-quoted string without escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"plain text"', 'plain text')

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle double-quoted string with only escaped single quote', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"\\\'"', "'")

      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should report correct number of unnecessary single quote escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral("\"a\\'b\\'c\\'d\"", "a'b'c'd")

      visitor.Literal(node)

      expect(reports.length).toBe(3)
    })

    test('should handle double-quoted string with necessary double quote escape and unnecessary single quote', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"\\\'test\\"value"', '\'test"value')

      visitor.Literal(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'")
    })

    test('should not report escaped non-quote characters in double-quoted strings', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"hello\\nworld"', 'hello\nworld')

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle double-quoted string with backslash near end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"test\\\'end"', "test'end")

      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty double-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('""', '')

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should report escaped single quote in double-quoted string with long content', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const longContent = 'a'.repeat(100)
      const node = createLiteral(
        `"${longContent}\\\'${longContent}"`,
        `${longContent}'${longContent}`,
      )

      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should report all unnecessary escapes regardless of position', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral("\"\\'a\\'b\\'c\\'\"", "'a'b'c'")

      visitor.Literal(node)

      expect(reports.length).toBe(4)
    })

    test('should not report when only necessary escape exists in double-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"say \\"hello\\""', 'say "hello"')

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle double-quoted string with mix of necessary and unnecessary escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"test\\\'s \\"val\\""', 'test\'s "val"')

      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should produce messages containing escaped character and quote type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      visitor.Literal(createLiteral('"\\\'test"', "'test"))

      expect(reports[0].message).toContain("'")
      expect(reports[0].message).toContain('double')
    })
  })

  describe('detecting unnecessary escape in single-quoted strings', () => {
    test('should report escaped double quote in single-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral("'test\\\"value'", 'test"value')

      visitor.Literal(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary escape character')
      expect(reports[0].message).toContain('"')
      expect(reports[0].message).toContain('single-quoted')
    })

    test('should not report escaped single quote in single-quoted string (necessary)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral("'test\\'value'", "test'value")

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should report escaped double quote at start of single-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral("'\\\"start'", '"start')

      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should report escaped double quote at end of single-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral("'end\\\"'", 'end"')

      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should report multiple escaped double quotes in single-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('\'\\"a\\"b\\"\'', '"a"b"')

      visitor.Literal(node)

      expect(reports.length).toBe(3)
    })

    test('should handle single-quoted string with only escaped double quote', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral("'\\\"'", '"')

      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should handle empty single-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral("''", '')

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should not report any escapes in single-quoted string without escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral("'plain text'", 'plain text')

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should report correct count of unnecessary double quote escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('\'\\"\\"\\"\'', '"""')

      visitor.Literal(node)

      expect(reports.length).toBe(3)
    })

    test('should handle single-quoted string with mix of necessary and unnecessary escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral("'test\\\"s \\'val'", 'test"s \'val')

      visitor.Literal(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('"')
    })

    test('should produce message with escaped character and quote type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      visitor.Literal(createLiteral("'\\\"test'", '"test'))

      expect(reports[0].message).toContain('"')
      expect(reports[0].message).toContain('single')
    })

    test('should not report escaped non-quote characters in single-quoted strings', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral("'hello\\nworld'", 'hello\nworld')

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should report escaped double quote in single-quoted string with long content', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const longContent = 'z'.repeat(50)
      const node = createLiteral(
        `'${longContent}\\\"${longContent}'`,
        `${longContent}"${longContent}`,
      )

      visitor.Literal(node)

      expect(reports.length).toBe(1)
    })

    test('should not report necessary single quote escape in single-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral("'it\\'s'", "it's")

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should report consecutive escaped double quotes in single-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('\'a\\"\\"b\'', 'a""b')

      visitor.Literal(node)

      expect(reports.length).toBe(2)
    })
  })

  describe('detecting unnecessary escape in regex literals', () => {
    test('should report unnecessary escape in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\a/', 'a')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unnecessary escape character')
      expect(reports[0].message).toContain('\\a')
    })

    test('should report unnecessary escape of letters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\c\\h\\i/', 'chi')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(3)
    })

    test('should not report necessary regex escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\d\\s\\w/', '\\d\\s\\w')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report special characters that need escaping', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\.\\*\\?/', '\\.*?')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report backreferences', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/(a)\\1/', '(a)\\1')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should report unnecessary escape \\e', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\e/', 'e')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\e')
    })

    test('should report unnecessary escape \\g', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\g/', 'g')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\g')
    })

    test('should report unnecessary escape \\j', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\j/', 'j')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\j')
    })

    test('should report unnecessary escape \\l', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\l/', 'l')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape \\m', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\m/', 'm')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape \\o', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\o/', 'o')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape \\q', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\q/', 'q')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape \\y', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\y/', 'y')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape \\z', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\z/', 'z')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of uppercase \\A', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\A/', 'A')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\A')
    })

    test('should report unnecessary escape of uppercase \\C', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\C/', 'C')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of uppercase \\E', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\E/', 'E')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of uppercase \\F', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\F/', 'F')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of uppercase \\G', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\G/', 'G')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of uppercase \\H', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\H/', 'H')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of uppercase \\I', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\I/', 'I')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of uppercase \\J', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\J/', 'J')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of uppercase \\L', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\L/', 'L')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of uppercase \\M', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\M/', 'M')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of uppercase \\O', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\O/', 'O')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of uppercase \\Q', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\Q/', 'Q')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of uppercase \\T', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\T/', 'T')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of uppercase \\U', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\U/', 'U')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of uppercase \\V', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\V/', 'V')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of uppercase \\Y', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\Y/', 'Y')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of uppercase \\Z', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\Z/', 'Z')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape \\8', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\8/', '8')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape \\9', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\9/', '9')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report multiple unnecessary escapes in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\a\\e\\g\\h/', 'aegh')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(4)
    })

    test('should report unnecessary escape of hash character', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\#/', '#')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of at sign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\@/', '@')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of exclamation mark', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\!/', '!')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of percent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\%/', '%')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of ampersand', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\&/', '&')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of underscore', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\_/', '_')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of colon', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\:/', ':')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of semicolon', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\;/', ';')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of equals sign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\=/', '=')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of comma', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\,/', ',')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of tilde', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\~/', '~')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of backtick', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\`/', '`')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of angle bracket', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\</', '<')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should report unnecessary escape of greater-than sign', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\>/', '>')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })
  })

  describe('necessary regex escapes not reported', () => {
    test('should not report escaped backslash in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\\\/', '\\\\')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report escaped caret in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\^/', '\\^')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report escaped dollar in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\$/', '\\$')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report escaped dot in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\./', '\\.')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report escaped pipe in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\|/', '\\|')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report escaped question mark in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\?/', '\\?')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report escaped asterisk in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\*/', '\\*')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report escaped plus in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\+/', '\\+')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report escaped opening paren in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\(/', '\\(')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report escaped closing paren in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\)/', '\\)')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report escaped opening bracket in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\[/', '\\[')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report escaped closing bracket in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\]/', '\\]')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report escaped opening brace in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\{/', '\\{')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report escaped closing brace in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\}/', '\\}')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report escaped forward slash in regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\//', '\\/')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\n escape (newline)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\n/', '\\n')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\r escape (carriage return)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\r/', '\\r')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\t escape (tab)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\t/', '\\t')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\f escape (form feed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\f/', '\\f')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\v escape (vertical tab)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\v/', '\\v')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\0 escape (null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\0/', '\\0')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\d escape (digit)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\d/', '\\d')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\D escape (non-digit)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\D/', '\\D')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\s escape (whitespace)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\s/', '\\s')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\S escape (non-whitespace)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\S/', '\\S')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\w escape (word char)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\w/', '\\w')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\W escape (non-word char)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\W/', '\\W')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\b escape (word boundary)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\b/', '\\b')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\B escape (non-word boundary)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\B/', '\\B')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\p escape (unicode property)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\p/', '\\p')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\P escape (negated unicode property)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\P/', '\\P')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\x escape (hex escape)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\x/', '\\x')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\u escape (unicode escape)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\u/', '\\u')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\k escape (named backreference)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\k/', '\\k')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\N escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\N/', '\\N')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\R escape (line break)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\R/', '\\R')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report \\X escape (unicode grapheme)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\X/', '\\X')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report backreference \\1', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/(a)\\1/', '(a)\\1')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report backreference \\2', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/(a)(b)\\2/', '(a)(b)\\2')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report backreference \\3', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/(a)(b)(c)\\3/', '(a)(b)(c)\\3')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report backreference \\4', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/(a)(b)(c)(d)\\4/', '(a)(b)(c)(d)\\4')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report backreference \\5', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/(a)(b)(c)(d)(e)\\5/', '(a)(b)(c)(d)(e)\\5')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report backreference \\6', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/(a)(b)(c)(d)(e)(f)\\6/', '(a)(b)(c)(d)(e)(f)\\6')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should not report backreference \\7', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/(a)(b)(c)(d)(e)(f)(g)\\7/', '(a)(b)(c)(d)(e)(f)(g)\\7')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should report unnecessary escape mixed with necessary ones', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\d\\a\\s/', '\\da\\s')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\a')
    })

    test('should report all unnecessary escapes in a complex regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\a\\d\\e\\s\\g/', 'ad�sg')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(3)
    })

    test('should not report anything for regex without escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/abc/', 'abc')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      expect(() => visitor.Literal(null)).not.toThrow()
      expect(() => visitor.RegExpLiteral(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      expect(() => visitor.Literal(undefined)).not.toThrow()
      expect(() => visitor.RegExpLiteral(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      expect(() => visitor.Literal('string')).not.toThrow()
      expect(() => visitor.Literal(123)).not.toThrow()
      expect(() => visitor.RegExpLiteral('string')).not.toThrow()
    })

    test('should handle node without raw property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = {
        type: 'Literal',
        value: 'test',
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"test\\\'s"', "test's")
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"test\\\'s"', "test's", 5, 10)

      visitor.Literal(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"test\\\'s"', "test's", 5, 10)

      visitor.Literal(node)

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should handle numeric literal without reporting', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = {
        type: 'Literal',
        raw: '123',
        value: 123,
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean literal without reporting', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = {
        type: 'Literal',
        raw: 'true',
        value: true,
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle RegExpLiteral without raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = {
        type: 'RegExpLiteral',
        pattern: 'test',
      }

      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle wrong node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = {
        type: 'SomeOtherType',
        raw: '/test/',
      }

      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle Literal node passed to RegExpLiteral without reporting', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"test"', 'test')

      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle RegExpLiteral node passed to Literal without reporting', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/test/', 'test')

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with null raw property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = {
        type: 'Literal',
        raw: null,
        value: 'test',
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with non-string raw property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = {
        type: 'Literal',
        raw: 42,
        value: 'test',
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle RegExpLiteral with null raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = {
        type: 'RegExpLiteral',
        raw: null,
        pattern: 'test',
      }

      expect(() => visitor.RegExpLiteral(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle boolean node passed to RegExpLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      expect(() => visitor.RegExpLiteral(true)).not.toThrow()
      expect(() => visitor.RegExpLiteral(false)).not.toThrow()
    })

    test('should handle numeric node passed to Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      expect(() => visitor.Literal(42)).not.toThrow()
      expect(() => visitor.Literal(0)).not.toThrow()
    })

    test('should handle array node passed to Literal', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      expect(() => visitor.Literal([])).not.toThrow()
    })

    test('should handle array node passed to RegExpLiteral', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      expect(() => visitor.RegExpLiteral([])).not.toThrow()
    })

    test('should handle node with empty object for Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      expect(() => visitor.Literal({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty object for RegExpLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      expect(() => visitor.RegExpLiteral({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle backtick-quoted raw string without reporting', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('`test`', 'test')

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle unquoted raw string without reporting', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('test', 'test')

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle regex with empty pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('//', '')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should handle regex with single char pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/a/', 'a')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should handle calling visitor methods with no arguments', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      expect(() => visitor.Literal()).not.toThrow()
      expect(() => visitor.RegExpLiteral()).not.toThrow()
    })

    test('should handle Literal with value but no escapes in raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"hello world"', 'hello world')

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle loc with zero values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"\\\'"', "'", 0, 0)

      visitor.Literal(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(1)
    })
  })

  describe('location reporting', () => {
    test('should report location for unnecessary escape in double-quoted string at line 1 col 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"\\\'test"', "'test", 1, 0)

      visitor.Literal(node)

      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(1)
    })

    test('should report correct end column for escape sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"\\\'"', "'", 1, 0)

      visitor.Literal(node)

      expect(reports[0].loc?.end.column).toBe(3)
    })

    test('should report location for each unnecessary escape separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"\\\'a\\\'b"', "'a'b", 1, 0)

      visitor.Literal(node)

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.column).toBe(1)
      expect(reports[1].loc?.start.column).toBe(4)
    })

    test('should report location for regex unnecessary escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\a/', 'a', 3, 5)

      visitor.RegExpLiteral(node)

      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(6)
    })

    test('should report correct end column for regex escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\a/', 'a', 1, 0)

      visitor.RegExpLiteral(node)

      expect(reports[0].loc?.end.column).toBe(3)
    })

    test('should report locations for multiple regex escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\a\\b/', '\\a\\b', 1, 10)

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(11)
    })

    test('should report location with high line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"\\\'"', "'", 100, 50)

      visitor.Literal(node)

      expect(reports[0].loc?.start.line).toBe(100)
      expect(reports[0].loc?.start.column).toBe(51)
    })

    test('should report location for unnecessary escape in single-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral("'\\\"test'", '"test', 2, 3)

      visitor.Literal(node)

      expect(reports[0].loc?.start.line).toBe(2)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('should report correct location for escape not at start', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"hello\\\'world"', "hello'world", 1, 0)

      visitor.Literal(node)

      expect(reports[0].loc?.start.column).toBe(6)
    })

    test('should handle node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = {
        type: 'Literal',
        raw: '"\\\'test"',
        value: "'test",
        loc: {
          start: { line: 1, column: 0 },
        },
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with partial loc (missing start)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = {
        type: 'Literal',
        raw: '"\\\'test"',
        value: "'test",
        loc: {
          end: { line: 1, column: 8 },
        },
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report location for regex at offset column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/a\\e\\g/', 'aeg', 1, 20)

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.column).toBe(22)
      expect(reports[1].loc?.start.column).toBe(24)
    })
  })

  describe('message quality', () => {
    test('should mention the escaped character in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      visitor.Literal(createLiteral('"test\\\'s"', "test's"))

      expect(reports[0].message).toContain("'")
    })

    test('should mention quote type in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      visitor.Literal(createLiteral('"test\\\'s"', "test's"))

      expect(reports[0].message).toContain('double-quoted')
    })

    test('should mention unnecessary escape in message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      visitor.Literal(createLiteral('"test\\\'s"', "test's"))

      expect(reports[0].message.toLowerCase()).toContain('unnecessary')
    })

    test('should include escaped character in regex message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/\\a/', 'a'))

      expect(reports[0].message).toContain('\\a')
    })

    test('should include "does not need" phrasing in regex message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/\\a/', 'a'))

      expect(reports[0].message.toLowerCase()).toContain('does not need')
    })

    test('should include "regex" in regex message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/\\a/', 'a'))

      expect(reports[0].message.toLowerCase()).toContain('regex')
    })

    test('should produce different messages for double-quoted vs single-quoted', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = noUnnecessaryEscapeInRegexpRule.create(ctx1)
      const visitor2 = noUnnecessaryEscapeInRegexpRule.create(ctx2)

      visitor1.Literal(createLiteral('"\\\'"', "'"))
      visitor2.Literal(createLiteral("'\\\"'", '"'))

      expect(reports1[0].message).toContain('double-quoted')
      expect(reports2[0].message).toContain('single-quoted')
    })

    test('should produce message mentioning the specific escaped quote', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      visitor.Literal(createLiteral('"\\\'"', "'"))

      expect(reports[0].message).toContain("'")
      expect(reports[0].message).not.toContain('"')
    })

    test('should produce correct message for escaped double quote in single-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      visitor.Literal(createLiteral("'\\\"'", '"'))

      expect(reports[0].message).toContain('"')
      expect(reports[0].message).toContain('single-quoted')
    })

    test('should include "escape character" in regex message', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/\\e/', 'e'))

      expect(reports[0].message).toContain('escape character')
    })
  })

  describe('export verification', () => {
    test('should export rule as named export', () => {
      expect(noUnnecessaryEscapeInRegexpRule).toBeDefined()
      expect(typeof noUnnecessaryEscapeInRegexpRule).toBe('object')
    })

    test('should export rule as default export', () => {
      expect(noUnnecessaryEscapeDefaultExport).toBeDefined()
      expect(typeof noUnnecessaryEscapeDefaultExport).toBe('object')
    })

    test('should have named and default export be the same object', () => {
      expect(noUnnecessaryEscapeInRegexpRule).toBe(noUnnecessaryEscapeDefaultExport)
    })

    test('should have meta property on exported rule', () => {
      expect(noUnnecessaryEscapeInRegexpRule.meta).toBeDefined()
      expect(typeof noUnnecessaryEscapeInRegexpRule.meta).toBe('object')
    })

    test('should have create property on exported rule', () => {
      expect(noUnnecessaryEscapeInRegexpRule.create).toBeDefined()
      expect(typeof noUnnecessaryEscapeInRegexpRule.create).toBe('function')
    })

    test('should have exactly meta and create properties', () => {
      const keys = Object.keys(noUnnecessaryEscapeInRegexpRule)
      expect(keys).toContain('meta')
      expect(keys).toContain('create')
    })

    test('should be callable with context to produce visitor', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryEscapeDefaultExport.create(context)

      expect(typeof visitor).toBe('object')
      expect(typeof visitor.Literal).toBe('function')
      expect(typeof visitor.RegExpLiteral).toBe('function')
    })
  })

  describe('multiple reports in single node', () => {
    test('should report each unnecessary escape separately in double-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      visitor.Literal(createLiteral("\"\\'a\\'b\\'c\\'\"", "'a'b'c'"))

      expect(reports.length).toBe(4)
      for (const report of reports) {
        expect(report.message).toContain("'")
      }
    })

    test('should report each unnecessary escape separately in single-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      visitor.Literal(createLiteral('\'\\"a\\"b\\"c\\"\'', '"a"b"c"'))

      expect(reports.length).toBe(4)
      for (const report of reports) {
        expect(report.message).toContain('"')
      }
    })

    test('should report each unnecessary escape in regex separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/\\a\\e\\i\\o\\y/', 'aeioy'))

      expect(reports.length).toBe(5)
    })

    test('should give unique locations to each report in a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      visitor.Literal(createLiteral("\"\\'a\\'b\\'\"", "'a'b'", 1, 0))

      const columns = reports.map((r) => r.loc?.start.column)
      const uniqueColumns = new Set(columns)
      expect(uniqueColumns.size).toBe(columns.length)
    })

    test('should give unique locations to each report in a regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      visitor.RegExpLiteral(createRegExpLiteral('/\\a\\e\\i/', 'aei', 1, 0))

      const columns = reports.map((r) => r.loc?.start.column)
      const uniqueColumns = new Set(columns)
      expect(uniqueColumns.size).toBe(columns.length)
    })

    test('should handle many consecutive escapes in double-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral("\"\\'\\'\\'\\'\\'\"", "''''")
      visitor.Literal(node)

      expect(reports.length).toBe(5)
    })

    test('should handle many consecutive escapes in single-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('\'\\"\\"\\"\\"\\"\'', '""""')
      visitor.Literal(node)

      expect(reports.length).toBe(5)
    })
  })

  describe('visitor independence', () => {
    test('should have independent report collections for different visitors', () => {
      const { context: ctx1, reports: reports1 } = createMockContext()
      const { context: ctx2, reports: reports2 } = createMockContext()

      const visitor1 = noUnnecessaryEscapeInRegexpRule.create(ctx1)
      const visitor2 = noUnnecessaryEscapeInRegexpRule.create(ctx2)

      visitor1.Literal(createLiteral('"\\\'"', "'"))

      expect(reports1.length).toBe(1)
      expect(reports2.length).toBe(0)
    })

    test('should handle calling same visitor method multiple times', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      visitor.Literal(createLiteral('"\\\'"', "'"))
      visitor.Literal(createLiteral('"\\\'"', "'"))

      expect(reports.length).toBe(2)
    })

    test('should handle calling different visitor methods on same context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      visitor.Literal(createLiteral('"\\\'"', "'"))
      visitor.RegExpLiteral(createRegExpLiteral('/\\a/', 'a'))

      expect(reports.length).toBe(2)
    })

    test('should handle intermixed valid and invalid calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      visitor.Literal(createLiteral('"no escapes"', 'no escapes'))
      visitor.Literal(createLiteral('"\\\'escaped"', "'escaped"))
      visitor.RegExpLiteral(createRegExpLiteral('/valid/', 'valid'))
      visitor.RegExpLiteral(createRegExpLiteral('/\\a/', 'a'))

      expect(reports.length).toBe(2)
    })
  })

  describe('Literal only detects quote escapes', () => {
    test('should not report escaped backslash in double-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"test\\\\path"', 'test\\path')

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should not report escaped n in double-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"line1\\nline2"', 'line1\nline2')

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should not report escaped t in double-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"col1\\tcol2"', 'col1\tcol2')

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should only report escaped quote characters in strings', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral('"\\a\\b\\c\\\'\\d"', "abc'd")

      visitor.Literal(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain("'")
    })

    test('should only report escaped opposite quote in single-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createLiteral("'\\a\\b\\c\\\"\\d'", 'abc"d')

      visitor.Literal(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('"')
    })
  })

  describe('regex with special flags and patterns', () => {
    test('should handle regex with flags suffix', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\a/gi', 'a')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should handle regex with only special chars', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\.\\*\\+\\?/', '\\.*+?')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(0)
    })

    test('should handle regex with character class', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/[\\a\\b]/', '[\\a\\b]')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
    })

    test('should handle regex with alternation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\a|\\e/', 'a|e')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(2)
    })

    test('should handle complex regex with groups', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/(\\a)(\\d)/', '(a)(\\d)')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\a')
    })

    test('should handle regex with quantifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      const node = createRegExpLiteral('/\\a+\\e*/', 'ae')

      visitor.RegExpLiteral(node)

      expect(reports.length).toBe(2)
    })
  })
})

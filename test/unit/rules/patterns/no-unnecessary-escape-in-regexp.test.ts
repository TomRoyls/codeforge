import { describe, test, expect, vi } from 'vitest'
import { noUnnecessaryEscapeInRegexpRule } from '../../../../src/rules/patterns/no-unnecessary-escape-in-regexp.js'
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
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryEscapeInRegexpRule.create(context)

      expect(visitor).toHaveProperty('Literal')
      expect(visitor).toHaveProperty('RegExpLiteral')
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
  })
})

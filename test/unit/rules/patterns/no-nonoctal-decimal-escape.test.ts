import { describe, test, expect, vi } from 'vitest'
import { noNonoctalDecimalEscapeRule } from '../../../../src/rules/patterns/no-nonoctal-decimal-escape.js'
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
    getSource: () => 'const x = "test"',
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

function createLiteral(value: unknown, raw: string, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    raw,
    loc: {
      start: { line, column },
      end: { line, column: raw.length },
    },
  }
}

function createNonLiteralNode(line = 1, column = 0): unknown {
  return {
    type: 'Identifier',
    name: 'x',
    loc: {
      start: { line, column },
      end: { line, column: column + 1 },
    },
  }
}

describe('no-nonoctal-decimal-escape rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noNonoctalDecimalEscapeRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noNonoctalDecimalEscapeRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noNonoctalDecimalEscapeRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noNonoctalDecimalEscapeRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention escape sequences in description', () => {
      expect(noNonoctalDecimalEscapeRule.meta.docs?.description.toLowerCase()).toContain('escape')
    })
  })

  describe('create', () => {
    test('should return visitor with Literal method', () => {
      const { context } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      expect(visitor).toHaveProperty('Literal')
    })
  })

  describe('detecting \\8 escape sequences', () => {
    test('should report string with \\8 escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\8', '"test\\8"', 1, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\8')
      expect(reports[0].message).toContain('escape')
    })

    test('should report string with multiple \\8 escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8\\8\\8', '"\\8\\8\\8"', 1, 10))

      expect(reports.length).toBe(1)
    })

    test('should report string with \\8 at start', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8test', '"\\8test"', 1, 10))

      expect(reports.length).toBe(1)
    })

    test('should report string with \\8 at end', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\8', '"test\\8"', 1, 10))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting \\9 escape sequences', () => {
    test('should report string with \\9 escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\9', '"test\\9"', 1, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\9')
      expect(reports[0].message).toContain('escape')
    })

    test('should report string with multiple \\9 escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\9\\9\\9', '"\\9\\9\\9"', 1, 10))

      expect(reports.length).toBe(1)
    })

    test('should report string with \\9 at start', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\9test', '"\\9test"', 1, 10))

      expect(reports.length).toBe(1)
    })

    test('should report string with \\9 at end', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\9', '"test\\9"', 1, 10))

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting mixed \\8 and \\9 escapes', () => {
    test('should report string with both \\8 and \\9', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8\\9', '"\\8\\9"', 1, 10))

      expect(reports.length).toBe(1)
    })

    test('should report string with alternating \\8 and \\9', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('\\8\\9\\8\\9', '"\\8\\9\\8\\9"', 1, 10))

      expect(reports.length).toBe(1)
    })
  })

  describe('valid escape sequences (should not report)', () => {
    test('should not report string with \\n escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\n', '"test\\n"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\t escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\t', '"test\\t"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\r escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\r', '"test\\r"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\b escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\b', '"test\\b"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\f escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\f', '"test\\f"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with single quote escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral("test'", '"test\\\'"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with double quote escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test"', '"test\\""', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\" escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\"', '"test\\""', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\\\ escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\\\', '"test\\\\"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\0 escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\0', '"test\\0"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\1 escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\1', '"test\\1"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\7 escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\7', '"test\\7"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\u escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\u0041', '"test\\u0041"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report string with \\x escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\x41', '"test\\x41"', 1, 10))

      expect(reports.length).toBe(0)
    })
  })

  describe('non-string literals', () => {
    test('should not report number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral(123, '123', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report boolean literal true', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral(true, 'true', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report boolean literal false', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral(false, 'false', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral(null, 'null', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report regular expression literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral(/test/, '/test/', 1, 10))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      expect(() => visitor.Literal(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      expect(() => visitor.Literal(undefined)).not.toThrow()
    })

    test('should handle non-Literal node', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createNonLiteralNode())

      expect(reports.length).toBe(0)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('test\\8', '"test\\8"', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      const node = {
        type: 'Literal',
        value: 'test\\8',
        raw: '"test\\8"',
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle string literal without raw property', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      const node = {
        type: 'Literal',
        value: 'test\\8',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 7 } },
      }

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noNonoctalDecimalEscapeRule.create(context)

      visitor.Literal(createLiteral('', '""', 1, 10))

      expect(reports.length).toBe(0)
    })
  })
})

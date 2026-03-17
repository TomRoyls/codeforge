import { describe, test, expect, vi } from 'vitest'
import { noControlRegexRule } from '../../../../src/rules/patterns/no-control-regex.js'
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
    getSource: () => 'const regex = /test/',
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

function createLiteralWithRegex(pattern: string, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    regex: { pattern },
    loc: {
      start: { line, column },
      end: { line, column: column + pattern.length + 2 },
    },
  }
}

function createLiteralWithoutRegex(line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value: 'test',
    loc: {
      start: { line, column },
      end: { line, column: column + 4 },
    },
  }
}

function createLiteralWithNullRegex(line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    regex: null,
    loc: {
      start: { line, column },
      end: { line, column: column + 5 },
    },
  }
}

function createNonLiteralNode(): unknown {
  return {
    type: 'Identifier',
    name: 'regex',
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 5 },
    },
  }
}

describe('no-control-regex rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noControlRegexRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noControlRegexRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noControlRegexRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noControlRegexRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention control in description', () => {
      expect(noControlRegexRule.meta.docs?.description.toLowerCase()).toContain('control')
    })

    test('should mention regular expression in description', () => {
      expect(noControlRegexRule.meta.docs?.description.toLowerCase()).toContain(
        'regular expression',
      )
    })
  })

  describe('create', () => {
    test('should return visitor with Literal method', () => {
      const { context } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      expect(visitor).toHaveProperty('Literal')
    })

    test('should return visitor with function', () => {
      const { context } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      expect(typeof visitor.Literal).toBe('function')
    })
  })

  describe('valid regex patterns', () => {
    test('should not report simple regex', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with special characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('[a-z]+\\d*'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test pattern'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with tabs (tab is allowed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test\tvalue'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with newlines (newline is allowed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test\nvalue'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with carriage return (CR is allowed)', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test\rvalue'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with escape sequences', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\\d+\\w*'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex without regex property', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithoutRegex())

      expect(reports.length).toBe(0)
    })

    test('should not report regex with null regex property', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithNullRegex())

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid regex patterns with control characters', () => {
    test('should report regex with null character', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test\x00value'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unexpected control character')
    })

    test('should report regex with start of heading character', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test\x01value'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('control character')
    })

    test('should report regex with bell character', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test\x07value'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with vertical tab', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test\x0Bvalue'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with form feed', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test\x0Cvalue'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with escape character', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test\x1Bvalue'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with multiple control characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00\x01\x02'))

      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      expect(() => visitor.Literal(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      expect(() => visitor.Literal(undefined)).not.toThrow()
    })

    test('should handle non-Literal node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      expect(() => visitor.Literal(createNonLiteralNode())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without regex property', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      const node = createLiteralWithoutRegex()
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle regex object without pattern property', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: {},
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      const node = createLiteralWithRegex('\x00')
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty string pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex(''))

      expect(reports.length).toBe(0)
    })
  })
})

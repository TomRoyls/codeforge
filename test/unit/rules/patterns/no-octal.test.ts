import { describe, test, expect, vi } from 'vitest'
import { noOctalRule } from '../../../../src/rules/patterns/no-octal.js'
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
    getSource: () => 'const x = 0123',
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

describe('no-octal rule', () => {
  describe('meta', () => {
    test('should have problem type', () => {
      expect(noOctalRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noOctalRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noOctalRule.meta.docs?.recommended).toBe(true)
    })

    test('should have patterns category', () => {
      expect(noOctalRule.meta.docs?.category).toBe('patterns')
    })

    test('should mention octal in description', () => {
      expect(noOctalRule.meta.docs?.description.toLowerCase()).toContain('octal')
    })
  })

  describe('create', () => {
    test('should return visitor with Literal method', () => {
      const { context } = createMockContext()
      const visitor = noOctalRule.create(context)

      expect(visitor).toHaveProperty('Literal')
    })
  })

  describe('detecting octal literals', () => {
    test('should report 00 literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0, '00', 1, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('octal')
    })

    test('should report 01 literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('octal')
    })

    test('should report 07 literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(7, '07', 1, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('octal')
    })

    test('should report 010 literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(8, '010', 1, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('octal')
    })

    test('should report 0123 literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(83, '0123', 1, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('octal')
    })

    test('should report 0777 literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(511, '0777', 1, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('octal')
    })

    test('should report 07654321 literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(2054353, '07654321', 1, 10))

      expect(reports.length).toBe(1)
      expect(reports[0].message.toLowerCase()).toContain('octal')
    })

    test('should report correct location for octal literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(123, '0173', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('valid numeric literals (should not report)', () => {
    test('should not report 0 literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0, '0', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 1 literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '1', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 10 literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(10, '10', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 123 literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(123, '123', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 0.5 literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(0.5, '0.5', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 1.5 literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1.5, '1.5', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report negative literal -1', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(-1, '-1', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report negative octal -0', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(-0, '-0', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 8 literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(8, '8', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 9 literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(9, '9', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 18 literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(18, '18', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 89 literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(89, '89', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 0x10 literal (hexadecimal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(16, '0x10', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 0o10 literal (ES6 octal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(8, '0o10', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 0b10 literal (binary)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(2, '0b10', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 1e5 literal (scientific notation)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(100000, '1e5', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report 1.5e3 literal (scientific notation)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1500, '1.5e3', 1, 10))

      expect(reports.length).toBe(0)
    })
  })

  describe('non-number literals', () => {
    test('should not report string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral('test', '"test"', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report boolean literal true', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(true, 'true', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report boolean literal false', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(false, 'false', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(null, 'null', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report regular expression literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(/test/, '/test/', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should not report undefined literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(undefined, 'undefined', 1, 10))

      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noOctalRule.create(context)

      expect(() => visitor.Literal(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noOctalRule.create(context)

      expect(() => visitor.Literal(undefined)).not.toThrow()
    })

    test('should handle non-Literal node', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createNonLiteralNode())

      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      const node = {
        type: 'Literal',
        value: 123,
        raw: '0173',
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle numeric literal without raw property', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      const node = {
        type: 'Literal',
        value: 83,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 4 } },
      }

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })

    test('should handle 0 followed by 8 or 9 (not octal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(80, '080', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should handle 0 followed by 9 (not octal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(90, '090', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should handle 089 (not octal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(89, '089', 1, 10))

      expect(reports.length).toBe(0)
    })

    test('should report multiple octal literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      visitor.Literal(createLiteral(1, '01', 1, 10))
      visitor.Literal(createLiteral(10, '012', 2, 10))
      visitor.Literal(createLiteral(100, '0144', 3, 10))

      expect(reports.length).toBe(3)
    })

    test('should handle 0 literal but not report if raw is not 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalRule.create(context)

      const node = {
        type: 'Literal',
        value: 0,
        raw: '0.0',
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      }

      visitor.Literal(node)

      expect(reports.length).toBe(0)
    })
  })
})

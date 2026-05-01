import { describe, expect, test, vi } from 'vitest'
import { noHexEscapeRule } from '../../../../src/rules/patterns/no-hex-escape.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => '"\\x41"',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [{}] },
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

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function makeLiteral(value: string, raw: string, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    raw,
    loc: makeLoc(line, column, line, column + raw.length),
  }
}

describe('no-hex-escape rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noHexEscapeRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noHexEscapeRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noHexEscapeRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noHexEscapeRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noHexEscapeRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning hex escape', () => {
      const desc = noHexEscapeRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/hex/)
    })

    test('should have correct docs URL', () => {
      expect(noHexEscapeRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-hex-escape',
      )
    })

    test('should have empty schema', () => {
      expect(noHexEscapeRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with Literal', () => {
      const { context } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      expect(visitor).toHaveProperty('Literal')
      expect(typeof visitor.Literal).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noHexEscapeRule).toBeDefined()
      expect(noHexEscapeRule.meta).toBeDefined()
      expect(noHexEscapeRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (25) =====
  describe('positive cases — reports unnecessary hex escapes', () => {
    test('reports \\x41 — hex escape for "A"', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('A', '"\\x41"'))
      expect(reports.length).toBe(1)
    })

    test('reports \\x61 — hex escape for "a"', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('a', '"\\x61"'))
      expect(reports.length).toBe(1)
    })

    test('reports \\x30 — hex escape for "0"', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('0', '"\\x30"'))
      expect(reports.length).toBe(1)
    })

    test('reports \\x20 — hex escape for space', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral(' ', '"\\x20"'))
      expect(reports.length).toBe(1)
    })

    test('reports \\x7e — hex escape for "~"', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('~', '"\\x7e"'))
      expect(reports.length).toBe(1)
    })

    test('reports \\x21 — hex escape for "!"', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('!', '"\\x21"'))
      expect(reports.length).toBe(1)
    })

    test('reports hex escape in middle of string — "hello\\x20world"', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('hello world', '"hello\\x20world"'))
      expect(reports.length).toBe(1)
    })

    test('message contains "Unnecessary hex escape"', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('A', '"\\x41"'))
      expect(reports[0].message).toContain('Unnecessary hex escape')
    })

    test('message contains the printable character "A"', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('A', '"\\x41"'))
      expect(reports[0].message).toContain('"A"')
    })

    test('message mentions "readability"', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('A', '"\\x41"'))
      expect(reports[0].message).toContain('readability')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('A', '"\\x41"'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      const node = makeLiteral('A', '"\\x41"')
      visitor.Literal(node)
      expect(reports[0].node).toBe(node)
    })

    test('multiple hex escapes in one string — reports once', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('AB', '"\\x41\\x42"'))
      expect(reports.length).toBe(1)
    })

    test('message for \\x41 contains hex code "41"', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('A', '"\\x41"'))
      expect(reports[0].message).toContain('\\x41')
    })

    test('reports \\x42 — hex escape for "B"', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('B', '"\\x42"'))
      expect(reports.length).toBe(1)
    })

    test('reports \\x43 — hex escape for "C"', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('C', '"\\x43"'))
      expect(reports.length).toBe(1)
    })

    test('reports \\x7a — hex escape for "z"', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('z', '"\\x7a"'))
      expect(reports.length).toBe(1)
    })

    test('reports \\x5a — hex escape for "Z"', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('Z', '"\\x5a"'))
      expect(reports.length).toBe(1)
    })

    test('reports \\x39 — hex escape for "9"', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('9', '"\\x39"'))
      expect(reports.length).toBe(1)
    })

    test('reports \\x40 — hex escape for "@"', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('@', '"\\x40"'))
      expect(reports.length).toBe(1)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('A', '"\\x41"', 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(8 + '"\\x41"'.length)
    })

    test('uppercase hex \\x41 reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('A', '"\\x41"'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('"A"')
    })

    test('lowercase hex \\x61 reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('a', '"\\x61"'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('"a"')
    })

    test('visitor accumulates reports for different literals', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('A', '"\\x41"'))
      visitor.Literal(makeLiteral('B', '"\\x42"'))
      visitor.Literal(makeLiteral('C', '"\\x43"'))
      expect(reports.length).toBe(3)
    })

    test('reports for single printable char string with hex', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral(' ', '"\\x20"'))
      expect(reports[0].message).toContain('" "')
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report \\x22 — hex for double quote (skipped)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('"', '"\\x22"'))
      expect(reports.length).toBe(0)
    })

    test('does not report \\x27 — hex for single quote (skipped)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral("'", '"\\x27"'))
      expect(reports.length).toBe(0)
    })

    test('does not report \\x5c — hex for backslash (skipped)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('\\', '"\\x5c"'))
      expect(reports.length).toBe(0)
    })

    test('does not report \\x00 — null char (outside 0x20-0x7e)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('\0', '"\\x00"'))
      expect(reports.length).toBe(0)
    })

    test('does not report \\x01 — SOH (0x01)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('\x01', '"\\x01"'))
      expect(reports.length).toBe(0)
    })

    test('does not report \\x0a — newline (0x0a)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('\n', '"\\x0a"'))
      expect(reports.length).toBe(0)
    })

    test('does not report \\x0d — carriage return (0x0d)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('\r', '"\\x0d"'))
      expect(reports.length).toBe(0)
    })

    test('does not report \\x09 — tab (0x09)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('\t', '"\\x09"'))
      expect(reports.length).toBe(0)
    })

    test('does not report \\x7f — DEL (outside 0x20-0x7e)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('\x7f', '"\\x7f"'))
      expect(reports.length).toBe(0)
    })

    test('does not report \\x80 — above ASCII range', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('\x80', '"\\x80"'))
      expect(reports.length).toBe(0)
    })

    test('does not report \\xff — above ASCII range', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('\xff', '"\\xff"'))
      expect(reports.length).toBe(0)
    })

    test('does not report normal string without hex escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('hello', '"hello"'))
      expect(reports.length).toBe(0)
    })

    test('does not report number literal (42)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      const node = {
        type: 'Literal',
        value: 42,
        raw: '42',
        loc: makeLoc(1, 0, 1, 2),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report boolean literal (true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      const node = {
        type: 'Literal',
        value: true,
        raw: 'true',
        loc: makeLoc(1, 0, 1, 4),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      const node = {
        type: 'Literal',
        value: null,
        raw: 'null',
        loc: makeLoc(1, 0, 1, 4),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'foo',
        loc: makeLoc(1, 0, 1, 3),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report TemplateLiteral — not Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      const node = {
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
        loc: makeLoc(1, 0, 1, 5),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      expect(() => visitor.Literal(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      expect(() => visitor.Literal(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty source — does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('', '""'))
      expect(reports.length).toBe(0)
    })

    test('does not report Literal with non-string value (regex)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      const node = {
        type: 'Literal',
        value: /test/,
        raw: '/test/',
        loc: makeLoc(1, 0, 1, 6),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Literal without raw property', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      const node = {
        type: 'Literal',
        value: 'A',
        loc: makeLoc(1, 0, 1, 3),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report Literal with non-string raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      const node = {
        type: 'Literal',
        value: 'A',
        raw: 42,
        loc: makeLoc(1, 0, 1, 3),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report "\\n" — normal escape, not hex', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('\n', '"\\n"'))
      expect(reports.length).toBe(0)
    })

    test('does not report "\\t" — normal escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('\t', '"\\t"'))
      expect(reports.length).toBe(0)
    })

    test('does not report "\\u0041" — unicode escape, not hex', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('A', '"\\u0041"'))
      expect(reports.length).toBe(0)
    })

    test('does not report \\x0b — vertical tab (0x0b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('\x0b', '"\\x0b"'))
      expect(reports.length).toBe(0)
    })

    test('does not report \\x1f — unit separator (0x1f)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('\x1f', '"\\x1f"'))
      expect(reports.length).toBe(0)
    })

    test('does not report \\x1e — record separator (0x1e)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('\x1e', '"\\x1e"'))
      expect(reports.length).toBe(0)
    })

    test('does not report \\x10 — DLE (0x10)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('\x10', '"\\x10"'))
      expect(reports.length).toBe(0)
    })

    test('does not report \\xa0 — non-breaking space (above range)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('\xa0', '"\\xa0"'))
      expect(reports.length).toBe(0)
    })

    test('handles empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      expect(() => visitor.Literal({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      expect(() => visitor.Literal('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      expect(() => visitor.Literal(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('Literal with null value does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      const node = {
        type: 'Literal',
        value: null,
        raw: '"\\x41"',
        loc: makeLoc(1, 0, 1, 6),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noHexEscapeRule.create(ctx1)
      const visitor2 = noHexEscapeRule.create(ctx2)

      visitor1.Literal(makeLiteral('A', '"\\x41"'))
      visitor2.Literal(makeLiteral('hello', '"hello"'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('A', '"\\x41"'))
      visitor.Literal(makeLiteral('B', '"\\x42"'))
      visitor.Literal(makeLiteral('C', '"\\x43"'))
      expect(reports.length).toBe(3)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      const node = {
        type: 'Literal',
        value: 'A',
        raw: '"\\x41"',
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('Literal with undefined raw does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      const node = {
        type: 'Literal',
        value: 'A',
        raw: undefined,
        loc: makeLoc(1, 0, 1, 3),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('raw check — raw includes escape, value is the printable char', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('A', '"\\x41"'))
      expect(reports[0].message).toContain('\\x41')
      expect(reports[0].message).toContain('"A"')
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('A', '"\\x41"', 7, 12))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(12)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(12 + '"\\x41"'.length)
    })

    test('\\x20 — space is printable — reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral(' ', '"\\x20"'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('" "')
    })

    test('\\x21 — exclamation mark — reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('!', '"\\x21"'))
      expect(reports.length).toBe(1)
    })

    test('\\x3d — equals sign — reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('=', '"\\x3d"'))
      expect(reports.length).toBe(1)
    })

    test('\\x5b — left bracket — reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('[', '"\\x5b"'))
      expect(reports.length).toBe(1)
    })

    test('\\x5d — right bracket — reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral(']', '"\\x5d"'))
      expect(reports.length).toBe(1)
    })

    test('\\x60 — backtick — reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('`', '"\\x60"'))
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noHexEscapeRule.create(context)
      const visitor2 = noHexEscapeRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      // reports
      visitor.Literal(makeLiteral('A', '"\\x41"'))
      // does not report (normal string)
      visitor.Literal(makeLiteral('hello', '"hello"'))
      // reports
      visitor.Literal(makeLiteral('B', '"\\x42"'))
      // does not report (quote char)
      visitor.Literal(makeLiteral('"', '"\\x22"'))
      // reports
      visitor.Literal(makeLiteral('C', '"\\x43"'))
      expect(reports.length).toBe(3)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      const node = {
        type: 'Literal',
        value: 'A',
        raw: '"\\x41"',
      }
      visitor.Literal(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })
  })

  // ===== ADDITIONAL CASES (10) =====
  describe('additional coverage', () => {
    test('message format is correct for \\x41', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('A', '"\\x41"'))
      expect(reports[0].message).toBe(
        'Unnecessary hex escape "\\x41". Use the printable character "A" instead for better readability.',
      )
    })

    test('message format is correct for \\x20 (space)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral(' ', '"\\x20"'))
      expect(reports[0].message).toBe(
        'Unnecessary hex escape "\\x20". Use the printable character " " instead for better readability.',
      )
    })

    test('message format is correct for \\x7e (tilde)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('~', '"\\x7e"'))
      expect(reports[0].message).toBe(
        'Unnecessary hex escape "\\x7e". Use the printable character "~" instead for better readability.',
      )
    })

    test('reports \\x25 — percent sign', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('%', '"\\x25"'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('"%"')
    })

    test('reports \\x2f — forward slash', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('/', '"\\x2f"'))
      expect(reports.length).toBe(1)
    })

    test('reports \\x3c — less than sign', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('<', '"\\x3c"'))
      expect(reports.length).toBe(1)
    })

    test('reports \\x3e — greater than sign', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('>', '"\\x3e"'))
      expect(reports.length).toBe(1)
    })

    test('reports \\x7b — left curly brace', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('{', '"\\x7b"'))
      expect(reports.length).toBe(1)
    })

    test('reports \\x7d — right curly brace', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('}', '"\\x7d"'))
      expect(reports.length).toBe(1)
    })

    test('multiple same hex escapes in different literals all report', () => {
      const { context, reports } = createMockContext()
      const visitor = noHexEscapeRule.create(context)
      visitor.Literal(makeLiteral('A', '"\\x41"'))
      visitor.Literal(makeLiteral('A', '"\\x41"'))
      visitor.Literal(makeLiteral('A', '"\\x41"'))
      expect(reports.length).toBe(3)
    })
  })
})

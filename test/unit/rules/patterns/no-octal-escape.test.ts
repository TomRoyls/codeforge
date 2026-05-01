import { describe, expect, test, vi } from 'vitest'
import { noOctalEscapeRule } from '../../../../src/rules/patterns/no-octal-escape.js'
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
    getSource: () => 'const s = "\\251"',
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

function makeStringLiteral(value: string, raw: string, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    raw,
    loc: makeLoc(line, column, line, column + raw.length),
  }
}

describe('no-octal-escape rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noOctalEscapeRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noOctalEscapeRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noOctalEscapeRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noOctalEscapeRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noOctalEscapeRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning octal and escape', () => {
      const desc = noOctalEscapeRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/octal/)
      expect(desc).toMatch(/escape/)
    })

    test('should have correct docs URL', () => {
      expect(noOctalEscapeRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-octal-escape',
      )
    })

    test('should have empty schema', () => {
      expect(noOctalEscapeRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with Literal', () => {
      const { context } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      expect(visitor).toHaveProperty('Literal')
      expect(typeof visitor.Literal).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noOctalEscapeRule).toBeDefined()
      expect(noOctalEscapeRule.meta).toBeDefined()
      expect(noOctalEscapeRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports octal escape sequences', () => {
    test('reports string with \\251 octal escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\xA9', '"\\251"'))
      expect(reports.length).toBe(1)
    })

    test('message contains "Octal escape"', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\xA9', '"\\251"'))
      expect(reports[0].message).toContain('Octal escape')
    })

    test('message contains the octal sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\xA9', '"\\251"'))
      expect(reports[0].message).toContain('\\251')
    })

    test('message mentions "hexadecimal" or "unicode"', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\xA9', '"\\251"'))
      const msg = reports[0].message.toLowerCase()
      expect(msg).toMatch(/hexadecimal|unicode/)
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\xA9', '"\\251"'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\xA9', '"\\251"'))
      expect(reports[0].node).toBeDefined()
    })

    test('reports \\0 single-digit octal escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\0', '"\\0"'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\0')
    })

    test('reports \\7 single-digit octal escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\x07', '"\\7"'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\7')
    })

    test('reports \\12 two-digit octal escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\n', '"\\12"'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\12')
    })

    test('reports \\377 three-digit octal escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\xFF', '"\\377"'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\377')
    })

    test('reports \\1 single-digit octal escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\x01', '"\\1"'))
      expect(reports.length).toBe(1)
    })

    test('reports \\01 two-digit octal escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\x01', '"\\01"'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\01')
    })

    test('reports \\001 three-digit octal escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\x01', '"\\001"'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\001')
    })

    test('report node property matches the original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      const node = makeStringLiteral('\xA9', '"\\251"')
      visitor.Literal(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports multiple violations accumulated across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\xA9', '"\\251"'))
      visitor.Literal(makeStringLiteral('\x07', '"\\7"'))
      visitor.Literal(makeStringLiteral('\n', '"\\12"'))
      expect(reports.length).toBe(3)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\xA9', '"\\251"', 5, 8))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('reports string with octal escape in middle of content', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('hello\xA9world', '"hello\\251world"'))
      expect(reports.length).toBe(1)
    })

    test('reports string with octal escape at beginning of content', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\x07start', '"\\7start"'))
      expect(reports.length).toBe(1)
    })

    test('reports string with octal escape at end of content', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('end\x07', '"end\\7"'))
      expect(reports.length).toBe(1)
    })

    test('reports \\40 octal escape (space character)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral(' ', '"\\40"'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\40')
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report normal string without escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('hello', '"hello"'))
      expect(reports.length).toBe(0)
    })

    test('does not report normal string with spaces', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('hello world', '"hello world"'))
      expect(reports.length).toBe(0)
    })

    test('does not report hex escape \\x41', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('A', '"\\x41"'))
      expect(reports.length).toBe(0)
    })

    test('does not report unicode escape \\u0041', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('A', '"\\u0041"'))
      expect(reports.length).toBe(0)
    })

    test('does not report template literal — non-Literal type', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal({
        type: 'TemplateLiteral',
        quasis: [],
        expressions: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 42,
        raw: '42',
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report boolean literal true', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: true,
        raw: 'true',
        loc: makeLoc(1, 0, 1, 4),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report boolean literal false', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: false,
        raw: 'false',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: null,
        raw: 'null',
        loc: makeLoc(1, 0, 1, 4),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report regex literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: /test/,
        raw: '/test/',
        regex: { pattern: 'test', flags: '' },
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report string with \\n (not octal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('hello\nworld', '"hello\\nworld"'))
      expect(reports.length).toBe(0)
    })

    test('does not report string with \\t (not octal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('hello\tworld', '"hello\\tworld"'))
      expect(reports.length).toBe(0)
    })

    test('does not report string with \\r (not octal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('hello\rworld', '"hello\\rworld"'))
      expect(reports.length).toBe(0)
    })

    test('does not report string with backslash followed by 8 (not octal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('a8', '"\\8"'))
      expect(reports.length).toBe(0)
    })

    test('does not report string with backslash followed by 9 (not octal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('a9', '"\\9"'))
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      expect(() => visitor.Literal(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      expect(() => visitor.Literal(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('', '""'))
      expect(reports.length).toBe(0)
    })

    test('does not report string with \\\\ (double backslash, no octal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\\', '"\\\\"'))
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      expect(() => visitor.Literal('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      expect(() => visitor.Literal(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report Literal with undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: undefined,
        raw: '"\\251"',
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report Literal with missing value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal({
        type: 'Literal',
        raw: '"\\251"',
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report Literal with missing raw property', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 'test',
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report node that is not Literal type', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal({
        type: 'Identifier',
        name: 'x',
        loc: makeLoc(1, 0, 1, 1),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      expect(() => visitor.Literal({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report string with \\b (backspace, not octal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\b', '"\\b"'))
      expect(reports.length).toBe(0)
    })

    test('does not report string with \\f (form feed, not octal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\f', '"\\f"'))
      expect(reports.length).toBe(0)
    })

    test('does not report string with \\v (vertical tab, not octal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\v', '"\\v"'))
      expect(reports.length).toBe(0)
    })

    test('does not report string with \\\\n (escaped backslash then n)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\\n', '"\\\\n"'))
      expect(reports.length).toBe(0)
    })

    test('does not report string with unicode escape \\u{1F600}', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('😀', '"\\u{1F600}"'))
      expect(reports.length).toBe(0)
    })

    test('does not report string with multiple hex escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('AB', '"\\x41\\x42"'))
      expect(reports.length).toBe(0)
    })

    test('does not report string with \\" (escaped quote, not octal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('"', '"\\""'))
      expect(reports.length).toBe(0)
    })

    test('does not report string with \\\' (escaped single quote)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral("'", '"\\\'"'))
      expect(reports.length).toBe(0)
    })

    test('does not report Literal with raw as non-string type', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 'test',
        raw: 123,
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noOctalEscapeRule.create(ctx1)
      const visitor2 = noOctalEscapeRule.create(ctx2)

      visitor1.Literal(makeStringLiteral('\xA9', '"\\251"'))
      visitor2.Literal(makeStringLiteral('clean', '"clean"'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\xA9', '"\\251"'))
      visitor.Literal(makeStringLiteral('\x07', '"\\7"'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: '\xA9',
        raw: '"\\251"',
      })
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: '\xA9',
        raw: '"\\251"',
      })
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed violations and non-violations count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\xA9', '"\\251"'))
      visitor.Literal(makeStringLiteral('hello', '"hello"'))
      visitor.Literal(makeStringLiteral('\x07', '"\\7"'))
      visitor.Literal(makeStringLiteral('A', '"\\x41"'))
      visitor.Literal(makeStringLiteral('\n', '"\\12"'))
      expect(reports.length).toBe(3)
    })

    test('raw with multiple octal sequences reports once (first match)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\xA9\x07', '"\\251\\7"'))
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noOctalEscapeRule.create(context)
      const visitor2 = noOctalEscapeRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\xA9', '"\\251"'))
      visitor.Literal(makeStringLiteral('\xA9', '"\\251"'))
      visitor.Literal(makeStringLiteral('\xA9', '"\\251"'))
      expect(reports.length).toBe(3)
    })

    test('handles node with missing raw and value gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal({
        type: 'Literal',
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('Literal with null value does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: null,
        raw: '"null"',
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('Literal with number value does not report even with octal-looking raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 42,
        raw: '"\\7"',
        loc: makeLoc(1, 0, 1, 4),
      })
      expect(reports.length).toBe(0)
    })

    test('Literal with boolean value does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: true,
        raw: '"true"',
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(0)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\xA9', '"\\251"', 10, 4))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })

    test('handles array node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      expect(() => visitor.Literal([1, 2, 3])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles node with numeric raw property', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: 'test',
        raw: 123,
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('meta is same reference across multiple accesses', () => {
      const meta1 = noOctalEscapeRule.meta
      const meta2 = noOctalEscapeRule.meta
      expect(meta1).toBe(meta2)
    })

    test('messages are consistent across multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\xA9', '"\\251"'))
      visitor.Literal(makeStringLiteral('\x07', '"\\7"'))
      // Messages differ because they include the matched sequence
      expect(reports[0].message).toContain('Octal escape')
      expect(reports[1].message).toContain('Octal escape')
    })

    test('reports string with single-quoted raw delimiter', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\xA9', "'\\251'"))
      expect(reports.length).toBe(1)
    })

    test('reports string with backtick raw delimiter', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal({
        type: 'Literal',
        value: '\xA9',
        raw: '`\\251`',
        loc: makeLoc(1, 0, 1, 6),
      })
      expect(reports.length).toBe(1)
    })

    test('reports octal sequence at position 0 in raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\x07', '"\\7"'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\7')
    })

    test('reports octal sequence at middle position in raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('ab\x07cd', '"ab\\7cd"'))
      expect(reports.length).toBe(1)
    })

    test('reports octal sequence at end position in raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('ab\x07', '"ab\\7"'))
      expect(reports.length).toBe(1)
    })

    test('reports string with raw \\\\7 (backslash-7 is octal in raw)', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\\7', '"\\\\7"'))
      expect(reports.length).toBe(1)
    })

    test('does not report string with only alphabetic content', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('abcdef', '"abcdef"'))
      expect(reports.length).toBe(0)
    })

    test('does not report string with only numeric content', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('123456', '"123456"'))
      expect(reports.length).toBe(0)
    })

    test('reports \\5 octal escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\x05', '"\\5"'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\5')
    })

    test('reports \\77 octal escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('?', '"\\77"'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\77')
    })

    test('reports \\200 octal escape', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\x80', '"\\200"'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('\\200')
    })

    test('report loc has both start and end properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\xA9', '"\\251"', 3, 10))
      expect(reports[0].loc?.start).toBeDefined()
      expect(reports[0].loc?.end).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('does not report string with \\\\ followed by non-octal letter', () => {
      const { context, reports } = createMockContext()
      const visitor = noOctalEscapeRule.create(context)
      visitor.Literal(makeStringLiteral('\\a', '"\\\\a"'))
      expect(reports.length).toBe(0)
    })
  })
})

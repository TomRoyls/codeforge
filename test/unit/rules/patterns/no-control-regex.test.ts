import { describe, test, expect, vi } from 'vitest'
import { noControlRegexRule } from '../../../../src/rules/patterns/no-control-regex.js'
import { createMockRuleContext, type ReportDescriptor } from '../../../helpers/ast-helpers.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

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

    test('should have a non-empty description', () => {
      expect(noControlRegexRule.meta.docs?.description.length).toBeGreaterThan(0)
    })

    test('should have meta property defined', () => {
      expect(noControlRegexRule.meta).toBeDefined()
    })

    test('should have docs property defined', () => {
      expect(noControlRegexRule.meta.docs).toBeDefined()
    })

    test('should have type as a string', () => {
      expect(typeof noControlRegexRule.meta.type).toBe('string')
    })

    test('should have severity as a string', () => {
      expect(typeof noControlRegexRule.meta.severity).toBe('string')
    })

    test('should have description as a string', () => {
      expect(typeof noControlRegexRule.meta.docs?.description).toBe('string')
    })

    test('should have fixable as undefined', () => {
      expect(noControlRegexRule.meta.fixable).toBeUndefined()
    })

    test('should have empty schema', () => {
      expect(noControlRegexRule.meta.schema).toEqual([])
    })

    test('should not be deprecated', () => {
      expect(noControlRegexRule.meta.deprecated).toBeUndefined()
    })

    test('should not have replacedBy', () => {
      expect(noControlRegexRule.meta.replacedBy).toBeUndefined()
    })

    test('should not have docs url', () => {
      expect(noControlRegexRule.meta.docs?.url).toBeUndefined()
    })

    test('should not require type checking', () => {
      expect(noControlRegexRule.meta.requiresTypeChecking).toBeUndefined()
    })
  })

  describe('create', () => {
    test('should return visitor with Literal method', () => {
      const { context } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      expect(visitor).toHaveProperty('Literal')
    })

    test('should return visitor with function', () => {
      const { context } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      expect(typeof visitor.Literal).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockRuleContext()
      const visitor1 = noControlRegexRule.create(context)
      const visitor2 = noControlRegexRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })

    test('should return visitor with Literal and RegExpLiteral keys', () => {
      const { context } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      expect(Object.keys(visitor)).toEqual(['Literal', 'RegExpLiteral'])
    })

    test('should accept context with different file paths', () => {
      const reports: ReportDescriptor[] = []
      const context = {
        report: (d: ReportDescriptor) => reports.push(d),
        getFilePath: () => '/other/file.ts',
        getAST: () => null,
        getSource: () => '',
        getTokens: () => [],
        getComments: () => [],
        config: { options: [] },
        logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        workspaceRoot: '/project',
      } as unknown as RuleContext
      const visitor = noControlRegexRule.create(context)
      expect(typeof visitor.Literal).toBe('function')
    })

    test('should not throw when create is called', () => {
      const { context } = createMockRuleContext()
      expect(() => noControlRegexRule.create(context)).not.toThrow()
    })

    test('should return visitor that can be called multiple times', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('abc'))
      visitor.Literal(createLiteralWithRegex('def'))

      expect(reports.length).toBe(0)
    })
  })

  describe('valid regex patterns', () => {
    test('should not report simple regex', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with special characters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('[a-z]+\\d*'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with spaces', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test pattern'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with tabs (tab is allowed)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test\tvalue'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with newlines (newline is allowed)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test\nvalue'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with carriage return (CR is allowed)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test\rvalue'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with escape sequences', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\\d+\\w*'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex without regex property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithoutRegex())

      expect(reports.length).toBe(0)
    })

    test('should not report regex with null regex property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithNullRegex())

      expect(reports.length).toBe(0)
    })

    test('should not report regex with only tab characters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\t\t\t'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with only newline characters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\n\n\n'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with only carriage return characters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\r\r\r'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with mixed allowed whitespace', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\t\n\r\t\n\r'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('[abc]'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with negated character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('[^abc]'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with quantifiers', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('a+b*c?d{2}e{1,3}'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with anchors', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('^start$'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with groups', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('(abc)(?:def)(?=ghi)'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with pipe alternation', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('cat|dog'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with backreference', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('(a)\\1'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with Unicode escapes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\\u0041'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with hex escapes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\\x41'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with dot metacharacter', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('a.b'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with word boundary', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\\bword\\b'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with digits only', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\\d+'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with word chars only', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\\w+'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with whitespace classes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\\s+'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with complex pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('^(?:https?:\\/\\/)?(?:www\\.)?[\\w-]+\\.[a-z]{2,}'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with email pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,}'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with date pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\\d{4}-\\d{2}-\\d{2}'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with IP pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with lookahead', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('foo(?=bar)'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with negative lookahead', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('foo(?!bar)'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with lookbehind', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('(?<=foo)bar'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with negative lookbehind', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('(?<!foo)bar'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with named groups', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('(?<name>abc)'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with printable ASCII range', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const printable = Array.from({ length: 95 }, (_, i) => String.fromCharCode(0x20 + i)).join('')
      visitor.Literal(createLiteralWithRegex(printable))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with unicode characters above 0x20', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('hello\u00E9world'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with CRLF combination', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('line1\r\nline2'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with multiple allowed whitespace chars mixed', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('a\tb\nc\r\rd\te\nf'))

      expect(reports.length).toBe(0)
    })
  })

  describe('invalid regex patterns with control characters', () => {
    test('should report regex with null character', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test\x00value'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Unexpected control character')
    })

    test('should report regex with start of heading character', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test\x01value'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('control character')
    })

    test('should report regex with bell character', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test\x07value'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with vertical tab', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test\x0Bvalue'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with form feed', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test\x0Cvalue'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with escape character', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('test\x1Bvalue'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with multiple control characters', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00\x01\x02'))

      expect(reports.length).toBe(1)
    })

    test('should report correct location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00', 5, 10))

      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('should report regex with STX (0x02)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x02'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with ETX (0x03)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x03'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with EOT (0x04)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x04'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with ENQ (0x05)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x05'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with ACK (0x06)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x06'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with backspace (0x08)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x08'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with shift out (0x0E)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x0E'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with shift in (0x0F)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x0F'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with DLE (0x10)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x10'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with DC1 (0x11)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x11'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with DC2 (0x12)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x12'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with DC3 (0x13)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x13'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with DC4 (0x14)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x14'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with NAK (0x15)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x15'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with SYN (0x16)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x16'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with ETB (0x17)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x17'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with CAN (0x18)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x18'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with EM (0x19)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x19'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with SUB (0x1A)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x1A'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with file separator (0x1C)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x1C'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with group separator (0x1D)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x1D'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with record separator (0x1E)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x1E'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with unit separator (0x1F)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x1F'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with control char at start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00abc'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with control char at end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('abc\x00'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with control char in middle', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('ab\x01cd'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with control char mixed with allowed whitespace', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('a\tb\x00c\nd'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with control char in character class', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('[\x00]'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with control char in group', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('(a\x00b)'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with control char after anchor', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('^\x00'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with control char before quantifier', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00+'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with only a single control char', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with two different control chars', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x01\x02'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with many different control chars', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00\x01\x02\x03\x04\x05'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with control char surrounded by normal text', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('hello\x07world'))

      expect(reports.length).toBe(1)
    })

    test('should report regex with control char in alternation', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('a|\x00|b'))

      expect(reports.length).toBe(1)
    })

    test('should report once even with multiple control chars in pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00\x01\x02\x03'))

      expect(reports.length).toBe(1)
    })
  })

  describe('report message', () => {
    test('should include "Unexpected" in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00'))

      expect(reports[0].message).toContain('Unexpected')
    })

    test('should include "control character" in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00'))

      expect(reports[0].message).toContain('control character')
    })

    test('should include "regular expression" in message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00'))

      expect(reports[0].message).toContain('regular expression')
    })

    test('should have consistent message for different control chars', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()

      noControlRegexRule.create(ctx1).Literal(createLiteralWithRegex('\x00'))
      noControlRegexRule.create(ctx2).Literal(createLiteralWithRegex('\x1F'))

      expect(r1[0].message).toBe(r2[0].message)
    })

    test('should end message with period', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00'))

      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('should have exact expected message', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00'))

      expect(reports[0].message).toBe('Unexpected control character in regular expression.')
    })
  })

  describe('location reporting', () => {
    test('should report location at line 1 column 0 by default', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00'))

      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should report correct location at custom line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00', 3))

      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('should report correct location at custom column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00', 1, 15))

      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('should report correct location at large line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00', 1000, 0))

      expect(reports[0].loc?.start.line).toBe(1000)
    })

    test('should report correct location at large column number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00', 1, 500))

      expect(reports[0].loc?.start.column).toBe(500)
    })

    test('should report end location', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00', 2, 5))

      expect(reports[0].loc?.end.line).toBe(2)
    })

    test('should report end column based on pattern length', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00', 1, 0))

      expect(reports[0].loc?.end.column).toBe(3)
    })

    test('should report location at line 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00', 0, 0))

      expect(reports[0].loc?.start.line).toBe(0)
    })

    test('should report location with column 0', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00', 5, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should include loc in report', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00'))

      expect(reports[0].loc).toBeDefined()
    })

    test('should include start in loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00'))

      expect(reports[0].loc?.start).toBeDefined()
    })

    test('should include end in loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00'))

      expect(reports[0].loc?.end).toBeDefined()
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      expect(() => visitor.Literal(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      expect(() => visitor.Literal(undefined)).not.toThrow()
    })

    test('should handle non-Literal node gracefully', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      expect(() => visitor.Literal(createNonLiteralNode())).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without regex property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = createLiteralWithoutRegex()
      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle regex object without pattern property', () => {
      const { context, reports } = createMockRuleContext()
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
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = createLiteralWithRegex('\x00')
      delete (node as Record<string, unknown>).loc

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle empty string pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex(''))

      expect(reports.length).toBe(0)
    })

    test('should handle boolean node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      expect(() => visitor.Literal(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle number node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      expect(() => visitor.Literal(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle string node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      expect(() => visitor.Literal('hello')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle empty object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      expect(() => visitor.Literal({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle array node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      expect(() => visitor.Literal([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with regex undefined', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty pattern string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      }

      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: 123 },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with object pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: { toString: () => 'test' } },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with null pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: null },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with undefined pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: undefined },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with loc missing start', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\x00' },
        loc: { end: { line: 1, column: 3 } },
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with loc missing end', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\x00' },
        loc: { start: { line: 1, column: 0 } },
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with string type that is not Literal', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\x00' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      }

      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with lowercase literal type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 'literal',
        regex: { pattern: '\x00' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      }

      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with numeric type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 42,
        regex: { pattern: '\x00' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      }

      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with null type', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: null,
        regex: { pattern: '\x00' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      }

      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with no type property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        regex: { pattern: '\x00' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      }

      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with empty loc object', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\x00' },
        loc: {},
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with string line in loc', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\x00' },
        loc: { start: { line: '1', column: 0 }, end: { line: '1', column: 3 } },
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle regex with flags property', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\x00', flags: 'gi' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('should handle regex with only flags no pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { flags: 'gi' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
      }

      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('should handle deeply nested node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\x00' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
        extra: { parenthesized: true },
        parent: { type: 'VariableDeclarator' },
      }

      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('should handle node with NaN line', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\x00' },
        loc: { start: { line: NaN, column: 0 }, end: { line: NaN, column: 3 } },
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with negative line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\x00' },
        loc: { start: { line: -1, column: 0 }, end: { line: -1, column: 3 } },
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with negative column number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\x00' },
        loc: { start: { line: 1, column: -5 }, end: { line: 1, column: -2 } },
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle node with zero column', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00', 1, 0))

      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('should handle node with fractional line number', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: 'Literal',
        regex: { pattern: '\x00' },
        loc: { start: { line: 1.5, column: 0 }, end: { line: 1.5, column: 3 } },
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })
  })

  describe('multiple visitor calls', () => {
    test('should report each regex with control chars separately', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00'))
      visitor.Literal(createLiteralWithRegex('\x01'))

      expect(reports.length).toBe(2)
    })

    test('should not report valid patterns mixed with invalid', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('valid'))
      visitor.Literal(createLiteralWithRegex('\x00'))
      visitor.Literal(createLiteralWithRegex('also-valid'))

      expect(reports.length).toBe(1)
    })

    test('should handle many consecutive valid patterns', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.Literal(createLiteralWithRegex(`pattern${i}`))
      }

      expect(reports.length).toBe(0)
    })

    test('should handle many consecutive invalid patterns', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      for (let i = 0; i < 50; i++) {
        visitor.Literal(createLiteralWithRegex(`\x00${i}`))
      }

      expect(reports.length).toBe(50)
    })

    test('should handle alternating valid and invalid patterns', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          visitor.Literal(createLiteralWithRegex('valid'))
        } else {
          visitor.Literal(createLiteralWithRegex('\x00'))
        }
      }

      expect(reports.length).toBe(10)
    })

    test('should maintain separate report state between creates', () => {
      const { context: ctx1, reports: r1 } = createMockRuleContext()
      const { context: ctx2, reports: r2 } = createMockRuleContext()

      const visitor1 = noControlRegexRule.create(ctx1)
      const visitor2 = noControlRegexRule.create(ctx2)

      visitor1.Literal(createLiteralWithRegex('\x00'))
      visitor2.Literal(createLiteralWithRegex('valid'))

      expect(r1.length).toBe(1)
      expect(r2.length).toBe(0)
    })
  })

  describe('control character boundary checks', () => {
    test('should not report space character (0x20)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x20'))

      expect(reports.length).toBe(0)
    })

    test('should not report exclamation mark (0x21)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x21'))

      expect(reports.length).toBe(0)
    })

    test('should report unit separator (0x1F) - highest control char', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x1F'))

      expect(reports.length).toBe(1)
    })

    test('should report null (0x00) - lowest control char', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x00'))

      expect(reports.length).toBe(1)
    })

    test('should not report DEL character (0x7F) - above range', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x7F'))

      expect(reports.length).toBe(0)
    })

    test('should not report delete followed by valid text', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x7Fabc'))

      expect(reports.length).toBe(0)
    })

    test('should report pattern with just below 0x20', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x1E'))

      expect(reports.length).toBe(1)
    })

    test('should not report tab (0x09) specifically', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x09'))

      expect(reports.length).toBe(0)
    })

    test('should not report line feed (0x0A) specifically', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x0A'))

      expect(reports.length).toBe(0)
    })

    test('should not report carriage return (0x0D) specifically', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x0D'))

      expect(reports.length).toBe(0)
    })

    test('should report char just before tab (0x08)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x08'))

      expect(reports.length).toBe(1)
    })

    test('should report char just after tab (0x0B)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x0B'))

      expect(reports.length).toBe(1)
    })

    test('should report char just after line feed (0x0B = VT)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x0B'))

      expect(reports.length).toBe(1)
    })

    test('should report char just before carriage return (0x0C = FF)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x0C'))

      expect(reports.length).toBe(1)
    })

    test('should report char just after carriage return (0x0E = SO)', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\x0E'))

      expect(reports.length).toBe(1)
    })
  })

  describe('exports', () => {
    test('should have a named export', () => {
      expect(noControlRegexRule).toBeDefined()
    })

    test('should be a RuleDefinition object', () => {
      expect(noControlRegexRule).toHaveProperty('meta')
      expect(noControlRegexRule).toHaveProperty('create')
    })

    test('should have create as a function', () => {
      expect(typeof noControlRegexRule.create).toBe('function')
    })

    test('should have meta as an object', () => {
      expect(typeof noControlRegexRule.meta).toBe('object')
    })
  })

  describe('context interaction', () => {
    test('should not call report for valid pattern', () => {
      let reportCalled = false
      const context = {
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

      const visitor = noControlRegexRule.create(context)
      visitor.Literal(createLiteralWithRegex('valid'))

      expect(reportCalled).toBe(false)
    })

    test('should call report for invalid pattern', () => {
      let reportCalled = false
      const context = {
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

      const visitor = noControlRegexRule.create(context)
      visitor.Literal(createLiteralWithRegex('\x00'))

      expect(reportCalled).toBe(true)
    })

    test('should call report exactly once per invalid node', () => {
      let reportCount = 0
      const context = {
        report: () => {
          reportCount++
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

      const visitor = noControlRegexRule.create(context)
      visitor.Literal(createLiteralWithRegex('\x00\x01\x02'))

      expect(reportCount).toBe(1)
    })

    test('should not call report for null regex', () => {
      let reportCalled = false
      const context = {
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

      const visitor = noControlRegexRule.create(context)
      visitor.Literal(createLiteralWithNullRegex())

      expect(reportCalled).toBe(false)
    })

    test('should not call report for non-regex literal', () => {
      let reportCalled = false
      const context = {
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

      const visitor = noControlRegexRule.create(context)
      visitor.Literal(createLiteralWithoutRegex())

      expect(reportCalled).toBe(false)
    })
  })

  describe('real-world patterns', () => {
    test('should report regex with embedded NUL in URL pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('https://example.com\x00/path'))

      expect(reports.length).toBe(1)
    })

    test('should not report regex for phone number pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(
        createLiteralWithRegex(
          '\\+?\\d{1,3}[-.\\s]?\\(?\\d{1,4}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}',
        ),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report regex for hex color pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('#[0-9a-fA-F]{3,8}'))

      expect(reports.length).toBe(0)
    })

    test('should report regex with control char in JSON-like pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('"key":\t"value\x01"'))

      expect(reports.length).toBe(1)
    })

    test('should not report regex for CSS selector pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\\.[a-zA-Z][\\w-]*'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with all ASCII printable chars', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const allPrintable = Array.from({ length: 95 }, (_, i) =>
        String.fromCharCode(0x20 + i).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&'),
      ).join('')

      visitor.Literal(createLiteralWithRegex(allPrintable))

      expect(reports.length).toBe(0)
    })

    test('should report regex with bell char in log pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\\[ERROR\\]\x07'))

      expect(reports.length).toBe(1)
    })

    test('should not report regex with escaped backslash followed by allowed chars', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\\\\t\\\\n\\\\r'))

      expect(reports.length).toBe(0)
    })

    test('should report regex with SUB char in data parsing', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\\d+\x1A\\d+'))

      expect(reports.length).toBe(1)
    })

    test('should not report regex for UUID pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(
        createLiteralWithRegex('[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report regex for semver pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\\d+\\.\\d+\\.\\d+(-[\\w.]+)?'))

      expect(reports.length).toBe(0)
    })

    test('should report regex with control char in password pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('[\\w\x00!@#$%]+'))

      expect(reports.length).toBe(1)
    })

    test('should not report regex for base64 pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('[A-Za-z0-9+/]+=*'))

      expect(reports.length).toBe(0)
    })

    test('should not report regex with unicode property escapes', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\\p{Letter}+'))

      expect(reports.length).toBe(0)
    })

    test('should report regex with form feed in whitespace pattern', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      visitor.Literal(createLiteralWithRegex('\\S+\x0C\\S+'))

      expect(reports.length).toBe(1)
    })
  })

  describe('isLiteral helper behavior', () => {
    test('should not crash on function argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      expect(() => visitor.Literal(() => {})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not crash on Symbol argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      expect(() => visitor.Literal(Symbol('test'))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should not crash on BigInt argument', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      expect(() => visitor.Literal(BigInt(42))).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node with type as empty string', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = {
        type: '',
        regex: { pattern: '\x00' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      }

      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('should handle node with prototype pollution attempt', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = Object.create({ type: 'Literal' })
      node.regex = { pattern: '\x00' }
      node.loc = { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } }

      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('should handle frozen object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = Object.freeze({
        type: 'Literal',
        regex: { pattern: '\x00' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      })

      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('should handle sealed object node', () => {
      const { context, reports } = createMockRuleContext()
      const visitor = noControlRegexRule.create(context)

      const node = Object.seal({
        type: 'Literal',
        regex: { pattern: '\x00' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 3 } },
      })

      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })
  })
})

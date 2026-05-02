import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryTemplateLiteralSingleRule } from '../../../../src/rules/patterns/no-unnecessary-template-literal-single.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  node?: unknown
}

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
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
    getSource: () => '[]',
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

function makeTemplateLiteral(raw: string, expressions: unknown[] = [], locStartLine = 1, locStartCol = 0, locEndLine = 1, locEndCol = 20): unknown {
  return {
    type: 'TemplateLiteral',
    expressions,
    quasis: [
      {
        type: 'TemplateElement',
        value: { raw, cooked: raw },
        raw,
        tail: true,
      },
    ],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-template-literal-single rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryTemplateLiteralSingleRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryTemplateLiteralSingleRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryTemplateLiteralSingleRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryTemplateLiteralSingleRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryTemplateLiteralSingleRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning template literal', () => {
      const desc = noUnnecessaryTemplateLiteralSingleRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/template/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryTemplateLiteralSingleRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-template-literal-single.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryTemplateLiteralSingleRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with TemplateLiteral', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      expect(visitor).toHaveProperty('TemplateLiteral')
      expect(typeof visitor.TemplateLiteral).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryTemplateLiteralSingleRule).toBeDefined()
      expect(noUnnecessaryTemplateLiteralSingleRule.meta).toBeDefined()
      expect(noUnnecessaryTemplateLiteralSingleRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary template literal', () => {
    test('reports for empty template literal ``', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral(''))
      expect(reports.length).toBe(1)
    })

    test('reports for simple word `hello`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('hello'))
      expect(reports.length).toBe(1)
    })

    test('reports for multi-word `foo bar baz`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('foo bar baz'))
      expect(reports.length).toBe(1)
    })

    test('reports for single character `a`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('a'))
      expect(reports.length).toBe(1)
    })

    test('reports for number string `123`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('123'))
      expect(reports.length).toBe(1)
    })

    test('reports for whitespace ` `', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral(' '))
      expect(reports.length).toBe(1)
    })

    test('reports for newline `\\n`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('\n'))
      expect(reports.length).toBe(1)
    })

    test('reports for multi-line string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('line1\nline2'))
      expect(reports.length).toBe(1)
    })

    test('reports for special chars like !@#$%', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('!@#$%'))
      expect(reports.length).toBe(1)
    })

    test('reports for tab character', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('\t'))
      expect(reports.length).toBe(1)
    })

    test('reports for unicode characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('café'))
      expect(reports.length).toBe(1)
    })

    test('reports for emoji string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('🎉'))
      expect(reports.length).toBe(1)
    })

    test('reports for backtick-like content without actual backtick', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('hello world'))
      expect(reports.length).toBe(1)
    })

    test('reports for path with forward slashes `usr/local/bin`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('usr/local/bin'))
      expect(reports.length).toBe(1)
    })

    test('reports for URL without quotes `http://example.com`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('http://example.com'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('hello'))
      expect(reports[0].message).toMatch(/unnecessary/i)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('hello'))
      expect(reports[0].message).toBe(
        'Unnecessary template literal without expressions and without characters that need escaping. Use a regular string instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('hello'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('hello'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input TemplateLiteral node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      const node = makeTemplateLiteral('hello')
      visitor.TemplateLiteral(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('hello', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('hello'))
      visitor.TemplateLiteral(makeTemplateLiteral('world'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('hello'))
      visitor.TemplateLiteral(makeTemplateLiteral('world'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('hello'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for string with parentheses `(value)`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('(value)'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with angle brackets `<div>`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('<div>'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with curly braces `{key}`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('{key}'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with square brackets `[0]`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('[0]'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with semicolons and commas `a;b,c`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('a;b,c'))
      expect(reports.length).toBe(1)
    })

    test('reports for very long string without special chars', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('a'.repeat(500)))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (37) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for template literal with expression `hello ${name}`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('hello ', [{ type: 'Identifier', name: 'name' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal containing double quotes `he said "yes"`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('he said "yes"'))
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal containing single quote `it\'s fine`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral("it's fine"))
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal containing backslash escape `path\\to\\file`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('path\\to\\file'))
      expect(reports.length).toBe(0)
    })

    test('does not report for regular string "hello"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({ type: 'Literal', value: 'hello' })
      expect(reports.length).toBe(0)
    })

    test('does not report for regular single-quoted string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({ type: 'Literal', value: 'hello' })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      expect(() => visitor.TemplateLiteral(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      expect(() => visitor.TemplateLiteral(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      expect(() => visitor.TemplateLiteral({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      expect(() => visitor.TemplateLiteral('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      expect(() => visitor.TemplateLiteral(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      expect(() => visitor.TemplateLiteral(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with multiple expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }],
        quasis: [
          { type: 'TemplateElement', value: { raw: 'hello ', cooked: 'hello ' }, tail: false },
          { type: 'TemplateElement', value: { raw: ' world ', cooked: ' world ' }, tail: false },
          { type: 'TemplateElement', value: { raw: '', cooked: '' }, tail: true },
        ],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with expressions array missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' }, tail: true }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with quasis array missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with two quasis', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [{ type: 'Identifier', name: 'x' }],
        quasis: [
          { type: 'TemplateElement', value: { raw: 'hello ', cooked: 'hello ' }, tail: false },
          { type: 'TemplateElement', value: { raw: '', cooked: '' }, tail: true },
        ],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with only double quote `"`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('"'))
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with only single quote `\'`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral("'"))
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with only backslash `\\`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('\\'))
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with mixed quotes `"it\'s"`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral(`"it's"`))
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with backslash at start `\\nhello`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('\\nhello'))
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with backslash at end `hello\\n`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('hello\\n'))
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with multiple double quotes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('"hello" "world"'))
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with multiple single quotes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral("it's going to be fine, isn't it"))
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with multiple backslashes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('a\\b\\c\\d'))
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with expressions not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: 'not-array',
        quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' }, tail: true }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with quasis not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with quasis as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with raw as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: { raw: 123, cooked: '123' }, tail: true }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with raw as undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: { raw: undefined, cooked: '' }, tail: true }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with raw as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: { raw: null, cooked: '' }, tail: true }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for template literal with empty quasis array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })


  })

  // ===== EDGE CASES (18) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryTemplateLiteralSingleRule.create(ctx1)
      const visitor2 = noUnnecessaryTemplateLiteralSingleRule.create(ctx2)
      visitor1.TemplateLiteral(makeTemplateLiteral('hello'))
      visitor2.TemplateLiteral(makeTemplateLiteral('he said "yes"'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('hello'))
      visitor.TemplateLiteral(makeTemplateLiteral('he said "yes"'))
      visitor.TemplateLiteral(makeTemplateLiteral('world'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      const node = {
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' }, raw: 'hello', tail: true }],
      }
      visitor.TemplateLiteral(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      const node = {
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' }, raw: 'hello', tail: true }],
      }
      visitor.TemplateLiteral(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('hello'))
      visitor.TemplateLiteral(makeTemplateLiteral('he said "yes"'))
      visitor.TemplateLiteral({ type: 'Identifier', name: 'foo' })
      visitor.TemplateLiteral(makeTemplateLiteral('world'))
      visitor.TemplateLiteral(makeTemplateLiteral("it's fine"))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryTemplateLiteralSingleRule.create(context)
      const visitor2 = noUnnecessaryTemplateLiteralSingleRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryTemplateLiteralSingleRule.meta
      const meta2 = noUnnecessaryTemplateLiteralSingleRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      const node = {
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' }, raw: 'hello', tail: true }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.TemplateLiteral(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' }, raw: 'hello', tail: true }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' }, raw: 'hello', tail: true }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      const node = makeTemplateLiteral('hello')
      visitor.TemplateLiteral(node)
      visitor.TemplateLiteral(node)
      visitor.TemplateLiteral(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryTemplateLiteralSingleRule).toBeDefined()
      expect(typeof noUnnecessaryTemplateLiteralSingleRule.create).toBe('function')
      expect(typeof noUnnecessaryTemplateLiteralSingleRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral({
        type: 'TemplateLiteral',
        expressions: [],
        quasis: [{ type: 'TemplateElement', value: { raw: 'hello', cooked: 'hello' }, raw: 'hello', tail: true }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('hello', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('template literal with only double quote character is valid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('"hello" and "world"'))
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('hello'))
      visitor.TemplateLiteral(makeTemplateLiteral('world'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report for raw string containing escaped double quote `\\"`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral('\\"hello\\"'))
      expect(reports.length).toBe(0)
    })

    test('does not report for raw string containing escaped single quote `\\\'`', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryTemplateLiteralSingleRule.create(context)
      visitor.TemplateLiteral(makeTemplateLiteral("\\'hello\\'"))
      expect(reports.length).toBe(0)
    })
  })
})

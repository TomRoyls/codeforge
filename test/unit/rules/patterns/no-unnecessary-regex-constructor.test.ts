import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryRegexConstructorRule } from '../../../../src/rules/patterns/no-unnecessary-regex-constructor.js'
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
    getSource: () => 'new RegExp("hello")',
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

function makeNewExprNode(
  argValue: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 18,
): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: 'RegExp' },
    arguments: [{ type: 'Literal', value: argValue }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-regex-constructor rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryRegexConstructorRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryRegexConstructorRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryRegexConstructorRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryRegexConstructorRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryRegexConstructorRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning RegExp', () => {
      const desc = noUnnecessaryRegexConstructorRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toContain('regexp')
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryRegexConstructorRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-regex-constructor',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryRegexConstructorRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      expect(visitor).toHaveProperty('NewExpression')
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryRegexConstructorRule).toBeDefined()
      expect(noUnnecessaryRegexConstructorRule.meta).toBeDefined()
      expect(noUnnecessaryRegexConstructorRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY REGEXP (25) =====

  describe('positive cases — reports unnecessary RegExp constructor', () => {
    test('reports for new RegExp("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('hello'))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("world")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('world'))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("simpleString")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('simpleString'))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("abc")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('abc'))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("test_value")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('test_value'))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("fooBar123")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('fooBar123'))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("singleword")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('singleword'))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp(" spaces ")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode(' spaces '))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("path/to/file")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('path/to/file'))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("data.json")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('data.json'))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("hello-world")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('hello-world'))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("CamelCase")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('CamelCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("a")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('a'))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode(''))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("12345")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('12345'))
      expect(reports.length).toBe(1)
    })

    test('reports for node with loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('hello', 5, 10, 5, 28))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('reports for node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 18),
        range: [0, 18],
        extra: true,
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("some_text_here")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('some_text_here'))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("index.html")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('index.html'))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("component.tsx")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('component.tsx'))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("kebab-case-string")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('kebab-case-string'))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("UPPERCASE")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('UPPERCASE'))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("with\nnewline")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('with\nnewline'))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("tab\there")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('tab\there'))
      expect(reports.length).toBe(1)
    })

    test('reports for new RegExp("unicode_日本語")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('unicode_日本語'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message mentions RegExp', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('hello'))
      expect(reports[0].message).toContain('RegExp')
    })

    test('report message contains the string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('hello'))
      expect(reports[0].message).toContain('hello')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('hello'))
      expect(reports[0].message).toBe(
        'Unnecessary RegExp constructor for static string "hello". Use a string method instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('hello'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('hello'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input NewExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      const node = makeNewExprNode('hello')
      visitor.NewExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('hello', 5, 10, 5, 28))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('hello'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('hello'))
      visitor.NewExpression(makeNewExprNode('world'))
      expect(reports.length).toBe(2)
    })

    test('consistent messages across multiple reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('hello'))
      visitor.NewExpression(makeNewExprNode('world'))
      expect(reports[0].message).toContain('Unnecessary RegExp constructor')
      expect(reports[1].message).toContain('Unnecessary RegExp constructor')
    })

    test('single report per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('hello'))
      expect(reports.length).toBe(1)
    })

    test('multiple violations each produce separate reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('abc'))
      visitor.NewExpression(makeNewExprNode('def'))
      visitor.NewExpression(makeNewExprNode('ghi'))
      expect(reports.length).toBe(3)
    })

    test('report message mentions "string method"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('hello'))
      expect(reports[0].message.toLowerCase()).toContain('string method')
    })

    test('report message mentions "static string"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('hello'))
      expect(reports[0].message.toLowerCase()).toContain('static string')
    })

    test('report message mentions "constructor"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('hello'))
      expect(reports[0].message.toLowerCase()).toContain('constructor')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for new RegExp("a.*b") with special chars', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('a.*b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new RegExp("a|b") with pipe', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('a|b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new RegExp(pat, "g") with 2 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [
          { type: 'Literal', value: 'hello' },
          { type: 'Literal', value: 'g' },
        ],
        loc: makeLoc(1, 0, 1, 22),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for RegExp.test() — call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'RegExp' },
          property: { type: 'Identifier', name: 'test' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for non-RegExp new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for primitive string node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      expect(() => visitor.NewExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for primitive number node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      expect(() => visitor.NewExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string with asterisk *', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('a*b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with plus +', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('a+b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with question mark ?', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('a?b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with opening bracket [', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('a[b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with closing bracket ]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('a]b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with opening parenthesis (', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('a(b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with closing parenthesis )', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('a)b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with opening brace {', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('a{b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with closing brace }', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('a}b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with pipe |', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('a|b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with caret ^', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('^abc'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with dollar $', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('abc$'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with backslash', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('a\\b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-string literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryRegexConstructorRule.create(ctx1)
      const visitor2 = noUnnecessaryRegexConstructorRule.create(ctx2)
      visitor1.NewExpression(makeNewExprNode('hello'))
      visitor2.NewExpression(makeNewExprNode('a.*b'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('accumulates reports correctly across mixed inputs', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('hello'))
      visitor.NewExpression(makeNewExprNode('a.*b'))
      visitor.NewExpression(makeNewExprNode('world'))
      expect(reports.length).toBe(2)
    })

    test('handles node without loc — still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Literal', value: 'hello' }],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node without loc — default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Literal', value: 'hello' }],
      }
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('a.*b'))
      visitor.NewExpression(makeNewExprNode('hello'))
      visitor.NewExpression(makeNewExprNode('a|b'))
      visitor.NewExpression(makeNewExprNode('world'))
      visitor.NewExpression(makeNewExprNode('test'))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryRegexConstructorRule.create(context)
      const visitor2 = noUnnecessaryRegexConstructorRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryRegexConstructorRule.meta
      const meta2 = noUnnecessaryRegexConstructorRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 18),
        range: [0, 18],
        extra: true,
        trailingComments: [],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: {},
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryRegexConstructorRule).toBeDefined()
      expect(typeof noUnnecessaryRegexConstructorRule.create).toBe('function')
      expect(typeof noUnnecessaryRegexConstructorRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 18),
        _parent: { type: 'VariableDeclarator' },
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      visitor.NewExpression(makeNewExprNode('hello', 10, 4, 10, 22))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      const node = makeNewExprNode('hello')
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      expect(reports.length).toBe(3)
    })

    test('does not report when callee name is not RegExp', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'MyRegExp' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'globalThis' },
          property: { type: 'Identifier', name: 'RegExp' },
        },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for non-Literal argument type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Identifier', name: 'pattern' }],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for arguments with three args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [
          { type: 'Literal', value: 'hello' },
          { type: 'Literal', value: 'g' },
          { type: 'Literal', value: 'extra' },
        ],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexConstructorRule.create(context)
      expect(() => visitor.NewExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })
  })
})

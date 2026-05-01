import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryRegexRule } from '../../../../src/rules/patterns/no-unnecessary-regex.js'
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
    getSource: () => 're.test("hello")',
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

function makeCallNode(
  methodName: string,
  argValue: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 're' },
      property: { type: 'Identifier', name: methodName },
    },
    arguments: [{ type: 'Literal', value: argValue }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-regex rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryRegexRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryRegexRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryRegexRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryRegexRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryRegexRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning regex', () => {
      const desc = noUnnecessaryRegexRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/regex/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryRegexRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-regex',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryRegexRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryRegexRule).toBeDefined()
      expect(noUnnecessaryRegexRule.meta).toBeDefined()
      expect(noUnnecessaryRegexRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY REGEX (25) =====

  describe('positive cases — reports unnecessary regex', () => {
    test('reports for .test("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'hello'))
      expect(reports.length).toBe(1)
    })

    test('reports for .match("world")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('match', 'world'))
      expect(reports.length).toBe(1)
    })

    test('reports for .replace("foo")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('replace', 'foo'))
      expect(reports.length).toBe(1)
    })

    test('reports for .search("bar")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('search', 'bar'))
      expect(reports.length).toBe(1)
    })

    test('reports for .test("abc")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'abc'))
      expect(reports.length).toBe(1)
    })

    test('reports for .test("hello world")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'hello world'))
      expect(reports.length).toBe(1)
    })

    test('reports for .test("foo_bar")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'foo_bar'))
      expect(reports.length).toBe(1)
    })

    test('reports for .match("kebab-case-value")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('match', 'kebab-case-value'))
      expect(reports.length).toBe(1)
    })

    test('reports for .replace("a")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('replace', 'a'))
      expect(reports.length).toBe(1)
    })

    test('reports for .search("test123")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('search', 'test123'))
      expect(reports.length).toBe(1)
    })

    test('reports for .test("UPPERCASE")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'UPPERCASE'))
      expect(reports.length).toBe(1)
    })

    test('reports for .test("CamelCase")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'CamelCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for .match("  spaces  ")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('match', '  spaces  '))
      expect(reports.length).toBe(1)
    })

    test('reports for .replace("tab\there")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('replace', 'tab\there'))
      expect(reports.length).toBe(1)
    })

    test('reports for .search("new\nline")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('search', 'new\nline'))
      expect(reports.length).toBe(1)
    })

    test('reports for .test("emoji🎉")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'emoji🎉'))
      expect(reports.length).toBe(1)
    })

    test('reports for .test("path/to/file")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'path/to/file'))
      expect(reports.length).toBe(1)
    })

    test('reports for .match("name=value")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('match', 'name=value'))
      expect(reports.length).toBe(1)
    })

    test('reports for .replace("hello!")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('replace', 'hello!'))
      expect(reports.length).toBe(1)
    })

    test('reports for .search("#tag")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('search', '#tag'))
      expect(reports.length).toBe(1)
    })

    test('reports for .test("%s")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', '%s'))
      expect(reports.length).toBe(1)
    })

    test('reports for .match("@user")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('match', '@user'))
      expect(reports.length).toBe(1)
    })

    test('reports for .replace("3,14")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('replace', '3,14'))
      expect(reports.length).toBe(1)
    })

    test('reports for .test("a&b")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'a&b'))
      expect(reports.length).toBe(1)
    })

    test('reports for .search("<html>")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('search', '<html>'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message contains "Unnecessary regex escape"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'hello'))
      expect(reports[0].message).toContain('Unnecessary regex escape')
    })

    test('report message contains the string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'hello'))
      expect(reports[0].message).toContain('hello')
    })

    test('report message contains "string method"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'hello'))
      expect(reports[0].message).toContain('string method')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'hello'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'hello'))
      expect(reports[0].node).toBeDefined()
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'hello'))
      expect(reports[0].message).toBe(
        "Unnecessary regex escape in 'hello'. Use a string method instead.",
      )
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'hello', 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      const node = makeCallNode('test', 'hello')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report message includes the specific string for match', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('match', 'world'))
      expect(reports[0].message).toContain('world')
    })

    test('report message includes the specific string for replace', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('replace', 'foo'))
      expect(reports[0].message).toContain('foo')
    })

    test('report message includes the specific string for search', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('search', 'bar'))
      expect(reports[0].message).toContain('bar')
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'hello'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'hello'))
      visitor.CallExpression(makeCallNode('match', 'world'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'hello'))
      visitor.CallExpression(makeCallNode('match', 'world'))
      expect(reports[0].message).toMatch(/Unnecessary regex escape/)
      expect(reports[1].message).toMatch(/Unnecessary regex escape/)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'hello', 10, 4, 10, 16))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(16)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for .test("hello.*")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'hello.*'))
      expect(reports.length).toBe(0)
    })

    test('does not report for .match("a+b")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('match', 'a+b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for .replace("a?b")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('replace', 'a?b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for .search("^start")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('search', '^start'))
      expect(reports.length).toBe(0)
    })

    test('does not report for .test("end$")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'end$'))
      expect(reports.length).toBe(0)
    })

    test('does not report for .match("a{2}")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('match', 'a{2}'))
      expect(reports.length).toBe(0)
    })

    test('does not report for .replace("(group)")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('replace', '(group)'))
      expect(reports.length).toBe(0)
    })

    test('does not report for .search("a|b")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('search', 'a|b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for .test("[abc]")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', '[abc]'))
      expect(reports.length).toBe(0)
    })

    test('does not report for .match("\\\\d")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('match', '\\d'))
      expect(reports.length).toBe(0)
    })

    test('does not report for .exec("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('exec', 'hello'))
      expect(reports.length).toBe(0)
    })

    test('does not report for .split("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('split', 'hello'))
      expect(reports.length).toBe(0)
    })

    test('does not report for .includes("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('includes', 'hello'))
      expect(reports.length).toBe(0)
    })

    test('does not report for .indexOf("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('indexOf', 'hello'))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 're' },
          property: { type: 'Identifier', name: 'test' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is numeric literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 're' },
          property: { type: 'Identifier', name: 'test' },
        },
        arguments: [{ type: 'Literal', value: 123 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 're' },
          property: { type: 'Identifier', name: 'test' },
        },
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first argument is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 're' },
          property: { type: 'Identifier', name: 'test' },
        },
        arguments: [{ type: 'Identifier', name: 'pattern' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'test' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 're' },
          property: { type: 'Literal', value: 'test' },
        },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for node that is not CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression({
        type: 'Identifier',
        name: 'foo',
        loc: makeLoc(1, 0, 1, 3),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression({})
      expect(reports.length).toBe(0)
    })

    test('does not report for .startsWith("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('startsWith', 'hello'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryRegexRule.create(ctx1)
      const visitor2 = noUnnecessaryRegexRule.create(ctx2)
      visitor1.CallExpression(makeCallNode('test', 'hello'))
      visitor2.CallExpression(makeCallNode('test', 'hello.*'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'hello'))
      visitor.CallExpression(makeCallNode('test', 'hello.*'))
      visitor.CallExpression(makeCallNode('match', 'world'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 're' },
          property: { type: 'Identifier', name: 'test' },
        },
        arguments: [{ type: 'Literal', value: 'hello' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 're' },
          property: { type: 'Identifier', name: 'test' },
        },
        arguments: [{ type: 'Literal', value: 'hello' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'hello'))
      visitor.CallExpression(makeCallNode('test', 'hello.*'))
      visitor.CallExpression(makeCallNode('match', 'world'))
      visitor.CallExpression(makeCallNode('match', '^world'))
      visitor.CallExpression(makeCallNode('replace', 'foo'))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryRegexRule.create(context)
      const visitor2 = noUnnecessaryRegexRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryRegexRule.meta
      const meta2 = noUnnecessaryRegexRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 're' },
          property: { type: 'Identifier', name: 'test' },
        },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 're' },
          property: { type: 'Identifier', name: 'test' },
        },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 're' },
          property: { type: 'Identifier', name: 'test' },
        },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      const node = makeCallNode('test', 'hello')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryRegexRule).toBeDefined()
      expect(typeof noUnnecessaryRegexRule.create).toBe('function')
      expect(typeof noUnnecessaryRegexRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 're' },
          property: { type: 'Identifier', name: 'test' },
        },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression(makeCallNode('test', 'hello'))
      visitor.CallExpression(makeCallNode('match', 'world'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toMatch(/Unnecessary regex escape/)
      expect(reports[1].message).toMatch(/Unnecessary regex escape/)
    })

    test('handles callee object with null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles arguments as non-array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 're' },
          property: { type: 'Identifier', name: 'test' },
        },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles first argument as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 're' },
          property: { type: 'Identifier', name: 'test' },
        },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles property with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 're' },
          property: null,
        },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal with null value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 're' },
          property: { type: 'Identifier', name: 'test' },
        },
        arguments: [{ type: 'Literal', value: null }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal with undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryRegexRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 're' },
          property: { type: 'Identifier', name: 'test' },
        },
        arguments: [{ type: 'Literal' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryEscapeRule } from '../../../../src/rules/patterns/no-unnecessary-escape.js'
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
    getSource: () => '"\\a"',
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

function makeStringNode(
  value: string,
  raw: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 5,
): unknown {
  return {
    type: 'StringLiteral',
    value,
    raw,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-escape rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryEscapeRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryEscapeRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryEscapeRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryEscapeRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryEscapeRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning escape', () => {
      const desc = noUnnecessaryEscapeRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/escape/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryEscapeRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-escape',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryEscapeRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with StringLiteral', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      expect(visitor).toHaveProperty('StringLiteral')
      expect(typeof visitor.StringLiteral).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryEscapeRule).toBeDefined()
      expect(noUnnecessaryEscapeRule.meta).toBeDefined()
      expect(noUnnecessaryEscapeRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY ESCAPE (30) =====

  describe('positive cases — reports unnecessary escape', () => {
    test('reports for unnecessary escape \\a', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('a', '\\a'))
      expect(reports.length).toBe(1)
    })

    test('reports for unnecessary escape \\c', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('c', '\\c'))
      expect(reports.length).toBe(1)
    })

    test('reports for unnecessary escape \\d in string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('d', '\\d'))
      expect(reports.length).toBe(1)
    })

    test('reports for unnecessary escape \\e', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('e', '\\e'))
      expect(reports.length).toBe(1)
    })

    test('reports for unnecessary escape \\g', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('g', '\\g'))
      expect(reports.length).toBe(1)
    })

    test('reports for unnecessary escape \\h', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('h', '\\h'))
      expect(reports.length).toBe(1)
    })

    test('reports for unnecessary escape \\i', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('i', '\\i'))
      expect(reports.length).toBe(1)
    })

    test('reports for unnecessary escape \\j', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('j', '\\j'))
      expect(reports.length).toBe(1)
    })

    test('reports for unnecessary escape \\k', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('k', '\\k'))
      expect(reports.length).toBe(1)
    })

    test('reports for unnecessary escape \\l', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('l', '\\l'))
      expect(reports.length).toBe(1)
    })

    test('reports for unnecessary escape \\m', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('m', '\\m'))
      expect(reports.length).toBe(1)
    })

    test('reports for unnecessary escape \\o', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('o', '\\o'))
      expect(reports.length).toBe(1)
    })

    test('reports for unnecessary escape \\p', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('p', '\\p'))
      expect(reports.length).toBe(1)
    })

    test('reports for unnecessary escape \\q', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('q', '\\q'))
      expect(reports.length).toBe(1)
    })

    test('reports for unnecessary escape \\s', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('s', '\\s'))
      expect(reports.length).toBe(1)
    })

    test('reports for unnecessary escape \\w', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('w', '\\w'))
      expect(reports.length).toBe(1)
    })

    test('reports for unnecessary escape \\y', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('y', '\\y'))
      expect(reports.length).toBe(1)
    })

    test('reports for unnecessary escape \\z', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('z', '\\z'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "Unnecessary escape character"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('a', '\\a'))
      expect(reports[0].message).toContain('Unnecessary escape character')
    })

    test('report message includes the escaped character', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('a', '\\a'))
      expect(reports[0].message).toContain('\\a')
    })

    test('report message mentions "does not need to be escaped"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('a', '\\a'))
      expect(reports[0].message).toContain('does not need to be escaped')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('a', '\\a'))
      expect(reports[0].message).toBe(
        'Unnecessary escape character: \\a. This character does not need to be escaped.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('a', '\\a'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('a', '\\a'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input StringLiteral node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      const node = makeStringNode('a', '\\a')
      visitor.StringLiteral(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports for unnecessary escape in longer string "hello\\aworld"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('helloaworld', 'hello\\aworld'))
      expect(reports.length).toBe(1)
    })

    test('reports only once per string even with multiple unnecessary escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('abc', '\\a\\b\\c'))
      expect(reports.length).toBe(1)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('a', '\\a', 5, 10, 5, 15))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('a', '\\a'))
      visitor.StringLiteral(makeStringNode('c', '\\c'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('a', '\\a'))
      visitor.StringLiteral(makeStringNode('d', '\\d'))
      const msg0 = reports[0].message.replace('\\a', 'X')
      const msg1 = reports[1].message.replace('\\d', 'X')
      expect(msg0.replace(/\\d/, 'X')).toBe(msg1.replace(/\\a/, 'X'))
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (35) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for string without escapes', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('abc', 'abc'))
      expect(reports.length).toBe(0)
    })

    test('does not report for valid escape \\n', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('\n', '\\n'))
      expect(reports.length).toBe(0)
    })

    test('does not report for valid escape \\t', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('\t', '\\t'))
      expect(reports.length).toBe(0)
    })

    test('does not report for valid escape \\r', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('\r', '\\r'))
      expect(reports.length).toBe(0)
    })

    test('does not report for valid escape \\\\', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('\\', '\\\\'))
      expect(reports.length).toBe(0)
    })

    test("does not report for valid escape \\'", () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode("'", "\\'"))
      expect(reports.length).toBe(0)
    })

    test('does not report for valid escape \\"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('"', '\\"'))
      expect(reports.length).toBe(0)
    })

    test('does not report for valid escape \\b', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('\b', '\\b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for valid escape \\f', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('\f', '\\f'))
      expect(reports.length).toBe(0)
    })

    test('does not report for valid escape \\v', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('\v', '\\v'))
      expect(reports.length).toBe(0)
    })

    test('does not report for valid escape \\0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('\0', '\\0'))
      expect(reports.length).toBe(0)
    })

    test('does not report for valid escape \\x', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('\x41', '\\x41'))
      expect(reports.length).toBe(0)
    })

    test('does not report for valid escape \\u', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('\u0041', '\\u0041'))
      expect(reports.length).toBe(0)
    })

    test('does not report for valid escape \\$', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('$', '\\$'))
      expect(reports.length).toBe(0)
    })

    test('does not report for valid escape \\/', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('/', '\\/'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      expect(() => visitor.StringLiteral(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      expect(() => visitor.StringLiteral(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      expect(() => visitor.StringLiteral({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      expect(() => visitor.StringLiteral(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      expect(() => visitor.StringLiteral(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      expect(() => visitor.StringLiteral('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      expect(() => visitor.StringLiteral([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for StringLiteral without value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral({ type: 'StringLiteral', raw: '\\a', loc: makeLoc(1, 0, 1, 4) })
      expect(reports.length).toBe(0)
    })

    test('does not report for StringLiteral without raw property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral({ type: 'StringLiteral', value: 'a', loc: makeLoc(1, 0, 1, 4) })
      expect(reports.length).toBe(0)
    })

    test('does not report for StringLiteral with empty value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral({ type: 'StringLiteral', value: '', raw: '', loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for StringLiteral with non-string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral({ type: 'StringLiteral', value: 123, raw: '\\a', loc: makeLoc(1, 0, 1, 4) })
      expect(reports.length).toBe(0)
    })

    test('does not report for StringLiteral with non-string raw', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral({ type: 'StringLiteral', value: 'a', raw: 123, loc: makeLoc(1, 0, 1, 4) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral({ type: 'MemberExpression', object: {}, property: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for valid escape in longer string "hello\\nworld"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('hello\nworld', 'hello\\nworld'))
      expect(reports.length).toBe(0)
    })

    test('does not report for valid escape \\\\ in string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('a\\b', 'a\\\\b'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with only normal characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('hello world', 'hello world'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryEscapeRule.create(ctx1)
      const visitor2 = noUnnecessaryEscapeRule.create(ctx2)
      visitor1.StringLiteral(makeStringNode('a', '\\a'))
      visitor2.StringLiteral(makeStringNode('abc', 'abc'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('a', '\\a'))
      visitor.StringLiteral(makeStringNode('abc', 'abc'))
      visitor.StringLiteral(makeStringNode('c', '\\c'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      const node = { type: 'StringLiteral', value: 'a', raw: '\\a' }
      visitor.StringLiteral(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      const node = { type: 'StringLiteral', value: 'a', raw: '\\a' }
      visitor.StringLiteral(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('\n', '\\n'))
      visitor.StringLiteral(makeStringNode('a', '\\a'))
      visitor.StringLiteral(makeStringNode('abc', 'abc'))
      visitor.StringLiteral(makeStringNode('c', '\\c'))
      visitor.StringLiteral(makeStringNode('\\', '\\\\'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryEscapeRule.create(context)
      const visitor2 = noUnnecessaryEscapeRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryEscapeRule.meta
      const meta2 = noUnnecessaryEscapeRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('a', '\\a'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      const node = {
        type: 'StringLiteral',
        value: 'a',
        raw: '\\a',
        loc: makeLoc(1, 0, 1, 5),
        range: [0, 5],
        extra: true,
      }
      visitor.StringLiteral(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral({ type: 'StringLiteral', value: 'a', raw: '\\a', loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral({ type: 'StringLiteral', value: 'a', raw: '\\a', loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      const node = makeStringNode('a', '\\a')
      visitor.StringLiteral(node)
      visitor.StringLiteral(node)
      visitor.StringLiteral(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryEscapeRule).toBeDefined()
      expect(typeof noUnnecessaryEscapeRule.create).toBe('function')
      expect(typeof noUnnecessaryEscapeRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral({ type: 'StringLiteral', value: 'a', raw: '\\a', loc: makeLoc(1, 0, 1, 5), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('a', '\\a'))
      visitor.StringLiteral(makeStringNode('d', '\\d'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('\\a')
      expect(reports[1].message).toContain('\\d')
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('a', '\\a', 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('does not report when value is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral({ type: 'StringLiteral', value: null, raw: '\\a', loc: makeLoc(1, 0, 1, 4) })
      expect(reports.length).toBe(0)
    })

    test('does not report when raw is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral({ type: 'StringLiteral', value: 'a', raw: null, loc: makeLoc(1, 0, 1, 4) })
      expect(reports.length).toBe(0)
    })

    test('does not report when value property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral({ type: 'StringLiteral', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('reports unnecessary escape after valid escape in same string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('\ta', '\\t\\a'))
      expect(reports.length).toBe(1)
    })

    test('does not report for valid escape followed by normal chars', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEscapeRule.create(context)
      visitor.StringLiteral(makeStringNode('\thello', '\\thello'))
      expect(reports.length).toBe(0)
    })
  })
})

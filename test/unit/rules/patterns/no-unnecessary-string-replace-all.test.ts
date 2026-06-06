import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringReplaceAllRule } from '../../../../src/rules/patterns/no-unnecessary-string-replace-all.js'
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

function makeCallNode(
  object: unknown,
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-replace-all rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringReplaceAllRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringReplaceAllRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringReplaceAllRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringReplaceAllRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringReplaceAllRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning replaceAll', () => {
      const desc = noUnnecessaryStringReplaceAllRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/replaceall/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringReplaceAllRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-string-replace-all.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringReplaceAllRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringReplaceAllRule).toBeDefined()
      expect(noUnnecessaryStringReplaceAllRule.meta).toBeDefined()
      expect(noUnnecessaryStringReplaceAllRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary replaceAll with string pattern', () => {
    test('reports for str.replaceAll("foo", "bar")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'foo' }, { type: 'Literal', value: 'bar' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.replaceAll("a", "b")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.replaceAll("hello world", "goodbye")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'hello world' }, { type: 'Literal', value: 'goodbye' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.replaceAll("", "replacement") — empty string pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: '' }, { type: 'Literal', value: 'replacement' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.replaceAll("x", "y")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'replaceAll', [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 'y' }]))
      expect(reports.length).toBe(1)
    })

    test('reports when first arg is Literal with string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'pattern' }, { type: 'Literal', value: 'replacement' }]))
      expect(reports.length).toBe(1)
    })

    test('reports when first arg is Literal with empty string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: '' }, { type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(1)
    })

    test('reports when first arg is Literal with whitespace string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: '   ' }, { type: 'Literal', value: '-' }]))
      expect(reports.length).toBe(1)
    })

    test('reports when first arg is Literal with special characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: '\\n' }, { type: 'Literal', value: '<br>' }]))
      expect(reports.length).toBe(1)
    })

    test('reports when first arg is StringLiteral with only one argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'foo' }]))
      expect(reports.length).toBe(1)
    })

    test('reports when first arg is Literal with string and second arg is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'old' }, { type: 'Identifier', name: 'newValue' }]))
      expect(reports.length).toBe(1)
    })

    test('reports when first arg is StringLiteral and second arg is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'x' }, { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for chained call result.replaceAll("a", "b")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getStr' }, arguments: [] }, 'replaceAll', [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions replaceAll', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'foo' }, { type: 'Literal', value: 'bar' }]))
      expect(reports[0].message).toMatch(/replaceAll/)
    })

    test('report message mentions string pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'foo' }, { type: 'Literal', value: 'bar' }]))
      expect(reports[0].message).toMatch(/string pattern/i)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'foo' }, { type: 'Literal', value: 'bar' }]))
      expect(reports[0].message).toBe(
        'Unnecessary replaceAll with a string pattern. String patterns match once per occurrence. Use replace() instead or confirm multiple occurrences are expected.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 'y' }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 'y' }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 'y' }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 'y' }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'c' }, { type: 'Literal', value: 'd' }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'c' }, { type: 'Literal', value: 'd' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for str.replaceAll with StringLiteral and three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }, { type: 'Literal', value: 'extra' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for nested member expression object with StringLiteral first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } }, property: { type: 'Identifier', name: 'c' } }, 'replaceAll', [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 'y' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for StringLiteral pattern with unicode content', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'text' }, 'replaceAll', [{ type: 'Literal', value: '🎉' }, { type: 'Literal', value: '🎊' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for Literal with string value and regex-like content', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: '[abc]' }, { type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 'y' }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Literal with long string value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      const longStr = 'a'.repeat(100)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: longStr }, { type: 'Literal', value: 'b' }]))
      expect(reports.length).toBe(1)
    })

    test('reports when first arg is StringLiteral with single character', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [{ type: 'Literal', value: ',' }, { type: 'Literal', value: ';' }]))
      expect(reports.length).toBe(1)
    })

    test('reports when second arg is also a string Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [{ type: 'Literal', value: 'foo' }, { type: 'Literal', value: 'bar' }]))
      expect(reports.length).toBe(1)
    })

    test('reports regardless of the second argument type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'replaceAll', [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (38) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.replaceAll(/pattern/g, "replacement") — regex literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'RegExpLiteral', pattern: 'pattern', flags: 'g' }, { type: 'Literal', value: 'replacement' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replaceAll(/abc/, "x") — regex without g flag', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: /abc/ }, { type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replaceAll(regexVar, "replacement") — Identifier first arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Identifier', name: 'regexVar' }, { type: 'Literal', value: 'replacement' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.replace("foo", "bar") — using replace, not replaceAll', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [{ type: 'Literal', value: 'foo' }, { type: 'Literal', value: 'bar' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.match("pattern") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [{ type: 'Literal', value: 'pattern' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.search("pattern") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [{ type: 'Literal', value: 'pattern' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.split("pattern") — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [{ type: 'Literal', value: 'pattern' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for fn("arg") — not a member expression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [{ type: 'Literal', value: 'arg' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'replaceAll' },
        },
        arguments: [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 'y' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "replace" (not "replaceAll")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 'y' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "replaceall" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceall', [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 'y' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "REPLACEALL" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'REPLACEALL', [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 'y' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when no arguments provided', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll'))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is a number Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 123 }, { type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is a boolean Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: true }, { type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is null Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: null }, { type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is a regex Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: /test/g }, { type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'pattern' } }, { type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getPattern' }, arguments: [] }, { type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is a TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'TemplateLiteral', quasis: [], expressions: [] }, { type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [{ type: 'Literal', value: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [{ type: 'Literal', value: 'x' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [undefined]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [null]))
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, { type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replaceAll' },
        },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringReplaceAllRule.create(ctx1)
      const visitor2 = noUnnecessaryStringReplaceAllRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Identifier', name: 'regex' }, { type: 'Literal', value: 'b' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Identifier', name: 'regex' }, { type: 'Literal', value: 'b' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'c' }, { type: 'Literal', value: 'd' }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replaceAll' },
        },
        arguments: [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 'y' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replaceAll' },
        },
        arguments: [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 'y' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: /regex/g }, { type: 'Literal', value: 'b' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Identifier', name: 'pat' }, { type: 'Literal', value: 'b' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'c' }, { type: 'Literal', value: 'd' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringReplaceAllRule.create(context)
      const visitor2 = noUnnecessaryStringReplaceAllRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringReplaceAllRule.meta
      const meta2 = noUnnecessaryStringReplaceAllRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replaceAll' },
        },
        arguments: [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 'y' }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replaceAll' },
        },
        arguments: [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 'y' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replaceAll' },
        },
        arguments: [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 'y' }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 'y' }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringReplaceAllRule).toBeDefined()
      expect(typeof noUnnecessaryStringReplaceAllRule.create).toBe('function')
      expect(typeof noUnnecessaryStringReplaceAllRule.meta).toBe('object')
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 'y' }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'replaceAll' },
        },
        arguments: [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 'y' }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringReplaceAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replaceAll', [{ type: 'Literal', value: 'c' }, { type: 'Literal', value: 'd' }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryBtoaRule } from '../../../../src/rules/patterns/no-unnecessary-btoa.js'
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
    getSource: () => 'btoa("SGVsbG8=")',
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
  argValue: string,
  calleeName = 'btoa',
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: [{ type: 'Literal', value: argValue }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-btoa rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryBtoaRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryBtoaRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryBtoaRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryBtoaRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryBtoaRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning btoa', () => {
      const desc = noUnnecessaryBtoaRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toContain('btoa')
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryBtoaRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-btoa',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryBtoaRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryBtoaRule).toBeDefined()
      expect(noUnnecessaryBtoaRule.meta).toBeDefined()
      expect(noUnnecessaryBtoaRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY BTOA (25) =====

  describe('positive cases — reports unnecessary btoa', () => {
    test('reports btoa("SGVsbG8=") — "Hello" base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8='))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("d29ybGQ=") — "world" base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('d29ybGQ='))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("AQID") — valid base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('AQID'))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("AA==") — single null byte base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('AA=='))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("AAAA") — valid base64 no padding', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('AAAA'))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("AAAAAA==") — valid base64 with padding', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('AAAAAA=='))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("Zm9v") — "foo" base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('Zm9v'))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("YmFy") — "bar" base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('YmFy'))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("YXNkZg==") — "asdf" base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('YXNkZg=='))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("dGVzdA==") — "test" base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('dGVzdA=='))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("SGVsbG8gV29ybGQ=") — "Hello World" base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8gV29ybGQ='))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("ZW1haWw=") — valid base64 with padding', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('ZW1haWw='))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("QQ==") — "A" base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('QQ=='))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("YQ==") — "a" base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('YQ=='))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("MTIz") — "123" base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('MTIz'))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("Ly8=") — "//" base64 with slash and padding', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('Ly8='))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("Kys=") — "++" base64 with plus chars', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('Kys='))
      expect(reports.length).toBe(1)
    })

    test('reports with custom loc values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8=', 'btoa', 5, 10, 5, 25))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports when node has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'btoa' },
        arguments: [{ type: 'Literal', value: 'SGVsbG8=' }],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports btoa("YWJj") — "abc" base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('YWJj'))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("eHl6") — "xyz" base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('eHl6'))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("MTIzNDU2") — "123456" base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('MTIzNDU2'))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("Zm9vYmFy") — "foobar" base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('Zm9vYmFy'))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("Tm9uZQ==") — "None" base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('Tm9uZQ=='))
      expect(reports.length).toBe(1)
    })

    test('reports btoa("QGV4YW1wbGU=") — "@example" base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('QGV4YW1wbGU='))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message mentions unnecessary btoa', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8='))
      expect(reports[0].message.toLowerCase()).toContain('unnecessary')
    })

    test('report message mentions btoa', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8='))
      expect(reports[0].message).toContain('btoa')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8='))
      expect(reports[0].message).toBe(
        'Unnecessary btoa() call. The string appears to already be base64-encoded.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8='))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8='))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      const node = makeCallNode('SGVsbG8=')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8=', 'btoa', 5, 10, 5, 15))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8='))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8='))
      visitor.CallExpression(makeCallNode('d29ybGQ='))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8='))
      visitor.CallExpression(makeCallNode('d29ybGQ='))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('single report per btoa call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8='))
      expect(reports.length).toBe(1)
    })

    test('multiple violations each report once', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8='))
      visitor.CallExpression(makeCallNode('Zm9v'))
      visitor.CallExpression(makeCallNode('YmFy'))
      expect(reports.length).toBe(3)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8=', 'btoa', 10, 4, 10, 12))
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('report message contains "base64"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8='))
      expect(reports[0].message.toLowerCase()).toContain('base64')
    })

    test('report message mentions "already"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8='))
      expect(reports[0].message.toLowerCase()).toContain('already')
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report btoa("hello") — plain text not base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('hello'))
      expect(reports.length).toBe(0)
    })

    test('does not report btoa("world") — plain text not base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('world'))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-btoa callee "atob"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8=', 'atob'))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-btoa callee "encode"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8=', 'encode'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for primitive string node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for primitive number node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for 2 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'btoa' },
        arguments: [
          { type: 'Literal', value: 'SGVsbG8=' },
          { type: 'Literal', value: 'extra' },
        ],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for 0 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'btoa' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'btoa' },
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for numeric argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'btoa' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report btoa("!@#$") — invalid base64 chars', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('!@#$'))
      expect(reports.length).toBe(0)
    })

    test('does not report btoa("abc") — valid chars but length not multiple of 4', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('abc'))
      expect(reports.length).toBe(0)
    })

    test('does not report btoa("ab") — valid chars but length not multiple of 4', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('ab'))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type (not CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: {}, property: {} },
        arguments: [{ type: 'Literal', value: 'SGVsbG8=' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when argument has non-Literal type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'btoa' },
        arguments: [{ type: 'Identifier', name: 'someVar' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when argument value is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'btoa' },
        arguments: [{ type: 'Literal', value: null }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report btoa("") — empty string (length 0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode(''))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-base64 string with special chars', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('hello world!'))
      expect(reports.length).toBe(0)
    })

    test('does not report btoa("abcd!") — invalid char at end', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('abcd!'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryBtoaRule.create(ctx1)
      const visitor2 = noUnnecessaryBtoaRule.create(ctx2)
      visitor1.CallExpression(makeCallNode('SGVsbG8='))
      visitor2.CallExpression(makeCallNode('hello'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8='))
      visitor.CallExpression(makeCallNode('hello'))
      visitor.CallExpression(makeCallNode('d29ybGQ='))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'btoa' },
        arguments: [{ type: 'Literal', value: 'SGVsbG8=' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'btoa' },
        arguments: [{ type: 'Literal', value: 'SGVsbG8=' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('hello'))
      visitor.CallExpression(makeCallNode('SGVsbG8='))
      visitor.CallExpression(makeCallNode('world'))
      visitor.CallExpression(makeCallNode('d29ybGQ='))
      visitor.CallExpression(makeCallNode('Zm9v'))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryBtoaRule.create(context)
      const visitor2 = noUnnecessaryBtoaRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryBtoaRule.meta
      const meta2 = noUnnecessaryBtoaRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'btoa' },
        arguments: [{ type: 'Literal', value: 'SGVsbG8=' }],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'btoa' },
        arguments: [{ type: 'Literal', value: 'SGVsbG8=' }],
        loc: {},
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'btoa' },
        arguments: [{ type: 'Literal', value: 'SGVsbG8=' }],
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      const node = makeCallNode('SGVsbG8=')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryBtoaRule).toBeDefined()
      expect(typeof noUnnecessaryBtoaRule.create).toBe('function')
      expect(typeof noUnnecessaryBtoaRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'btoa' },
        arguments: [{ type: 'Literal', value: 'SGVsbG8=' }],
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8='))
      visitor.CallExpression(makeCallNode('d29ybGQ='))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8=', 'btoa', 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('does not report for string matching base64 regex but invalid base64', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      // "====" matches the regex (all padding) but atob will throw
      visitor.CallExpression(makeCallNode('===='))
      expect(reports.length).toBe(0)
    })

    test('does not report for string "!!==" — invalid base64 chars', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('!=='))
      expect(reports.length).toBe(0)
    })

    test('reports when argument Literal has raw property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'btoa' },
        arguments: [{ type: 'Literal', value: 'SGVsbG8=', raw: '"SGVsbG8="' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles callee with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'btoa', loc: makeLoc(1, 0, 1, 4), range: [0, 4] },
        arguments: [{ type: 'Literal', value: 'SGVsbG8=' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('does not report when callee name is "Btoa" (case-sensitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8=', 'Btoa'))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "BTOA" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryBtoaRule.create(context)
      visitor.CallExpression(makeCallNode('SGVsbG8=', 'BTOA'))
      expect(reports.length).toBe(0)
    })
  })
})

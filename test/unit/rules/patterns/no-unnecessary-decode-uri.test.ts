import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryDecodeUriRule } from '../../../../src/rules/patterns/no-unnecessary-decode-uri.js'
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
    getSource: () => 'decodeURI("hello")',
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
  calleeName: string,
  argValue: string,
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

describe('no-unnecessary-decode-uri rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryDecodeUriRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryDecodeUriRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryDecodeUriRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDecodeUriRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryDecodeUriRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning decode', () => {
      const desc = noUnnecessaryDecodeUriRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/decode/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryDecodeUriRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-decode-uri',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryDecodeUriRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryDecodeUriRule).toBeDefined()
      expect(noUnnecessaryDecodeUriRule.meta).toBeDefined()
      expect(noUnnecessaryDecodeUriRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY DECODE (25) =====

  describe('positive cases — reports unnecessary decode', () => {
    test('reports for decodeURI("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello'))
      expect(reports.length).toBe(1)
    })

    test('reports for decodeURI("world")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'world'))
      expect(reports.length).toBe(1)
    })

    test('reports for decodeURIComponent("test")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURIComponent', 'test'))
      expect(reports.length).toBe(1)
    })

    test('reports for decodeURI("plainstring")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'plainstring'))
      expect(reports.length).toBe(1)
    })

    test('reports for decodeURIComponent("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURIComponent', 'hello'))
      expect(reports.length).toBe(1)
    })

    test('reports for decodeURI("abc123")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'abc123'))
      expect(reports.length).toBe(1)
    })

    test('reports for decodeURI("foo bar baz")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'foo bar baz'))
      expect(reports.length).toBe(1)
    })

    test('reports for decodeURI empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for decodeURIComponent empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURIComponent', ''))
      expect(reports.length).toBe(1)
    })

    test('reports for decodeURI("hello-world")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello-world'))
      expect(reports.length).toBe(1)
    })

    test('reports for decodeURIComponent("test_string")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURIComponent', 'test_string'))
      expect(reports.length).toBe(1)
    })

    test('reports for decodeURI("path/to/file")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'path/to/file'))
      expect(reports.length).toBe(1)
    })

    test('reports for decodeURI("already decoded")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'already decoded'))
      expect(reports.length).toBe(1)
    })

    test('reports for decodeURIComponent("normal text")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURIComponent', 'normal text'))
      expect(reports.length).toBe(1)
    })

    test('reports for decodeURI("UPPERCASE")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'UPPERCASE'))
      expect(reports.length).toBe(1)
    })

    test('reports for decodeURIComponent("no-encoding")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURIComponent', 'no-encoding'))
      expect(reports.length).toBe(1)
    })

    test('reports for decodeURI("simple")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'simple'))
      expect(reports.length).toBe(1)
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = makeCallNode('decodeURI', 'hello')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report message contains "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello'))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message includes callee name for decodeURI', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello'))
      expect(reports[0].message).toContain('decodeURI')
    })

    test('report message includes callee name for decodeURIComponent', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURIComponent', 'test'))
      expect(reports[0].message).toContain('decodeURIComponent')
    })

    test('reports only once per call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello'))
      expect(reports.length).toBe(1)
    })

    test('reports with specific loc on the node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello', 5, 10, 5, 30))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('exact message for decodeURI("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello'))
      expect(reports[0].message).toBe(
        'Unnecessary decodeURI() call. The string does not contain encoded sequences.',
      )
    })

    test('exact message for decodeURIComponent("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURIComponent', 'hello'))
      expect(reports[0].message).toBe(
        'Unnecessary decodeURIComponent() call. The string does not contain encoded sequences.',
      )
    })

    test('report loc start line is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello', 7, 2, 7, 22))
      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('report loc start column is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello', 1, 15, 1, 35))
      expect(reports[0].loc?.start.column).toBe(15)
    })

    test('report loc end line is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello', 3, 0, 5, 1))
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('report loc end column is preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello', 1, 0, 1, 42))
      expect(reports[0].loc?.end.column).toBe(42)
    })

    test('report descriptor has message, loc, and node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello'))
      visitor.CallExpression(makeCallNode('decodeURIComponent', 'world'))
      expect(reports.length).toBe(2)
    })

    test('consistent messages for same callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'abc'))
      visitor.CallExpression(makeCallNode('decodeURI', 'def'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('single report per decodeURI call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello'))
      expect(reports.length).toBe(1)
    })

    test('multiple violations accumulate to 3 reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'a'))
      visitor.CallExpression(makeCallNode('decodeURIComponent', 'b'))
      visitor.CallExpression(makeCallNode('decodeURI', 'c'))
      expect(reports.length).toBe(3)
    })

    test('message includes "Unnecessary" prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello'))
      expect(reports[0].message).toMatch(/^Unnecessary/)
    })

    test('message includes "does not contain encoded sequences"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURIComponent', 'test'))
      expect(reports[0].message).toContain('does not contain encoded sequences')
    })

    test('message includes actual callee name used', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURIComponent', 'test'))
      expect(reports[0].message).toContain('decodeURIComponent()')
      expect(reports[0].message).not.toContain('decodeURI()')
    })

    test('decodeURI and decodeURIComponent produce different messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'a'))
      visitor.CallExpression(makeCallNode('decodeURIComponent', 'b'))
      expect(reports[0].message).not.toBe(reports[1].message)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for decodeURI("hello%20world") with encoded space', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello%20world'))
      expect(reports.length).toBe(0)
    })

    test('does not report for decodeURI("%C3%A9") with encoded unicode', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', '%C3%A9'))
      expect(reports.length).toBe(0)
    })

    test('does not report for decodeURIComponent("%20") with percent encoding', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURIComponent', '%20'))
      expect(reports.length).toBe(0)
    })

    test('does not report for decodeURIComponent("hello%20world")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURIComponent', 'hello%20world'))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-decodeURI callee (parseInt)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('parseInt', '42'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report with 2 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'decodeURI' },
        arguments: [
          { type: 'Literal', value: 'hello' },
          { type: 'Literal', value: 'world' },
        ],
        loc: makeLoc(1, 0, 1, 30),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report with 0 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'decodeURI' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 12),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report with boolean argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'decodeURI' },
        arguments: [{ type: 'Literal', value: true }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report with numeric argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'decodeURI' },
        arguments: [{ type: 'Literal', value: 42 }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'decodeURI' },
        arguments: [null],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'decodeURI' },
        arguments: [undefined],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'decodeURI' } },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 25),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong callee name "encodeURI"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', 'hello'))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong callee name "decodeURIC"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURIC', 'hello'))
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong callee name "encodeURIComponent"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURIComponent', 'hello'))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'decodeURI' },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when first arg is Identifier (not Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'decodeURI' },
        arguments: [{ type: 'Identifier', name: 'myVar' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for node type other than CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'decodeURI',
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryDecodeUriRule.create(ctx1)
      const visitor2 = noUnnecessaryDecodeUriRule.create(ctx2)
      visitor1.CallExpression(makeCallNode('decodeURI', 'hello'))
      visitor2.CallExpression(makeCallNode('decodeURI', 'hello%20world'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed valid/invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello'))
      visitor.CallExpression(makeCallNode('decodeURI', 'hello%20world'))
      visitor.CallExpression(makeCallNode('decodeURIComponent', 'test'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'decodeURI' },
        arguments: [{ type: 'Literal', value: 'hello' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'decodeURI' },
        arguments: [{ type: 'Literal', value: 'hello' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello%20world'))
      visitor.CallExpression(makeCallNode('decodeURI', 'hello'))
      visitor.CallExpression(makeCallNode('decodeURI', 'abc123'))
      visitor.CallExpression(makeCallNode('decodeURIComponent', '%C3%A9'))
      visitor.CallExpression(makeCallNode('decodeURI', 'no-encoding'))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryDecodeUriRule.create(context)
      const visitor2 = noUnnecessaryDecodeUriRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryDecodeUriRule.meta
      const meta2 = noUnnecessaryDecodeUriRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'decodeURI' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        flags: 'g',
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'decodeURI' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: {},
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'decodeURI' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = makeCallNode('decodeURI', 'hello')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryDecodeUriRule).toBeDefined()
      expect(typeof noUnnecessaryDecodeUriRule.create).toBe('function')
      expect(typeof noUnnecessaryDecodeUriRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'decodeURI' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 20),
        _parent: {},
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello'))
      visitor.CallExpression(makeCallNode('decodeURIComponent', 'world'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('decodeURI')
      expect(reports[1].message).toContain('decodeURIComponent')
    })

    test('handles node with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'decodeURI' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(2, 4, 2, 24),
        range: [4, 24],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'hello', 10, 4, 10, 24))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(24)
    })

    test('decodeURI and decodeURIComponent can both report in same visitor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', 'abc'))
      visitor.CallExpression(makeCallNode('decodeURIComponent', 'def'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('decodeURI')
      expect(reports[1].message).toContain('decodeURIComponent')
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDecodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'decodeURI' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })
  })
})

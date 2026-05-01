import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryEncodeUriRule } from '../../../../src/rules/patterns/no-unnecessary-encode-uri.js'
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
    getSource: () => 'encodeURI("hello")',
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
  args: unknown[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeLiteralArg(value: string): unknown {
  return { type: 'Literal', value }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-encode-uri rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryEncodeUriRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryEncodeUriRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryEncodeUriRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryEncodeUriRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryEncodeUriRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning encode', () => {
      const desc = noUnnecessaryEncodeUriRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/encode/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryEncodeUriRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-encode-uri',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryEncodeUriRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryEncodeUriRule).toBeDefined()
      expect(noUnnecessaryEncodeUriRule.meta).toBeDefined()
      expect(noUnnecessaryEncodeUriRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY ENCODE (25) =====

  describe('positive cases — reports unnecessary encode', () => {
    test('reports encodeURI("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURI("world")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('world')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURIComponent("test")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURIComponent', [makeLiteralArg('test')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURI("abc")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('abc')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURIComponent("abc")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURIComponent', [makeLiteralArg('abc')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURI("simple")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('simple')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURIComponent("simple")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURIComponent', [makeLiteralArg('simple')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURI("ABCDEFGHIJKLMNOPQRSTUVWXYZ")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('ABCDEFGHIJKLMNOPQRSTUVWXYZ')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURI("0123456789")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('0123456789')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURI("safe_string")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('safe_string')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURIComponent("safe_string")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURIComponent', [makeLiteralArg('safe_string')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURI("path/to/file")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('path/to/file')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURIComponent("helloWorld123")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURIComponent', [makeLiteralArg('helloWorld123')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURI("") (empty string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURIComponent("") (empty string)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURIComponent', [makeLiteralArg('')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURI("hello") with custom loc preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')], 5, 10, 5, 28))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports encodeURI("hello") with extra node properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'encodeURI' },
        arguments: [makeLiteralArg('hello')],
        loc: makeLoc(1, 0, 1, 18),
        range: [0, 18],
        extra: true,
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports encodeURIComponent("test") with extra node properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'encodeURIComponent' },
        arguments: [makeLiteralArg('test')],
        loc: makeLoc(1, 0, 1, 28),
        flags: 'test',
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports encodeURI("hello-world") (hyphen is safe)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello-world')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURIComponent("hello.world") (dot is safe)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURIComponent', [makeLiteralArg('hello.world')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURI("path")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('path')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURIComponent("data")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURIComponent', [makeLiteralArg('data')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURI("uri_test")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('uri_test')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURI("hello") reports exactly once', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')]))
      expect(reports.length).toBe(1)
    })

    test('reports encodeURIComponent("test") reports exactly once', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURIComponent', [makeLiteralArg('test')]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('message contains "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')]))
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('message contains "encodeURI" for encodeURI call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')]))
      expect(reports[0].message).toContain('encodeURI')
    })

    test('message contains "encodeURIComponent" for encodeURIComponent call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURIComponent', [makeLiteralArg('hello')]))
      expect(reports[0].message).toContain('encodeURIComponent')
    })

    test('exact message for encodeURI("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')]))
      expect(reports[0].message).toBe(
        'Unnecessary encodeURI() call. The string does not contain characters that need encoding.',
      )
    })

    test('exact message for encodeURIComponent("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURIComponent', [makeLiteralArg('hello')]))
      expect(reports[0].message).toBe(
        'Unnecessary encodeURIComponent() call. The string does not contain characters that need encoding.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')]))
      expect(reports[0].node).toBeDefined()
    })

    test('report loc values preserved from input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')], 3, 5, 3, 23))
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(23)
    })

    test('report descriptor has message, loc, and node properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulation: two violations across two calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')]))
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('world')]))
      expect(reports.length).toBe(2)
    })

    test('consistent message for same callee across calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')]))
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('world')]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('single report per single call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')]))
      expect(reports.length).toBe(1)
    })

    test('mixed encodeURI/encodeURIComponent violations accumulate', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')]))
      visitor.CallExpression(makeCallNode('encodeURIComponent', [makeLiteralArg('world')]))
      expect(reports.length).toBe(2)
    })

    test('message includes callee name "encodeURI"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')]))
      expect(reports[0].message).toMatch(/encodeURI\(\)/)
    })

    test('message includes callee name "encodeURIComponent"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURIComponent', [makeLiteralArg('hello')]))
      expect(reports[0].message).toMatch(/encodeURIComponent\(\)/)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report encodeURI("hello world") — space needs encoding', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello world')]))
      expect(reports.length).toBe(0)
    })

    test('does not report encodeURI("café") — unicode needs encoding', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('café')]))
      expect(reports.length).toBe(0)
    })

    test('does not report encodeURIComponent("a b") — space needs encoding', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURIComponent', [makeLiteralArg('a b')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'console' }, property: { type: 'Identifier', name: 'log' } },
        arguments: [makeLiteralArg('hello')],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report encodeURI("hello%20world") — % gets encoded', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello%20world')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for primitive string node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for primitive number node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for 2 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello'), makeLiteralArg('world')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 0 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for numeric arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for callee "decodeURI"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURI', [makeLiteralArg('hello')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for callee "decodeURIComponent"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('decodeURIComponent', [makeLiteralArg('hello')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for callee "myFunction"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('myFunction', [makeLiteralArg('hello')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for callee that is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] },
        arguments: [makeLiteralArg('hello')],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for missing callee (null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: null,
        arguments: [makeLiteralArg('hello')],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type (not CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'encodeURI', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type (not CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined arg value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [{ type: 'Literal', value: undefined }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [null]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 3 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('a'), makeLiteralArg('b'), makeLiteralArg('c')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arg with type TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [{ type: 'TemplateLiteral', quasis: [] }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryEncodeUriRule.create(ctx1)
      const visitor2 = noUnnecessaryEncodeUriRule.create(ctx2)
      visitor1.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')]))
      visitor2.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello world')]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly (mixed valid/invalid)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')]))
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello world')]))
      visitor.CallExpression(makeCallNode('encodeURIComponent', [makeLiteralArg('test')]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'encodeURI' },
        arguments: [makeLiteralArg('hello')],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'encodeURI' },
        arguments: [makeLiteralArg('hello')],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello world')]))
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')]))
      visitor.CallExpression(makeCallNode('decodeURI', [makeLiteralArg('test')]))
      visitor.CallExpression(makeCallNode('encodeURIComponent', [makeLiteralArg('test')]))
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('a b')]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryEncodeUriRule.create(context)
      const visitor2 = noUnnecessaryEncodeUriRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryEncodeUriRule.meta
      const meta2 = noUnnecessaryEncodeUriRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'encodeURI' },
        arguments: [makeLiteralArg('hello')],
        loc: makeLoc(1, 0, 1, 18),
        range: [0, 18],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'encodeURI' },
        arguments: [makeLiteralArg('hello')],
        loc: {},
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'encodeURI' },
        arguments: [makeLiteralArg('hello')],
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      const node = makeCallNode('encodeURI', [makeLiteralArg('hello')])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryEncodeUriRule).toBeDefined()
      expect(typeof noUnnecessaryEncodeUriRule.create).toBe('function')
      expect(typeof noUnnecessaryEncodeUriRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'encodeURI' },
        arguments: [makeLiteralArg('hello')],
        loc: makeLoc(1, 0, 1, 18),
        _parent: { type: 'ExpressionStatement' },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')]))
      visitor.CallExpression(makeCallNode('encodeURIComponent', [makeLiteralArg('world')]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('encodeURI')
      expect(reports[1].message).toContain('encodeURIComponent')
    })

    test('node with range alongside loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'encodeURI' },
        arguments: [makeLiteralArg('hello')],
        loc: makeLoc(1, 0, 1, 18),
        range: [0, 18] as [number, number],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with only start in loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'encodeURI' },
        arguments: [makeLiteralArg('hello')],
        loc: { start: { line: 7, column: 3 } },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(7)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('encodeURI', [makeLiteralArg('hello')], 10, 4, 10, 22))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('callee name is case-sensitive ("EncodeURI" does not match)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('EncodeURI', [makeLiteralArg('hello')]))
      expect(reports.length).toBe(0)
    })

    test('handles non-encodeURI Identifier callee ("JSON")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEncodeUriRule.create(context)
      visitor.CallExpression(makeCallNode('JSON', [makeLiteralArg('hello')]))
      expect(reports.length).toBe(0)
    })
  })
})

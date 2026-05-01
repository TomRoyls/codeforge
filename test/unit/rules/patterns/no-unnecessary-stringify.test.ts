import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringifyRule } from '../../../../src/rules/patterns/no-unnecessary-stringify.js'
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
    getSource: () => '',
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

function makeCallExpr(
  calleeName: string,
  args: unknown[],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

describe('no-unnecessary-stringify rule', () => {
  // ===== META TESTS (8) =====

  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringifyRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringifyRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringifyRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringifyRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringifyRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning String or string', () => {
      const desc = noUnnecessaryStringifyRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/string/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringifyRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-stringify',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringifyRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringifyRule).toBeDefined()
      expect(noUnnecessaryStringifyRule.meta).toBeDefined()
      expect(noUnnecessaryStringifyRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (25) =====

  describe('positive cases — reports String() on string literal', () => {
    test('reports String() with string literal argument "hello"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(1)
    })

    test('reports String() with empty string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: '' }]))
      expect(reports.length).toBe(1)
    })

    test('reports String() with single-char string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'a' }]))
      expect(reports.length).toBe(1)
    })

    test('reports String() with multi-word string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'hello world' }]))
      expect(reports.length).toBe(1)
    })

    test('reports String() with string containing special characters', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: '${foo}\n\t' }]))
      expect(reports.length).toBe(1)
    })

    test('reports String() with numeric-string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: '123' }]))
      expect(reports.length).toBe(1)
    })

    test('reports String() with long string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'a'.repeat(200) }]))
      expect(reports.length).toBe(1)
    })

    test('reports String() with unicode string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: '日本語' }]))
      expect(reports.length).toBe(1)
    })

    test('reports String() ignoring extra arguments after first', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'hello' }, { type: 'Literal', value: 'world' }]))
      expect(reports.length).toBe(1)
    })

    test('reports String() with whitespace-only string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: '   ' }]))
      expect(reports.length).toBe(1)
    })

    test('reports String() with string literal "true"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'true' }]))
      expect(reports.length).toBe(1)
    })

    test('reports String() with string literal "null"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'null' }]))
      expect(reports.length).toBe(1)
    })

    test('reports String() with template-like string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'foo bar baz' }]))
      expect(reports.length).toBe(1)
    })

    test('reports String() with punctuation string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: '!@#$%' }]))
      expect(reports.length).toBe(1)
    })

    test('reports String() with url string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'https://example.com' }]))
      expect(reports.length).toBe(1)
    })

    test('report message is exactly "Unnecessary String() call on a string literal."', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'hello' }]))
      expect(reports[0].message).toBe('Unnecessary String() call on a string literal.')
    })

    test('report message contains "String"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'test' }]))
      expect(reports[0].message).toContain('String')
    })

    test('report message contains "string literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'test' }]))
      expect(reports[0].message.toLowerCase()).toContain('string literal')
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'a' }]))
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'b' }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'a' }]))
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'b' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for String() with path-like string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: '/path/to/file' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for String() with emoji string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: '🎉' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for String() with newline string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: '\n' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for String() with tab string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: '\t' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for String() with string literal "undefined"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'undefined' }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'hello' }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'hello' }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report loc start line is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'hello' }], 3, 5, 3, 20))
      expect(reports[0].loc?.start.line).toBe(3)
    })

    test('report loc start column is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'hello' }], 3, 5, 3, 20))
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('report loc end line is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'hello' }], 3, 5, 3, 20))
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('report loc end column is correct', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'hello' }], 3, 5, 3, 20))
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      const node = makeCallExpr('String', [{ type: 'Literal', value: 'hello' }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report has message property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'x' }]))
      expect(reports[0]).toHaveProperty('message')
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'x' }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report message is not empty', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'x' }]))
      expect(reports[0].message.length).toBeGreaterThan(0)
    })

    test('report loc reflects custom node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'x' }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('multiple reports each reference their own node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      const node1 = makeCallExpr('String', [{ type: 'Literal', value: 'a' }])
      const node2 = makeCallExpr('String', [{ type: 'Literal', value: 'b' }])
      visitor.CallExpression(node1)
      visitor.CallExpression(node2)
      expect(reports[0].node).toBe(node1)
      expect(reports[1].node).toBe(node2)
    })

    test('report message does not contain placeholder tokens', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'x' }]))
      expect(reports[0].message).not.toContain('{{')
      expect(reports[0].message).not.toContain('}}')
    })

    test('report message ends with period', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'x' }]))
      expect(reports[0].message.endsWith('.')).toBe(true)
    })

    test('report message contains "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'x' }]))
      expect(reports[0].message).toContain('Unnecessary')
    })
  })

  // ===== NEGATIVE CASES (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for JSON.stringify with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('JSON', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for String() with numeric literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 42 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for String() with boolean literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: true }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for String() with null literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for String() with Identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Identifier', name: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for String() with ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for String() with ArrayExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for String() with CallExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-String non-JSON callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('parseInt', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'foo' }, property: { type: 'Identifier', name: 'bar' } },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for String() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression({})
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      expect(() => visitor.CallExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression with Literal argument having undefined value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: undefined }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for String() with regex literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: /test/ }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for String() with TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringifyRule.create(ctx1)
      const visitor2 = noUnnecessaryStringifyRule.create(ctx2)
      visitor1.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'hello' }]))
      visitor2.CallExpression(makeCallExpr('parseInt', [{ type: 'Literal', value: 'hello' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringifyRule.create(context)
      const visitor2 = noUnnecessaryStringifyRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringifyRule.meta
      const meta2 = noUnnecessaryStringifyRule.meta
      expect(meta1).toBe(meta2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Literal', value: 'hello' }],
      })
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Literal', value: 'hello' }],
      })
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'hello' }]))
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 42 }]))
      visitor.CallExpression(makeCallExpr('JSON', [{ type: 'Literal', value: 'hello' }]))
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'world' }]))
      expect(reports.length).toBe(2)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'a' }]))
      visitor.CallExpression(makeCallExpr('parseInt', [{ type: 'Literal', value: 'a' }]))
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'b' }]))
      expect(reports.length).toBe(2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      const node = makeCallExpr('String', [{ type: 'Literal', value: 'hello' }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringifyRule).toBeDefined()
      expect(typeof noUnnecessaryStringifyRule.create).toBe('function')
      expect(typeof noUnnecessaryStringifyRule.meta).toBe('object')
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'a' }]))
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'b' }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('String() with Literal argument having number value does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('String() with Literal argument having boolean value does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: false }]))
      expect(reports.length).toBe(0)
    })

    test('CallExpression with callee as non-object does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: 'String',
        arguments: [{ type: 'Literal', value: 'hello' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('CallExpression with arguments as non-array does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('CallExpression with first arg as non-object does not report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: ['hello-string'],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringifyRule.create(context)
      visitor.CallExpression(makeCallExpr('String', [{ type: 'Literal', value: 'x' }], 7, 2, 7, 18))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(18)
    })
  })
})

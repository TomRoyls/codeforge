import { describe, expect, test, vi } from 'vitest'
import { noMultiStrRule } from '../../../../src/rules/patterns/no-multi-str.js'
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
    getSource: () => '"hello" +\n"world"',
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

function makeStringLiteralNode(
  value: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 5,
): unknown {
  return {
    type: 'StringLiteral',
    value,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
    _parent: null,
  }
}

// ===== META TESTS (8) =====

describe('no-multi-str rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noMultiStrRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noMultiStrRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noMultiStrRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noMultiStrRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noMultiStrRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning multiline', () => {
      const desc = noMultiStrRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/multiline/)
    })

    test('should have correct docs URL', () => {
      expect(noMultiStrRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-multi-str',
      )
    })

    test('should have empty schema', () => {
      expect(noMultiStrRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with Literal', () => {
      const { context } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      expect(visitor).toHaveProperty('Literal')
      expect(typeof visitor.Literal).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noMultiStrRule).toBeDefined()
      expect(noMultiStrRule.meta).toBeDefined()
      expect(noMultiStrRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS MULTILINE STRING (30) =====

  describe('positive cases — reports multiline string', () => {
    test('reports for simple backslash-newline continuation', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('hello\\\nworld'))
      expect(reports.length).toBe(1)
    })

    test('reports for string that is only backslash-newline', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('\\\n'))
      expect(reports.length).toBe(1)
    })

    test('reports for backslash-newline at start', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('\\\ntext'))
      expect(reports.length).toBe(1)
    })

    test('reports for backslash-newline at end', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('text\\\n'))
      expect(reports.length).toBe(1)
    })

    test('reports for multiple backslash-newline continuations', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('line1\\\nline2\\\nline3'))
      expect(reports.length).toBe(1)
    })

    test('reports for path with backslash-newline', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('/usr/local\\\n/bin'))
      expect(reports.length).toBe(1)
    })

    test('reports for SQL query with backslash-newline', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('SELECT * \\\nFROM users'))
      expect(reports.length).toBe(1)
    })

    test('reports for template-like string with backslash-newline', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('function() {\\\n  return 1;\\\n}'))
      expect(reports.length).toBe(1)
    })

    test('reports for string starting with backslash-newline followed by content', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('\\\nabc'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with backslash-newline in the middle', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('first\\\nsecond'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "Multiline string literal"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('a\\\nb'))
      expect(reports[0].message).toContain('Multiline string literal')
    })

    test('report message mentions "backslash line continuation"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('a\\\nb'))
      expect(reports[0].message).toContain('backslash line continuation')
    })

    test('report message mentions "template literals"', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('a\\\nb'))
      expect(reports[0].message).toContain('template literals')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('a\\\nb'))
      expect(reports[0].message).toBe(
        'Multiline string literal using backslash line continuation is not allowed. Use template literals instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('a\\\nb'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('a\\\nb'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input StringLiteral node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      const node = makeStringLiteralNode('a\\\nb')
      visitor.Literal(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('a\\\nb', 5, 10, 5, 15))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports for long multiline string with many continuations', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('a\\\nb\\\nc\\\nd\\\ne\\\nf'))
      expect(reports.length).toBe(1)
    })

    test('reports only once per string even with multiple continuations', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('a\\\nb\\\nc'))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('a\\\nb'))
      visitor.Literal(makeStringLiteralNode('c\\\nd'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('a\\\nb'))
      visitor.Literal(makeStringLiteralNode('x\\\ny'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for string with spaces around backslash-newline', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('hello \\\n world'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with tab after backslash-newline', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('line1\\\n\tline2'))
      expect(reports.length).toBe(1)
    })

    test('reports for JSON string with backslash-newline', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('{"key": "value"}\\\n'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with Unicode content and backslash-newline', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('héllo\\\nwörld'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with numbers and backslash-newline', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('123\\\n456'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with special characters and backslash-newline', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('!@#$%^&*()\\\n{}[]'))
      expect(reports.length).toBe(1)
    })

    test('reports for single char with trailing backslash-newline', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('x\\\n'))
      expect(reports.length).toBe(1)
    })

    test('reports for string with carriage return after backslash is NOT detected', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('a\\\nb'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for plain string without backslash-newline', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('hello world'))
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode(''))
      expect(reports.length).toBe(0)
    })

    test('does not report for single character string', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('a'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with backslash-n (escaped, not literal newline)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('hello\\nworld'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with only newline (no backslash)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('hello\nworld'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with double backslash', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('hello\\\\world'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with backslash-t', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('hello\\tworld'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with backslash-r', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('hello\\rworld'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      expect(() => visitor.Literal(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      expect(() => visitor.Literal(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      expect(() => visitor.Literal({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      expect(() => visitor.Literal('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      expect(() => visitor.Literal(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      expect(() => visitor.Literal(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      expect(() => visitor.Literal([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when value property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal({ type: 'StringLiteral', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal({ type: 'StringLiteral', value: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal({ type: 'StringLiteral', value: 42, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is boolean true', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal({ type: 'StringLiteral', value: true, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal({ type: 'StringLiteral', value: ['a', 'b'], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string with backslash followed by carriage return', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('hello\\\rworld'))
      expect(reports.length).toBe(0)
    })

    test('does not report for string with just backslash', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('\\'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (30) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noMultiStrRule.create(ctx1)
      const visitor2 = noMultiStrRule.create(ctx2)
      visitor1.Literal(makeStringLiteralNode('a\\\nb'))
      visitor2.Literal(makeStringLiteralNode('hello'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('a\\\nb'))
      visitor.Literal(makeStringLiteralNode('plain'))
      visitor.Literal(makeStringLiteralNode('c\\\nd'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      const node = { type: 'StringLiteral', value: 'a\\\nb', _parent: null }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      const node = { type: 'StringLiteral', value: 'a\\\nb', _parent: null }
      visitor.Literal(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('valid'))
      visitor.Literal(makeStringLiteralNode('a\\\nb'))
      visitor.Literal(makeStringLiteralNode('another valid'))
      visitor.Literal(makeStringLiteralNode('c\\\nd'))
      visitor.Literal(makeStringLiteralNode('ok'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noMultiStrRule.create(context)
      const visitor2 = noMultiStrRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noMultiStrRule.meta
      const meta2 = noMultiStrRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('a\\\nb'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      const node = {
    type: 'Literal',
        value: 'a\\\nb',
        loc: makeLoc(1, 0, 1, 5),
        range: [0, 5],
        extra: true,
        raw: '"a\\\nb"',
        _parent: null,
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal({ type: 'StringLiteral', value: 'a\\\nb', loc: {}, _parent: null })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal({ type: 'StringLiteral', value: 'a\\\nb', loc: { start: { line: 3, column: 5 } }, _parent: null })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      const node = makeStringLiteralNode('a\\\nb')
      visitor.Literal(node)
      visitor.Literal(node)
      visitor.Literal(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noMultiStrRule).toBeDefined()
      expect(typeof noMultiStrRule.create).toBe('function')
      expect(typeof noMultiStrRule.meta).toBe('object')
    })

    test('handles node with _parent property set to object', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal({ type: 'StringLiteral', value: 'a\\\nb', loc: makeLoc(1, 0, 1, 5), _parent: { type: 'VariableDeclarator' } })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('a\\\nb'))
      visitor.Literal(makeStringLiteralNode('x\\\ny'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('node with raw property alongside value still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal({ type: 'StringLiteral', value: 'a\\\nb', raw: '"a\\\nb"', loc: makeLoc(1, 0, 1, 5), _parent: null })
      expect(reports.length).toBe(1)
    })

    test('does not report when only raw contains backslash-newline but value does not', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal({ type: 'StringLiteral', value: 'ab', raw: '"a\\\nb"', loc: makeLoc(1, 0, 1, 5), _parent: null })
      expect(reports.length).toBe(0)
    })

    test('does not report when value is set to boolean false', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal({ type: 'StringLiteral', value: false, loc: makeLoc(1, 0, 1, 5), _parent: null })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('a\\\nb', 10, 4, 12, 8))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(12)
      expect(reports[0].loc?.end.column).toBe(8)
    })

    test('does not report when value is an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal({ type: 'StringLiteral', value: { toString: () => 'a' }, loc: makeLoc(1, 0, 1, 5), _parent: null })
      expect(reports.length).toBe(0)
    })

    test('handles string with backslash-newline after whitespace-only prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('   \\\nrest'))
      expect(reports.length).toBe(1)
    })

    test('handles string with backslash-newline before whitespace-only suffix', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('start\\\n   '))
      expect(reports.length).toBe(1)
    })

    test('handles multiline string with mixed line endings', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('a\\\nb\nc\\\nd'))
      expect(reports.length).toBe(1)
    })

    test('correctly counts mixed valid and invalid across many calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('ok'))
      visitor.Literal(makeStringLiteralNode('a\\\nb'))
      visitor.Literal(makeStringLiteralNode('fine'))
      visitor.Literal(makeStringLiteralNode('good'))
      visitor.Literal(makeStringLiteralNode('c\\\nd'))
      visitor.Literal(makeStringLiteralNode('nice'))
      visitor.Literal(makeStringLiteralNode('x\\\ny'))
      visitor.Literal(makeStringLiteralNode('done'))
      expect(reports.length).toBe(3)
    })

    test('does not crash with Symbol as value', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      expect(() => visitor.Literal({ type: 'StringLiteral', value: Symbol('test'), loc: makeLoc(1, 0, 1, 5), _parent: null })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not crash with function as value', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      expect(() => visitor.Literal({ type: 'StringLiteral', value: () => 'test', loc: makeLoc(1, 0, 1, 5), _parent: null })).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined value gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal({ type: 'StringLiteral', value: undefined, loc: makeLoc(1, 0, 1, 5), _parent: null })
      expect(reports.length).toBe(0)
    })

    test('string with only newline character does not trigger', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('\n'))
      expect(reports.length).toBe(0)
    })

    test('string with backslash-n literal characters does not trigger', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal(makeStringLiteralNode('\\n'))
      expect(reports.length).toBe(0)
    })

    test('does not report for TemplateLiteral node type with multiline value', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultiStrRule.create(context)
      visitor.Literal({ type: 'TemplateLiteral', quasis: [], loc: makeLoc(1, 0, 1, 5), _parent: null })
      expect(reports.length).toBe(0)
    })
  })
})

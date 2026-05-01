import { describe, expect, test, vi } from 'vitest'
import { noMultipleEmptyLinesRule } from '../../../../src/rules/patterns/no-multiple-empty-lines.js'
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

function createMockContext(source: string = 'const x = 1;'): { context: RuleContext; reports: ReportDescriptor[] } {
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
    getSource: () => source,
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

function makeProgramNode(
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 5,
): unknown {
  return {
    type: 'Program',
    body: [],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-multiple-empty-lines rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noMultipleEmptyLinesRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noMultipleEmptyLinesRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noMultipleEmptyLinesRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noMultipleEmptyLinesRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noMultipleEmptyLinesRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning empty lines', () => {
      const desc = noMultipleEmptyLinesRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/empty/)
    })

    test('should have correct docs URL', () => {
      expect(noMultipleEmptyLinesRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-multiple-empty-lines',
      )
    })

    test('should have empty schema', () => {
      expect(noMultipleEmptyLinesRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with Program', () => {
      const { context } = createMockContext()
      const visitor = noMultipleEmptyLinesRule.create(context)
      expect(visitor).toHaveProperty('Program')
      expect(typeof visitor.Program).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noMultipleEmptyLinesRule).toBeDefined()
      expect(noMultipleEmptyLinesRule.meta).toBeDefined()
      expect(noMultipleEmptyLinesRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS 3+ EMPTY LINES (30) =====

  describe('positive cases — reports 3+ consecutive empty lines', () => {
    test('reports for exactly 3 consecutive empty lines', () => {
      const source = 'const x = 1;\n\n\n\nconst y = 2;'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('reports for exactly 4 consecutive empty lines', () => {
      const source = 'const x = 1;\n\n\n\n\nconst y = 2;'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('reports for exactly 5 consecutive empty lines', () => {
      const source = 'a\n\n\n\n\n\nb'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('reports for exactly 10 consecutive empty lines', () => {
      const source = 'a\n\n\n\n\n\n\n\n\n\n\nb'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('reports for 3 empty lines at end of file', () => {
      const source = 'const x = 1;\n\n\n\n'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('reports for 3 empty lines at start of file', () => {
      const source = '\n\n\n\nconst x = 1;'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('report message is exactly as defined in rule source', () => {
      const source = 'a\n\n\n\nb'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].message).toBe('More than 2 empty lines are not allowed.')
    })

    test('report message mentions empty lines', () => {
      const source = 'a\n\n\n\nb'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].message.toLowerCase()).toContain('empty')
    })

    test('report has loc property', () => {
      const source = 'a\n\n\n\nb'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const source = 'a\n\n\n\nb'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input Program node', () => {
      const source = 'a\n\n\n\nb'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      const node = makeProgramNode()
      visitor.Program(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc start line is correct for 3 empty lines after line 1', () => {
      const source = 'const x = 1;\n\n\n\nconst y = 2;'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      // lines: 0=code, 1=empty, 2=empty, 3=empty (index 3 -> line 4)
      expect(reports[0].loc?.start.line).toBe(4)
    })

    test('reports multiple violations for two separate groups of 3+ empty lines', () => {
      const source = 'a\n\n\n\nb\n\nc\n\n\n\nd'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
    })

    test('reports for whitespace-only lines treated as empty', () => {
      const source = 'a\n   \n\t\n  \nb'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('accumulates reports across multiple Program calls', () => {
      const source1 = 'a\n\n\n\nb'
      const { context, reports } = createMockContext(source1)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
    })

    test('reports for file that is all empty lines (5 lines)', () => {
      const source = '\n\n\n\n\n'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('reports for 6 consecutive empty lines producing multiple reports', () => {
      const source = 'a\n\n\n\n\n\n\nb'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      // 6 empty lines -> reports at emptyCount 3,4,5,6 = 4 reports
      expect(reports.length).toBe(4)
    })

    test('report loc has start column 0', () => {
      const source = 'a\n\n\n\nb'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('report loc has end column 0', () => {
      const source = 'a\n\n\n\nb'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('reports for 3 empty lines in middle of long file', () => {
      const source = 'line1\nline2\n\n\n\nline3\nline4'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('reports for CRLF-style line endings still counted as empty', () => {
      const source = 'a\r\n\r\n\r\n\r\nb'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      // split by \n leaves \r on lines; trim() still gives ''
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('reports for lines with only spaces as empty', () => {
      const source = 'a\n    \n    \n    \nb'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('reports for lines with only tabs as empty', () => {
      const source = 'a\n\t\t\n\t\t\n\t\t\nb'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('all reports have the same message format', () => {
      const source = 'a\n\n\n\nb\n\n\n\nc'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      for (const report of reports) {
        expect(report.message).toBe('More than 2 empty lines are not allowed.')
      }
    })

    test('reports for single code line followed by 3 empty lines', () => {
      const source = 'x\n\n\n\n'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('reports for source with only code and 3 blanks at end', () => {
      const source = 'const a = 1;\nconst b = 2;\n\n\n\n'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('report descriptor has all expected properties', () => {
      const source = 'a\n\n\n\nb'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for 8 consecutive empty lines', () => {
      const source = 'a\n\n\n\n\n\n\n\n\nb'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(6)
    })

    test('reports once for exactly 3 consecutive empty lines', () => {
      const source = 'a\n\n\n\nb'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('reports twice for exactly 4 consecutive empty lines', () => {
      const source = 'a\n\n\n\n\nb'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
    })

    test('reports for 3 empty lines between functions', () => {
      const source = 'function a() {}\n\n\n\nfunction b() {}'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for source with no empty lines', () => {
      const source = 'const x = 1;\nconst y = 2;'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for source with exactly 1 empty line', () => {
      const source = 'const x = 1;\n\nconst y = 2;'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for source with exactly 2 consecutive empty lines', () => {
      const source = 'const x = 1;\n\n\nconst y = 2;'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for single line source', () => {
      const source = 'const x = 1;'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for empty string source', () => {
      const source = ''
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for source with only code lines', () => {
      const source = 'a\nb\nc\nd\ne'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for multiple single empty lines separated by code', () => {
      const source = 'a\n\nb\n\nc\n\nd'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for source with one empty line at end', () => {
      const source = 'const x = 1;\n'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for source with two empty lines at end', () => {
      const source = 'const x = 1;\n\n'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for two empty lines at start', () => {
      const source = '\n\nconst x = 1;'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for two groups of 2 empty lines separated by code', () => {
      const source = 'a\n\n\nb\n\n\nc'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultipleEmptyLinesRule.create(context)
      expect(() => visitor.Program(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultipleEmptyLinesRule.create(context)
      expect(() => visitor.Program(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultipleEmptyLinesRule.create(context)
      expect(() => visitor.Program({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultipleEmptyLinesRule.create(context)
      expect(() => visitor.Program('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultipleEmptyLinesRule.create(context)
      expect(() => visitor.Program(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultipleEmptyLinesRule.create(context)
      expect(() => visitor.Program(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultipleEmptyLinesRule.create(context)
      expect(() => visitor.Program([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program({ type: 'FunctionDeclaration', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BlockStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program({ type: 'BlockStatement', body: [], loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (30) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext('a\n\n\n\nb')
      const { context: ctx2, reports: rep2 } = createMockContext('a\nb')
      const visitor1 = noMultipleEmptyLinesRule.create(ctx1)
      const visitor2 = noMultipleEmptyLinesRule.create(ctx2)
      visitor1.Program(makeProgramNode())
      visitor2.Program(makeProgramNode())
      expect(rep1.length).toBeGreaterThanOrEqual(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext('a\n\n\n\nb')
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext('a\n\n\n\nb')
      const visitor = noMultipleEmptyLinesRule.create(context)
      const node = { type: 'Program', body: [] }
      visitor.Program(node)
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('node with extra properties still reports', () => {
      const { context, reports } = createMockContext('a\n\n\n\nb')
      const visitor = noMultipleEmptyLinesRule.create(context)
      const node = {
        type: 'Program',
        body: [],
        loc: makeLoc(1, 0, 5, 0),
        range: [0, 20],
        extra: true,
      }
      visitor.Program(node)
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext('a\n\n\n\nb')
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program({ type: 'Program', body: [], loc: {} })
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext('a\n\n\n\nb')
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program({ type: 'Program', body: [], loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext('a\n\n\n\nb')
      const visitor = noMultipleEmptyLinesRule.create(context)
      // Source has 3 empty lines -> 1 report
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noMultipleEmptyLinesRule.create(context)
      const visitor2 = noMultipleEmptyLinesRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noMultipleEmptyLinesRule.meta
      const meta2 = noMultipleEmptyLinesRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report loc values are preserved from source line counting', () => {
      const source = 'line1\n\n\n\nline2'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      // line index 3 -> line 4, column 0
      expect(reports[0].loc?.start.line).toBe(4)
      expect(reports[0].loc?.start.column).toBe(0)
      expect(reports[0].loc?.end.line).toBe(4)
      expect(reports[0].loc?.end.column).toBe(0)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext('a\n\n\n\nb')
      const visitor = noMultipleEmptyLinesRule.create(context)
      const node = makeProgramNode()
      visitor.Program(node)
      visitor.Program(node)
      visitor.Program(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noMultipleEmptyLinesRule).toBeDefined()
      expect(typeof noMultipleEmptyLinesRule.create).toBe('function')
      expect(typeof noMultipleEmptyLinesRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext('a\n\n\n\nb')
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program({ type: 'Program', body: [], loc: makeLoc(1, 0, 5, 0), _parent: {} })
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('reports two violations with correct individual messages', () => {
      const source = 'a\n\n\n\nb\n\n\n\nc'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles source that is only newlines', () => {
      const source = '\n\n\n\n\n'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('handles source with single newline', () => {
      const source = '\n'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('handles source with two newlines (3 lines, 3 empty)', () => {
      const source = '\n\n'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('handles source with three newlines (3 empty lines)', () => {
      const source = '\n\n\n'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('empty line count resets after non-empty line', () => {
      const source = 'a\n\nb\n\n\nc'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('empty line count resets correctly between groups', () => {
      const source = 'a\n\n\n\nb\n\nc\n\n\n\nd'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
    })

    test('report for line at correct 1-indexed position', () => {
      const source = 'a\nb\n\n\n\nc'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      // lines: 0=a, 1=b, 2=empty, 3=empty, 4=empty (index 4 -> line 5)
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('handles source with trailing newline after code', () => {
      const source = 'const x = 1;\n'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('handles source with code on every line', () => {
      const source = 'a\nb\nc\nd\ne\nf'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('handles very long file with no violations', () => {
      const lines = Array(100).fill('code')
      const source = lines.join('\n')
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('handles file with alternating blank and code lines', () => {
      const source = 'a\n\nb\n\nc\n\nd\n\ne'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(0)
    })

    test('handles file with one violation preceded by many valid lines', () => {
      const lines = Array(50).fill('code')
      lines.push('', '', '', '')
      lines.push('final')
      const source = lines.join('\n')
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBe(2)
    })

    test('handles node with _parent and still reports', () => {
      const { context, reports } = createMockContext('a\n\n\n\nb')
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program({ type: 'Program', body: [], loc: makeLoc(1, 0, 5, 0), _parent: null })
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('handles source with mixed whitespace and empty lines exceeding threshold', () => {
      const source = 'a\n  \n  \n  \nb'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('handles source where empty lines have varying whitespace', () => {
      const source = 'a\n \n  \n\t\nb'
      const { context, reports } = createMockContext(source)
      const visitor = noMultipleEmptyLinesRule.create(context)
      visitor.Program(makeProgramNode())
      expect(reports.length).toBeGreaterThanOrEqual(1)
    })
  })
})

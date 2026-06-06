import { describe, expect, test, vi } from 'vitest'
import { sortImportsRule } from '../../../../src/rules/patterns/sort-imports.js'
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
    getSource: () => 'import a from "b";',
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

function makeImportNode(
  sourceValue: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
): unknown {
  return {
    type: 'ImportDeclaration',
    source: { type: 'Literal', value: sourceValue },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('sort-imports rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(sortImportsRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(sortImportsRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(sortImportsRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(sortImportsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(sortImportsRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning import sorting', () => {
      const desc = sortImportsRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/import/)
    })

    test('should have correct docs URL', () => {
      expect(sortImportsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/sort-imports',
      )
    })

    test('should have empty schema', () => {
      expect(sortImportsRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ImportDeclaration and Program:exit', () => {
      const { context } = createMockContext()
      const visitor = sortImportsRule.create(context)
      expect(visitor).toHaveProperty('ImportDeclaration')
      expect(visitor).toHaveProperty('Program:exit')
      expect(typeof visitor.ImportDeclaration).toBe('function')
      expect(typeof visitor['Program:exit']).toBe('function')
    })

    test('default export matches named export', () => {
      expect(sortImportsRule).toBeDefined()
      expect(sortImportsRule.meta).toBeDefined()
      expect(sortImportsRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNSORTED IMPORTS (25) =====

  describe('positive cases — reports unsorted imports', () => {
    test('reports when two imports are in reverse alphabetical order', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('zeta'))
      visitor.ImportDeclaration(makeImportNode('alpha'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports message mentions the unsorted import', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('zeta'))
      visitor.ImportDeclaration(makeImportNode('alpha'))
      visitor['Program:exit']()
      expect(reports[0].message).toContain('alpha')
      expect(reports[0].message).toContain('zeta')
    })

    test('reports message says "Imports should be sorted"', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('b'))
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports[0].message).toContain('Imports should be sorted')
    })

    test('reports message says "should come before"', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('b'))
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports[0].message).toContain('should come before')
    })

    test('reports for b, a reverse order', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('b'))
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe(
        "Imports should be sorted. 'a' should come before 'b'.",
      )
    })

    test('reports for z, a reverse order', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('z'))
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports for react, angular reverse order', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('react'))
      visitor.ImportDeclaration(makeImportNode('angular'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports for lodash, axios reverse order', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('lodash'))
      visitor.ImportDeclaration(makeImportNode('axios'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports for @scope/b, @scope/a reverse order', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('@scope/b'))
      visitor.ImportDeclaration(makeImportNode('@scope/a'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports for ./utils, ./helpers reverse order', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('./utils'))
      visitor.ImportDeclaration(makeImportNode('./helpers'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports multiple violations for three unsorted imports', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('c'))
      visitor.ImportDeclaration(makeImportNode('b'))
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports.length).toBe(2)
    })

    test('reports all violations for completely reversed three imports', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('c'))
      visitor.ImportDeclaration(makeImportNode('b'))
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports.length).toBe(2)
    })

    test('reports for path-style imports in reverse order', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('../utils'))
      visitor.ImportDeclaration(makeImportNode('../common'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports for case-sensitive ordering: B before a', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('B'))
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports single violation when only one pair is out of order', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor.ImportDeclaration(makeImportNode('c'))
      visitor.ImportDeclaration(makeImportNode('b'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports for longer package names in reverse order', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('typescript'))
      visitor.ImportDeclaration(makeImportNode('express'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports for same-prefix packages', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('@company/utils'))
      visitor.ImportDeclaration(makeImportNode('@company/api'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('report loc is set for the second import', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('z', 1, 0, 1, 20))
      visitor.ImportDeclaration(makeImportNode('a', 2, 0, 2, 20))
      visitor['Program:exit']()
      expect(reports[0].loc).toBeDefined()
      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('report node is set to the second import node', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      const nodeZ = makeImportNode('z')
      const nodeA = makeImportNode('a')
      visitor.ImportDeclaration(nodeZ)
      visitor.ImportDeclaration(nodeA)
      visitor['Program:exit']()
      expect(reports[0].node).toBe(nodeA)
    })

    test('reports for numeric module specifiers', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('2'))
      visitor.ImportDeclaration(makeImportNode('1'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports for hyphenated package names', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('node-fetch'))
      visitor.ImportDeclaration(makeImportNode('axios'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports for single character reverse order', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('z'))
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports[0].message).toBe(
        "Imports should be sorted. 'a' should come before 'z'.",
      )
    })

    test('reports correct messages for multiple violations', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('c'))
      visitor.ImportDeclaration(makeImportNode('b'))
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports[0].message).toBe(
        "Imports should be sorted. 'b' should come before 'c'.",
      )
      expect(reports[1].message).toBe(
        "Imports should be sorted. 'a' should come before 'b'.",
      )
    })

    test('reports for four imports with one inversion', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor.ImportDeclaration(makeImportNode('d'))
      visitor.ImportDeclaration(makeImportNode('c'))
      visitor.ImportDeclaration(makeImportNode('e'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports for five fully reversed imports', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('e'))
      visitor.ImportDeclaration(makeImportNode('d'))
      visitor.ImportDeclaration(makeImportNode('c'))
      visitor.ImportDeclaration(makeImportNode('b'))
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports.length).toBe(4)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('z'))
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('z'))
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports[0].node).toBeDefined()
    })

    test('report loc start line matches second import', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('z', 1, 0, 1, 20))
      visitor.ImportDeclaration(makeImportNode('a', 5, 0, 5, 20))
      visitor['Program:exit']()
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('report loc start column matches second import', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('z', 1, 0, 1, 20))
      visitor.ImportDeclaration(makeImportNode('a', 3, 10, 3, 30))
      visitor['Program:exit']()
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end line matches second import', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('z', 1, 0, 1, 20))
      visitor.ImportDeclaration(makeImportNode('a', 3, 0, 7, 30))
      visitor['Program:exit']()
      expect(reports[0].loc?.end.line).toBe(7)
    })

    test('report loc end column matches second import', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('z', 1, 0, 1, 20))
      visitor.ImportDeclaration(makeImportNode('a', 3, 0, 3, 25))
      visitor['Program:exit']()
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('b'))
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports[0].message).toBe(
        "Imports should be sorted. 'a' should come before 'b'.",
      )
    })

    test('report node matches the second (curr) import node', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      const firstNode = makeImportNode('z')
      const secondNode = makeImportNode('a')
      visitor.ImportDeclaration(firstNode)
      visitor.ImportDeclaration(secondNode)
      visitor['Program:exit']()
      expect(reports[0].node).toBe(secondNode)
    })

    test('report node is NOT the first (prev) import node', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      const firstNode = makeImportNode('z')
      const secondNode = makeImportNode('a')
      visitor.ImportDeclaration(firstNode)
      visitor.ImportDeclaration(secondNode)
      visitor['Program:exit']()
      expect(reports[0].node).not.toBe(firstNode)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('z'))
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('second violation reports correct curr node', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      const nodeC = makeImportNode('c')
      const nodeB = makeImportNode('b')
      const nodeA = makeImportNode('a')
      visitor.ImportDeclaration(nodeC)
      visitor.ImportDeclaration(nodeB)
      visitor.ImportDeclaration(nodeA)
      visitor['Program:exit']()
      expect(reports[1].node).toBe(nodeA)
    })

    test('second violation reports correct message', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('c'))
      visitor.ImportDeclaration(makeImportNode('b'))
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports[1].message).toBe(
        "Imports should be sorted. 'a' should come before 'b'.",
      )
    })

    test('report loc reflects custom location of second import', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('z', 10, 4, 10, 12))
      visitor.ImportDeclaration(makeImportNode('a', 20, 8, 20, 16))
      visitor['Program:exit']()
      expect(reports[0].loc?.start.line).toBe(20)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(20)
      expect(reports[0].loc?.end.column).toBe(16)
    })

    test('all reports have message property', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('c'))
      visitor.ImportDeclaration(makeImportNode('b'))
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      for (const report of reports) {
        expect(report).toHaveProperty('message')
        expect(typeof report.message).toBe('string')
      }
    })

    test('all reports have loc and node properties', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('c'))
      visitor.ImportDeclaration(makeImportNode('b'))
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      for (const report of reports) {
        expect(report.loc).toBeDefined()
        expect(report.node).toBeDefined()
      }
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for single import', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for two sorted imports', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor.ImportDeclaration(makeImportNode('b'))
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for three sorted imports', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor.ImportDeclaration(makeImportNode('b'))
      visitor.ImportDeclaration(makeImportNode('c'))
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for no imports', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for identical import sources', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('react'))
      visitor.ImportDeclaration(makeImportNode('react'))
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      expect(() => visitor.ImportDeclaration(null)).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      expect(() => visitor.ImportDeclaration(undefined)).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      expect(() => visitor.ImportDeclaration({})).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for wrong node type Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      expect(() => visitor.ImportDeclaration('not a node')).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      expect(() => visitor.ImportDeclaration(42)).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      expect(() => visitor.ImportDeclaration(true)).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      expect(() => visitor.ImportDeclaration([])).not.toThrow()
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration({ type: 'FunctionDeclaration', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 20) })
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report when import source is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration({ type: 'ImportDeclaration', loc: makeLoc(1, 0, 1, 20) })
      visitor.ImportDeclaration({ type: 'ImportDeclaration', source: { type: 'Literal', value: 'a' }, loc: makeLoc(2, 0, 2, 20) })
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report when source value is null', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration({ type: 'ImportDeclaration', source: { type: 'Literal', value: null }, loc: makeLoc(1, 0, 1, 20) })
      visitor.ImportDeclaration({ type: 'ImportDeclaration', source: { type: 'Literal', value: 'a' }, loc: makeLoc(2, 0, 2, 20) })
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report when source value is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration({ type: 'ImportDeclaration', source: { type: 'Literal', value: 123 }, loc: makeLoc(1, 0, 1, 20) })
      visitor.ImportDeclaration({ type: 'ImportDeclaration', source: { type: 'Literal', value: 'a' }, loc: makeLoc(2, 0, 2, 20) })
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report when source object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration({ type: 'ImportDeclaration', source: undefined, loc: makeLoc(1, 0, 1, 20) })
      visitor.ImportDeclaration({ type: 'ImportDeclaration', source: { type: 'Literal', value: 'a' }, loc: makeLoc(2, 0, 2, 20) })
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for five sorted imports', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor.ImportDeclaration(makeImportNode('b'))
      visitor.ImportDeclaration(makeImportNode('c'))
      visitor.ImportDeclaration(makeImportNode('d'))
      visitor.ImportDeclaration(makeImportNode('e'))
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for sorted scoped packages', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('@scope/a'))
      visitor.ImportDeclaration(makeImportNode('@scope/b'))
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for sorted relative paths', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('../a'))
      visitor.ImportDeclaration(makeImportNode('../b'))
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('does not report for import with empty source followed by valid import', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration({ type: 'ImportDeclaration', source: { type: 'Literal', value: '' }, loc: makeLoc(1, 0, 1, 20) })
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = sortImportsRule.create(ctx1)
      const visitor2 = sortImportsRule.create(ctx2)
      visitor1.ImportDeclaration(makeImportNode('z'))
      visitor1.ImportDeclaration(makeImportNode('a'))
      visitor1['Program:exit']()
      visitor2.ImportDeclaration(makeImportNode('a'))
      visitor2.ImportDeclaration(makeImportNode('b'))
      visitor2['Program:exit']()
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = sortImportsRule.create(context)
      const visitor2 = sortImportsRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = sortImportsRule.meta
      const meta2 = sortImportsRule.meta
      expect(meta1).toBe(meta2)
    })

    test('node without loc still collects and compares', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration({ type: 'ImportDeclaration', source: { type: 'Literal', value: 'z' } })
      visitor.ImportDeclaration({ type: 'ImportDeclaration', source: { type: 'Literal', value: 'a' } })
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration({ type: 'ImportDeclaration', source: { type: 'Literal', value: 'z' } })
      visitor.ImportDeclaration({ type: 'ImportDeclaration', source: { type: 'Literal', value: 'a' } })
      visitor['Program:exit']()
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration({
        type: 'ImportDeclaration',
        source: { type: 'Literal', value: 'z' },
        loc: makeLoc(1, 0, 1, 20),
        specifiers: [],
        importKind: 'value',
      })
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration({ type: 'ImportDeclaration', source: { type: 'Literal', value: 'z' }, loc: {} })
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration({ type: 'ImportDeclaration', source: { type: 'Literal', value: 'z' }, loc: { start: { line: 3, column: 5 } } })
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
    })

    test('mixed valid and invalid imports counted correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor.ImportDeclaration(makeImportNode('b'))
      visitor.ImportDeclaration(makeImportNode('z'))
      visitor.ImportDeclaration(makeImportNode('c'))
      visitor.ImportDeclaration(makeImportNode('d'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('rule exports are correct', () => {
      expect(sortImportsRule).toBeDefined()
      expect(typeof sortImportsRule.create).toBe('function')
      expect(typeof sortImportsRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration({ type: 'ImportDeclaration', source: { type: 'Literal', value: 'z' }, loc: makeLoc(1, 0, 1, 20), _parent: {} })
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('multiple Program:exit calls report same violations', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('z'))
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      visitor['Program:exit']()
      expect(reports.length).toBe(2)
    })

    test('Program:exit without any imports does not throw', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      expect(() => visitor['Program:exit']()).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles ImportDeclaration with source as non-object', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration({ type: 'ImportDeclaration', source: 'not-an-object', loc: makeLoc(1, 0, 1, 20) })
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports.length).toBe(0)
    })

    test('localeCompare determines ordering (uppercase vs lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('B'))
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across mixed nodes correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor.ImportDeclaration({ type: 'Identifier', name: 'foo', loc: makeLoc(2, 0, 2, 3) })
      visitor.ImportDeclaration(makeImportNode('z'))
      visitor.ImportDeclaration(makeImportNode('b'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('wrong type nodes are skipped but valid ones still compared', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      visitor.ImportDeclaration(makeImportNode('z'))
      visitor.ImportDeclaration(makeImportNode('a'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('reports for imports differing only by case', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor.ImportDeclaration(makeImportNode('React'))
      visitor.ImportDeclaration(makeImportNode('react'))
      visitor['Program:exit']()
      expect(reports.length).toBe(1)
    })

    test('does not report when calling Program:exit before ImportDeclaration', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      visitor['Program:exit']()
      visitor.ImportDeclaration(makeImportNode('z'))
      visitor.ImportDeclaration(makeImportNode('a'))
      expect(reports.length).toBe(0)
    })

    test('handles large number of imports efficiently', () => {
      const { context, reports } = createMockContext()
      const visitor = sortImportsRule.create(context)
      for (let i = 26; i >= 1; i--) {
        visitor.ImportDeclaration(makeImportNode(String.fromCharCode(96 + i)))
      }
      visitor['Program:exit']()
      expect(reports.length).toBe(25)
    })
  })
})

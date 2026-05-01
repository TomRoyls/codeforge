import { describe, expect, test, vi } from 'vitest'
import { noUnderscoreDangleRule } from '../../../../src/rules/patterns/no-underscore-dangle.js'
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

function makeIdentNode(
  name: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 5,
): unknown {
  return {
    type: 'Identifier',
    name,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-underscore-dangle rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnderscoreDangleRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnderscoreDangleRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnderscoreDangleRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnderscoreDangleRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnderscoreDangleRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning underscore', () => {
      const desc = noUnderscoreDangleRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/underscore/)
    })

    test('should have correct docs URL', () => {
      expect(noUnderscoreDangleRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-underscore-dangle',
      )
    })

    test('should have empty schema', () => {
      expect(noUnderscoreDangleRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with Identifier', () => {
      const { context } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      expect(visitor).toHaveProperty('Identifier')
      expect(typeof visitor.Identifier).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnderscoreDangleRule).toBeDefined()
      expect(noUnderscoreDangleRule.meta).toBeDefined()
      expect(noUnderscoreDangleRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS LEADING UNDERSCORE (12) =====

  describe('positive cases — reports leading underscore', () => {
    test('reports for leading underscore "_foo"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_foo'))
      expect(reports.length).toBe(1)
    })

    test('reports for leading underscore "_bar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_bar'))
      expect(reports.length).toBe(1)
    })

    test('reports for leading underscore "_myVar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_myVar'))
      expect(reports.length).toBe(1)
    })

    test('reports for leading underscore "_private"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_private'))
      expect(reports.length).toBe(1)
    })

    test('reports for leading underscore "_camelCase"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_camelCase'))
      expect(reports.length).toBe(1)
    })

    test('reports for leading underscore "_a"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_a'))
      expect(reports.length).toBe(1)
    })

    test('reports for leading underscore "_123"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_123'))
      expect(reports.length).toBe(1)
    })

    test('reports for leading underscore "_test123"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_test123'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "leading underscore"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_foo'))
      expect(reports[0].message).toContain('leading underscore')
    })

    test('report message includes the identifier name for leading', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_foo'))
      expect(reports[0].message).toContain("'_foo'")
    })

    test('report has loc property for leading', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_foo'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property for leading', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_foo'))
      expect(reports[0].node).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS TRAILING UNDERSCORE (12) =====

  describe('positive cases — reports trailing underscore', () => {
    test('reports for trailing underscore "foo_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('foo_'))
      expect(reports.length).toBe(1)
    })

    test('reports for trailing underscore "bar_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('bar_'))
      expect(reports.length).toBe(1)
    })

    test('reports for trailing underscore "myVar_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('myVar_'))
      expect(reports.length).toBe(1)
    })

    test('reports for trailing underscore "private_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('private_'))
      expect(reports.length).toBe(1)
    })

    test('reports for trailing underscore "camelCase_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('camelCase_'))
      expect(reports.length).toBe(1)
    })

    test('reports for trailing underscore "a_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('a_'))
      expect(reports.length).toBe(1)
    })

    test('reports for trailing underscore "test123_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('test123_'))
      expect(reports.length).toBe(1)
    })

    test('reports for trailing underscore "trailing_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('trailing_'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "trailing underscore"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('foo_'))
      expect(reports[0].message).toContain('trailing underscore')
    })

    test('report message includes the identifier name for trailing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('foo_'))
      expect(reports[0].message).toContain("'foo_'")
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('foo_', 5, 10, 5, 15))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report node matches the input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      const node = makeIdentNode('foo_')
      visitor.Identifier(node)
      expect(reports[0].node).toBe(node)
    })
  })

  // ===== POSITIVE CASES — REPORTS BOTH LEADING AND TRAILING (10) =====

  describe('positive cases — reports both leading and trailing underscore', () => {
    test('reports for both "_foo_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_foo_'))
      expect(reports.length).toBe(1)
    })

    test('reports for both "_bar_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_bar_'))
      expect(reports.length).toBe(1)
    })

    test('reports for both "_myVar_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_myVar_'))
      expect(reports.length).toBe(1)
    })

    test('reports for both "_a_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_a_'))
      expect(reports.length).toBe(1)
    })

    test('reports for both "_private_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_private_'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions "leading and trailing underscore"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_foo_'))
      expect(reports[0].message).toContain('leading and trailing underscore')
    })

    test('report message includes the identifier name for both', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_foo_'))
      expect(reports[0].message).toContain("'_foo_'")
    })

    test('reports for both "_x_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_x_'))
      expect(reports.length).toBe(1)
    })

    test('reports for both "_longName_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_longName_'))
      expect(reports.length).toBe(1)
    })

    test('reports only once per identifier with both', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_foo_'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (20) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for normal identifier "foo"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('foo'))
      expect(reports.length).toBe(0)
    })

    test('does not report for normal identifier "bar"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('bar'))
      expect(reports.length).toBe(0)
    })

    test('does not report for bare underscore "_"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_'))
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier without underscores "camelCase"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('camelCase'))
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier "myVar123"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('myVar123'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      expect(() => visitor.Identifier(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      expect(() => visitor.Identifier(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      expect(() => visitor.Identifier({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      expect(() => visitor.Identifier('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      expect(() => visitor.Identifier(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      expect(() => visitor.Identifier(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      expect(() => visitor.Identifier([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when name is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier({ type: 'Identifier', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when name is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when name is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: 123, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for single letter "a"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('a'))
      expect(reports.length).toBe(0)
    })

    test('does not report for "abc"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('abc'))
      expect(reports.length).toBe(0)
    })

    test('does not report for identifier with underscore in middle "my_var"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('my_var'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (30) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnderscoreDangleRule.create(ctx1)
      const visitor2 = noUnderscoreDangleRule.create(ctx2)
      visitor1.Identifier(makeIdentNode('_foo'))
      visitor2.Identifier(makeIdentNode('foo'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_foo'))
      visitor.Identifier(makeIdentNode('bar'))
      visitor.Identifier(makeIdentNode('baz_'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      const node = { type: 'Identifier', name: '_foo' }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      const node = { type: 'Identifier', name: '_foo' }
      visitor.Identifier(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('foo'))
      visitor.Identifier(makeIdentNode('_bar'))
      visitor.Identifier(makeIdentNode('baz'))
      visitor.Identifier(makeIdentNode('qux_'))
      visitor.Identifier(makeIdentNode('my_var'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnderscoreDangleRule.create(context)
      const visitor2 = noUnderscoreDangleRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnderscoreDangleRule.meta
      const meta2 = noUnderscoreDangleRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_foo'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      const node = {
        type: 'Identifier',
        name: '_foo',
        loc: makeLoc(1, 0, 1, 5),
        range: [0, 5],
        extra: true,
        _parent: {},
      }
      visitor.Identifier(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: '_foo', loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: '_foo', loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      const node = makeIdentNode('_foo')
      visitor.Identifier(node)
      visitor.Identifier(node)
      visitor.Identifier(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnderscoreDangleRule).toBeDefined()
      expect(typeof noUnderscoreDangleRule.create).toBe('function')
      expect(typeof noUnderscoreDangleRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: '_foo', loc: makeLoc(1, 0, 1, 5), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('reports for leading with two underscores "__foo"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('__foo'))
      expect(reports.length).toBe(1)
    })

    test('reports for trailing with two underscores "foo__', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('foo__'))
      expect(reports.length).toBe(1)
    })

    test('reports for both with double underscores "__foo__"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('__foo__'))
      expect(reports.length).toBe(1)
    })

    test('reports for double underscore alone "__" as both leading and trailing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('__'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('leading and trailing underscore')
    })

    test('does not report for identifier "constructor"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('constructor'))
      expect(reports.length).toBe(0)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_a'))
      visitor.Identifier(makeIdentNode('b_'))
      visitor.Identifier(makeIdentNode('_c_'))
      expect(reports.length).toBe(3)
    })

    test('all reports have correct message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_a'))
      visitor.Identifier(makeIdentNode('b_'))
      for (const report of reports) {
        expect(report.message).toMatch(/^Unexpected .+ underscore in identifier '.+'\.$/)
      }
    })

    test('does not report for identifier with internal underscores "my_long_var"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('my_long_var'))
      expect(reports.length).toBe(0)
    })

    test('report message is exactly as defined for leading', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_foo'))
      expect(reports[0].message).toBe(
        "Unexpected leading underscore in identifier '_foo'.",
      )
    })

    test('report message is exactly as defined for trailing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('foo_'))
      expect(reports[0].message).toBe(
        "Unexpected trailing underscore in identifier 'foo_'.",
      )
    })

    test('report message is exactly as defined for both', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_foo_'))
      expect(reports[0].message).toBe(
        "Unexpected leading and trailing underscore in identifier '_foo_'.",
      )
    })

    test('handles node with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: '_foo', loc: makeLoc(1, 0, 1, 5), range: [0, 5] })
      expect(reports.length).toBe(1)
    })

    test('does not report when name is boolean true', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: true, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_foo', 10, 4, 10, 12))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('does not report when name is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: ['_foo'], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('node with _parent still reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier({ type: 'Identifier', name: '_private', loc: makeLoc(1, 0, 1, 9), _parent: { type: 'VariableDeclarator' } })
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('_private')
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnderscoreDangleRule.create(context)
      visitor.Identifier(makeIdentNode('_a'))
      visitor.Identifier(makeIdentNode('b_'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('leading')
      expect(reports[1].message).toContain('trailing')
    })
  })
})

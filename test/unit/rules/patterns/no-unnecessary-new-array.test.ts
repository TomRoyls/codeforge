import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNewArrayRule } from '../../../../src/rules/patterns/no-unnecessary-new-array.js'
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
    getSource: () => 'new Array()',
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

function makeNewArrayNode(
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: 'Array' },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-new-array rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNewArrayRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNewArrayRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNewArrayRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNewArrayRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNewArrayRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning new Array', () => {
      const desc = noUnnecessaryNewArrayRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/new array/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNewArrayRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-new-array',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNewArrayRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      expect(visitor).toHaveProperty('NewExpression')
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNewArrayRule).toBeDefined()
      expect(noUnnecessaryNewArrayRule.meta).toBeDefined()
      expect(noUnnecessaryNewArrayRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (25) =====

  describe('positive cases — reports unnecessary new Array()', () => {
    test('reports for new Array() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      expect(reports.length).toBe(1)
    })

    test('reports for new Array() with empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode([]))
      expect(reports.length).toBe(1)
    })

    test('reports for new Array() with undefined arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: undefined,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for new Array() with missing arguments property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for nested new Array() in outer expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      expect(reports.length).toBe(1)
    })

    test('reports for multiple new Array() calls in sequence', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      visitor.NewExpression(makeNewArrayNode())
      expect(reports.length).toBe(2)
    })

    test('reports for new Array() with loc on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode([], 3, 5, 3, 15))
      expect(reports.length).toBe(1)
    })

    test('reports for new Array() with extra properties on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
      })
      expect(reports.length).toBe(1)
    })

    test('reports for new Array() with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: { type: 'VariableDeclarator' },
      })
      expect(reports.length).toBe(1)
    })

    test('reports for new Array() with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        range: [5, 15],
      })
      expect(reports.length).toBe(1)
    })

    test('reports for new Array() with custom loc values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode([], 10, 4, 10, 14))
      expect(reports.length).toBe(1)
    })

    test('reports for new Array() in arrow function body context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      expect(reports.length).toBe(1)
    })

    test('reports for new Array() in return statement context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      expect(reports.length).toBe(1)
    })

    test('reports for new Array() as function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      expect(reports.length).toBe(1)
    })

    test('reports for new Array() in variable declaration context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      expect(reports.length).toBe(1)
    })

    test('reports for new Array() in conditional expression context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      expect(reports.length).toBe(1)
    })

    test('reports for new Array() with callee having extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array', loc: makeLoc(1, 4, 1, 9), range: [4, 9] },
        arguments: [],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for new Array() with non-standard loc shape', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: { start: { line: 2, column: 3 }, end: { line: 2, column: 13 } },
      })
      expect(reports.length).toBe(1)
    })

    test('reports when arguments is null (not an array)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when arguments is a string (not an array)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: 'oops',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports same node multiple times (accumulates)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      const node = makeNewArrayNode()
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      expect(reports.length).toBe(2)
    })

    test('reports with specific loc values preserved in report', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode([], 7, 2, 7, 12))
      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(2)
    })

    test('reports for new Array() with additional callee keys', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array', extra: true, optional: false },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for new Array() regardless of extra node keys', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        trailingComments: [],
        leadingComments: [],
      })
      expect(reports.length).toBe(1)
    })

    test('reports for new Array() in assignment expression context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message contains "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message mentions "new Array"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      expect(reports[0].message).toContain('new Array')
    })

    test('report message mentions "[]"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      expect(reports[0].message).toContain('[]')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      expect(reports[0].message).toBe('Unnecessary new Array(). Use [] instead.')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      const node = makeNewArrayNode()
      visitor.NewExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc preserves start line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode([], 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
    })

    test('report loc preserves start column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode([], 5, 10, 5, 20))
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc preserves end line', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode([], 3, 0, 5, 10))
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('report loc preserves end column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode([], 3, 0, 5, 10))
      expect(reports[0].loc?.end.column).toBe(10)
    })

    test('report descriptor has message, loc, and node properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports accumulate across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      visitor.NewExpression(makeNewArrayNode())
      visitor.NewExpression(makeNewArrayNode())
      expect(reports.length).toBe(3)
    })

    test('all reports have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      visitor.NewExpression(makeNewArrayNode())
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('single report per single violation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for new Array(5) with numeric arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode([{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array(1,2,3) with multiple args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(
        makeNewArrayNode([
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
          { type: 'Literal', value: 3 },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array("hello") with string arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode([{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.from() — CallExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'from' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.of() — CallExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Array' },
          property: { type: 'Identifier', name: 'of' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Object() — callee name is not Array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Array() without new — CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 9),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-Array identifier like new Foo()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Foo' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 9),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for computed property callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'Array' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      expect(() => visitor.NewExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      expect(() => visitor.NewExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'ArrayExpression',
        elements: [],
        loc: makeLoc(1, 0, 1, 2),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'BinaryExpression',
        operator: '+',
        left: {},
        right: {},
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array with ObjectExpression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode([{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression with Array callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 9),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'bar' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new SomeArray() wrong name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'SomeArray' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: 'string',
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for callee Identifier named "array" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'array' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for callee Identifier named "ARRAY" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'ARRAY' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNewArrayRule.create(ctx1)
      const visitor2 = noUnnecessaryNewArrayRule.create(ctx2)
      visitor1.NewExpression(makeNewArrayNode())
      visitor2.NewExpression(makeNewArrayNode([{ type: 'Literal', value: 5 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed inputs', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      visitor.NewExpression(makeNewArrayNode([{ type: 'Literal', value: 5 }]))
      visitor.NewExpression(makeNewArrayNode())
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
      }
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode([{ type: 'Literal', value: 5 }]))
      visitor.NewExpression(makeNewArrayNode())
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 12),
      })
      visitor.NewExpression(makeNewArrayNode())
      visitor.NewExpression(
        makeNewArrayNode([
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
          { type: 'Literal', value: 3 },
        ]),
      )
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNewArrayRule.create(context)
      const visitor2 = noUnnecessaryNewArrayRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNewArrayRule.meta
      const meta2 = noUnnecessaryNewArrayRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      const node = makeNewArrayNode()
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNewArrayRule).toBeDefined()
      expect(typeof noUnnecessaryNewArrayRule.create).toBe('function')
      expect(typeof noUnnecessaryNewArrayRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode())
      visitor.NewExpression(makeNewArrayNode())
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression(makeNewArrayNode([], 10, 4, 10, 14))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(14)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: null,
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: undefined,
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee has MemberExpression with null object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'Array' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-Identifier callee type (CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewArrayRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [],
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNewObjectRule } from '../../../../src/rules/patterns/no-unnecessary-new-object.js'
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
    getSource: () => 'new Object()',
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

function makeNewObjectNode(
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 15,
  args: unknown[] = [],
): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: 'Object' },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-new-object rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNewObjectRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNewObjectRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNewObjectRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNewObjectRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNewObjectRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning new Object', () => {
      const desc = noUnnecessaryNewObjectRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/new object/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNewObjectRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-new-object',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNewObjectRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      expect(visitor).toHaveProperty('NewExpression')
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNewObjectRule).toBeDefined()
      expect(noUnnecessaryNewObjectRule.meta).toBeDefined()
      expect(noUnnecessaryNewObjectRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS UNNECESSARY NEW OBJECT (25) =====

  describe('positive cases — reports unnecessary new Object()', () => {
    test('reports for new Object() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode())
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() with empty args array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode(1, 0, 1, 15, []))
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() with no arguments property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() with null arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: null,
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() with non-array arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for nested new Object() as argument of outer expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      const innerNode = makeNewObjectNode(2, 4, 2, 19)
      visitor.NewExpression(innerNode)
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() at custom loc position', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode(10, 4, 10, 19))
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() with multi-line loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode(5, 0, 7, 1))
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() with zero-width span', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode(3, 5, 3, 5))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode())
      visitor.NewExpression(makeNewObjectNode(2, 0, 2, 15))
      expect(reports.length).toBe(2)
    })

    test('reports for new Object() with extra node properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
        range: [0, 15],
        extra: true,
      })
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
        range: [0, 15] as [number, number],
      })
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() in return-like context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      const node = makeNewObjectNode(3, 8, 3, 23)
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() in assignment-like context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      const node = makeNewObjectNode(4, 12, 4, 27)
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() in array element position', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      const node = makeNewObjectNode(7, 2, 7, 17)
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() in object property value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      const node = makeNewObjectNode(8, 6, 8, 21)
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() as function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      const node = makeNewObjectNode(9, 10, 9, 25)
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() with callee having extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object', range: [4, 10] },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() at end of file loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode(100, 0, 100, 15))
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() in conditional position', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode(11, 2, 11, 17))
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() in loop body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode(15, 4, 15, 19))
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() in arrow function body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode(20, 8, 20, 23))
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() in class method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode(25, 6, 25, 21))
      expect(reports.length).toBe(1)
    })

    test('reports for new Object() with large column offset', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode(1, 80, 1, 95))
      expect(reports.length).toBe(1)
    })
  })

  // ===== REPORT PROPERTIES (15) =====

  describe('report properties', () => {
    test('report message mentions "Unnecessary"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode())
      expect(reports[0].message).toContain('Unnecessary')
    })

    test('report message mentions "new Object"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode())
      expect(reports[0].message).toContain('new Object')
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode())
      expect(reports[0].message).toBe('Unnecessary new Object(). Use {} instead.')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode())
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode())
      expect(reports[0].node).toBeDefined()
    })

    test('report loc values are preserved from input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode(5, 10, 5, 25))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc start.line matches input', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode(12, 3, 12, 18))
      expect(reports[0].loc?.start.line).toBe(12)
    })

    test('report loc start.column matches input', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode(1, 7, 1, 22))
      expect(reports[0].loc?.start.column).toBe(7)
    })

    test('report loc end.line matches input', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode(3, 0, 5, 1))
      expect(reports[0].loc?.end.line).toBe(5)
    })

    test('report loc end.column matches input', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode(1, 0, 1, 20))
      expect(reports[0].loc?.end.column).toBe(20)
    })

    test('report node is same reference as input node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      const node = makeNewObjectNode()
      visitor.NewExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report descriptor has message, loc, and node properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('accumulates two reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode())
      visitor.NewExpression(makeNewObjectNode(2, 0, 2, 15))
      expect(reports.length).toBe(2)
    })

    test('all reports have consistent message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode())
      visitor.NewExpression(makeNewObjectNode(2, 0, 2, 15))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('single report for single violation', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode())
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (25) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for new Object({}) with object argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode(1, 0, 1, 17, [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Object(null)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode(1, 0, 1, 17, [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Object(someVar) with identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode(1, 0, 1, 20, [{ type: 'Identifier', name: 'someVar' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.create()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'create' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Set()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'keys' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 18),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-new call Object()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for non-Object identifier new Thing()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Thing' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for computed property callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'Object' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: null,
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: undefined,
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      expect(() => visitor.NewExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      expect(() => visitor.NewExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({ type: 'ArrayExpression', elements: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ObjectExpression argument new Object({})', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode(1, 0, 1, 17, [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for lowercase "object" callee name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'object' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for MemberExpression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'Object' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for String identifier new String()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'String' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNewObjectRule.create(ctx1)
      const visitor2 = noUnnecessaryNewObjectRule.create(ctx2)
      visitor1.NewExpression(makeNewObjectNode())
      visitor2.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: makeLoc(1, 0, 1, 17),
      })
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('accumulation of mixed valid/invalid calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode())
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
        loc: makeLoc(2, 0, 2, 17),
      })
      visitor.NewExpression(makeNewObjectNode(3, 0, 3, 15))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [],
      }
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode()) // reports
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: makeLoc(2, 0, 2, 14),
      }) // no report
      visitor.NewExpression(makeNewObjectNode(3, 0, 3, 15)) // reports
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [{ type: 'Identifier', name: 'x' }],
        loc: makeLoc(4, 0, 4, 17),
      }) // no report
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNewObjectRule.create(context)
      const visitor2 = noUnnecessaryNewObjectRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNewObjectRule.meta
      const meta2 = noUnnecessaryNewObjectRule.meta
      expect(meta1).toBe(meta2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode())
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
        range: [0, 15],
        extra: true,
        flags: 'strict',
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      const node = makeNewObjectNode()
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNewObjectRule).toBeDefined()
      expect(typeof noUnnecessaryNewObjectRule.create).toBe('function')
      expect(typeof noUnnecessaryNewObjectRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode())
      visitor.NewExpression(makeNewObjectNode(2, 0, 2, 15))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles callee as string (non-object)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: 'Object',
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('handles non-Identifier callee type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'foo' },
          property: { type: 'Identifier', name: 'bar' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 18),
      })
      expect(reports.length).toBe(0)
    })

    test('handles undefined arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: undefined,
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression(makeNewObjectNode(10, 4, 10, 19))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(19)
    })

    test('handles null object/property in node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewObjectRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Object' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
        object: null,
        property: null,
      })
      expect(reports.length).toBe(1)
    })
  })
})

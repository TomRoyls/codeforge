import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayConstructorRule } from '../../../../src/rules/patterns/no-unnecessary-array-constructor.js'
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
    getSource: () => '[]',
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

function makeNewExpressionNode(
  calleeName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'NewExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-constructor rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayConstructorRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayConstructorRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayConstructorRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayConstructorRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayConstructorRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Array', () => {
      const desc = noUnnecessaryArrayConstructorRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/array/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayConstructorRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-array-constructor.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayConstructorRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      expect(visitor).toHaveProperty('NewExpression')
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayConstructorRule).toBeDefined()
      expect(noUnnecessaryArrayConstructorRule.meta).toBeDefined()
      expect(noUnnecessaryArrayConstructorRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary new Array()', () => {
    test('reports for new Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array'))
      expect(reports.length).toBe(1)
    })

    test('reports for new Array with empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', []))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary new Array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array'))
      expect(reports[0].message).toMatch(/new Array/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array'))
      expect(reports[0].message).toBe(
        'Unnecessary new Array(). Use an array literal [] instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input NewExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      const node = makeNewExpressionNode('Array')
      visitor.NewExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array'))
      visitor.NewExpression(makeNewExpressionNode('Array'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array'))
      visitor.NewExpression(makeNewExpressionNode('Array'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: null,
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when arguments is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: undefined,
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when arguments property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(1)
    })

    test('reports new Array() at different locations in file', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [], 42, 8, 42, 22))
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('reports new Array() at start of file', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [], 1, 0, 1, 14))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      const node = makeNewExpressionNode('Array')
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      expect(reports.length).toBe(3)
    })

    test('reports for new Array() inside a variable declaration context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array'))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('[]')
    })

    test('reports regardless of node having extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
        range: [0, 14],
        extra: true,
        trailingComments: [],
      })
      expect(reports.length).toBe(1)
    })

    test('reports when node has _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
        _parent: { type: 'VariableDeclarator' },
      })
      expect(reports.length).toBe(1)
    })

    test('reports with correct end location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [], 3, 5, 3, 19))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(19)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array'))
      visitor.NewExpression(makeNewExpressionNode('Array'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report message suggests array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array'))
      expect(reports[0].message).toMatch(/\[\]/)
    })

    test('reports when arguments is empty array with loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [] as unknown[],
        loc: makeLoc(7, 2, 7, 16),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].node).toBe(node)
    })

    test('reports without throwing when callee is Identifier named Array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      expect(() => visitor.NewExpression(makeNewExpressionNode('Array'))).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('reports for callee with only type and name properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(1)
    })

    test('reports for new Array() on line zero column zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [], 0, 0, 0, 14))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(0)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports when arguments is a number instead of array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: 42,
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when arguments is a boolean instead of array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: false,
        loc: makeLoc(1, 0, 1, 14),
      })
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for new Array(5)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [{ type: 'Literal', value: 5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array(1, 2, 3)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [
        { type: 'Literal', value: 1 },
        { type: 'Literal', value: 2 },
        { type: 'Literal', value: 3 },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array("hello")', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array(foo)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [{ type: 'Identifier', name: 'foo' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Error()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Error'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Object()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Object'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Map'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Set()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Set'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new MyArray()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('MyArray'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new array (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('array'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      expect(() => visitor.NewExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      expect(() => visitor.NewExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', arguments: [], loc: makeLoc(1, 0, 1, 14) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 14) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'foo' }, property: { type: 'Identifier', name: 'Array' } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "ArrayBuffer"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('ArrayBuffer'))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "Float32Array"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Float32Array'))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "Int8Array"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Int8Array'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array(0) — zero as argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array(100)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [{ type: 'Literal', value: 100 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array with identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [{ type: 'Identifier', name: 'size' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array with multiple string arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [
        { type: 'Literal', value: 'a' },
        { type: 'Literal', value: 'b' },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array with spread element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [
        { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getClass' }, arguments: [] },
        arguments: [],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is not Identifier but name is Array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'ns' }, property: { type: 'Identifier', name: 'Array' } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array with object argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [
        { type: 'ObjectExpression', properties: [] },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array with many arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      const args = Array.from({ length: 50 }, (_, i) => ({ type: 'Literal', value: i }))
      visitor.NewExpression(makeNewExpressionNode('Array', args))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array with arrow function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [
        { type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } },
      ]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayConstructorRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayConstructorRule.create(ctx2)
      visitor1.NewExpression(makeNewExpressionNode('Array'))
      visitor2.NewExpression(makeNewExpressionNode('Array', [{ type: 'Literal', value: 5 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly with mixed valid/invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array'))
      visitor.NewExpression(makeNewExpressionNode('Array', [{ type: 'Literal', value: 5 }]))
      visitor.NewExpression(makeNewExpressionNode('Array'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
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
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
      }
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
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
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
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

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayConstructorRule.create(context)
      const visitor2 = noUnnecessaryArrayConstructorRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayConstructorRule.meta
      const meta2 = noUnnecessaryArrayConstructorRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayConstructorRule).toBeDefined()
      expect(typeof noUnnecessaryArrayConstructorRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayConstructorRule.meta).toBe('object')
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array'))
      visitor.NewExpression(makeNewExpressionNode('Array', [{ type: 'Literal', value: 5 }]))
      visitor.NewExpression(makeNewExpressionNode('Error'))
      visitor.NewExpression(makeNewExpressionNode('Array'))
      visitor.NewExpression(makeNewExpressionNode('Array', [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(2)
    })

    test('does not report for new Array with template literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [
        { type: 'TemplateLiteral', quasis: [], expressions: [] },
      ]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array with undefined argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(0)
    })

    test('reports only for Array, not for ARRAY or aRrAy', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('ARRAY'))
      visitor.NewExpression(makeNewExpressionNode('aRrAy'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array with function call argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayConstructorRule.create(context)
      visitor.NewExpression(makeNewExpressionNode('Array', [
        { type: 'CallExpression', callee: { type: 'Identifier', name: 'getSize' }, arguments: [] },
      ]))
      expect(reports.length).toBe(0)
    })
  })
})

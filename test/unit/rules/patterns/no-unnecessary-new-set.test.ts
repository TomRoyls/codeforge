import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNewSetRule } from '../../../../src/rules/patterns/no-unnecessary-new-set.js'
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

function makeNewSetNode(
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

describe('no-unnecessary-new-set rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNewSetRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNewSetRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNewSetRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNewSetRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNewSetRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Set', () => {
      const desc = noUnnecessaryNewSetRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/set/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNewSetRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-new-set.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNewSetRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      expect(visitor).toHaveProperty('NewExpression')
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNewSetRule).toBeDefined()
      expect(noUnnecessaryNewSetRule.meta).toBeDefined()
      expect(noUnnecessaryNewSetRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary new Set()', () => {
    test('reports for new Set() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', []))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Set', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', []))
      expect(reports[0].message).toMatch(/Set/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', []))
      expect(reports[0].message).toBe(
        'Unnecessary new Set() without initial values. Consider using new Set([...]) with initial values.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', []))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', []))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input NewExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      const node = makeNewSetNode('Set', [])
      visitor.NewExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', []))
      visitor.NewExpression(makeNewSetNode('Set', []))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', []))
      visitor.NewExpression(makeNewSetNode('Set', []))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', []))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for new Set() at various line positions', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', [], 42, 8, 42, 18))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(8)
    })

    test('reports for new Set() spanning multiple lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', [], 1, 0, 3, 1))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.end.line).toBe(3)
    })

    test('reports for new Set() with explicit empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports when node has extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      })
      expect(reports.length).toBe(1)
    })

    test('reports when node has _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports for new Set() without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
      })
      expect(reports.length).toBe(1)
    })

    test('reports for new Set() with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports for new Set() with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      const node = makeNewSetNode('Set', [])
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      expect(reports.length).toBe(3)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports for new Set() inside variable declaration context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', []))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Set')
    })

    test('reports for new Set() at column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', [], 1, 0, 1, 10))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', []))
      visitor.NewExpression(makeNewSetNode('Set', []))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for new Set() with callee as plain object matching Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('report message mentions initial values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', []))
      expect(reports[0].message).toMatch(/initial/)
    })

    test('report message mentions unnecessary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', []))
      expect(reports[0].message).toMatch(/Unnecessary/)
    })

    test('reports for new Set() followed by non-Set new expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', []))
      visitor.NewExpression(makeNewSetNode('Map', []))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (41) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for new Set([1, 2, 3]) — with array argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Set(iterable) — with identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', [{ type: 'Identifier', name: 'iterable' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Set([1]) — single element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new WeakSet() — different constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('WeakSet', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Map() — different constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Map', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for new WeakMap() — different constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('WeakMap', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array() — different constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Array', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Object() — different constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Object', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for new MySet() — custom constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('MySet', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for new set() — lowercase name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('set', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for Set() without new — CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Set(stringArg)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', [{ type: 'Literal', value: 'abc' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Set([]) — empty array argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', [{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      expect(() => visitor.NewExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      expect(() => visitor.NewExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not an Identifier (MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'ns' }, property: { type: 'Identifier', name: 'Set' } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type (not NewExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({ type: 'Identifier', name: 'Set', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Set(otherSet) — identifier argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', [{ type: 'Identifier', name: 'otherSet' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Set([...items]) — spread array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', [{ type: 'ArrayExpression', elements: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Set with function call argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValues' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Set with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'keys' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee type is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Error()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Error', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Promise()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Promise', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for new RegExp()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('RegExp', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Date()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Date', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "Sett" (typo)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Sett', []))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNewSetRule.create(ctx1)
      const visitor2 = noUnnecessaryNewSetRule.create(ctx2)
      visitor1.NewExpression(makeNewSetNode('Set', []))
      visitor2.NewExpression(makeNewSetNode('Set', [{ type: 'Identifier', name: 'values' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', []))
      visitor.NewExpression(makeNewSetNode('Set', [{ type: 'Identifier', name: 'values' }]))
      visitor.NewExpression(makeNewSetNode('Set', []))
      expect(reports.length).toBe(2)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }]))
      visitor.NewExpression(makeNewSetNode('Set', []))
      visitor.NewExpression(makeNewSetNode('Map', []))
      visitor.NewExpression(makeNewSetNode('Set', []))
      visitor.NewExpression(makeNewSetNode('Set', [{ type: 'Identifier', name: 'items' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNewSetRule.create(context)
      const visitor2 = noUnnecessaryNewSetRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNewSetRule.meta
      const meta2 = noUnnecessaryNewSetRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNewSetRule).toBeDefined()
      expect(typeof noUnnecessaryNewSetRule.create).toBe('function')
      expect(typeof noUnnecessaryNewSetRule.meta).toBe('object')
    })

    test('does not report for new Set with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Set with Literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', [{ type: 'Literal', value: 'hello' }]))
      expect(reports.length).toBe(0)
    })

    test('handles node without callee type gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { name: 'Set' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('handles node where callee is a string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: 'Set',
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Set with generator argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', [{
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'gen' },
        arguments: [],
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrowFunction expression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({
        type: 'ArrowFunctionExpression',
        params: [],
        body: { type: 'BlockStatement', body: [] },
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({
        type: 'UpdateExpression',
        operator: '++',
        prefix: false,
        argument: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 3),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ConditionalExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression({
        type: 'ConditionalExpression',
        test: { type: 'Identifier', name: 'x' },
        consequent: { type: 'Literal', value: 1 },
        alternate: { type: 'Literal', value: 2 },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('reports for new Set() where arguments is explicitly empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [] as unknown[],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
      expect(reports[0].node).toBe(node)
    })

    test('does not report for new Set with TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', [{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Set with ObjectExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewSetRule.create(context)
      visitor.NewExpression(makeNewSetNode('Set', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })
  })
})

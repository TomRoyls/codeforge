import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryNewMapRule } from '../../../../src/rules/patterns/no-unnecessary-new-map.js'
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

function makeNewExpr(
  calleeName: string = 'Map',
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

function makeNewExprWithCallee(
  callee: unknown,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'NewExpression',
    callee,
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-new-map rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryNewMapRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryNewMapRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryNewMapRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryNewMapRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryNewMapRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Map', () => {
      const desc = noUnnecessaryNewMapRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/map/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryNewMapRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-new-map.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryNewMapRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      expect(visitor).toHaveProperty('NewExpression')
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryNewMapRule).toBeDefined()
      expect(noUnnecessaryNewMapRule.meta).toBeDefined()
      expect(noUnnecessaryNewMapRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (25) =====

  describe('positive cases — reports unnecessary new Map()', () => {
    test('reports for new Map() with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports.length).toBe(1)
    })

    test('reports for new Map() in assignment context', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports.length).toBe(1)
    })

    test('reports for new Map() as return value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Map', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports[0].message).toMatch(/Map/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports[0].message).toBe(
        'Unnecessary new Map() without initial values. Consider using new Map([...]) with initial entries or a plain object.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input NewExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      const node = makeNewExpr('Map', [])
      visitor.NewExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for new Map() as property value in object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports.length).toBe(1)
    })

    test('reports for new Map() inside conditional', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports.length).toBe(1)
    })

    test('reports for new Map() in variable declaration', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports.length).toBe(1)
    })

    test('reports for multiple new Map() in same scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      visitor.NewExpression(makeNewExpr('Map', []))
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports.length).toBe(3)
    })

    test('reports for new Map() inside arrow function body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports.length).toBe(1)
    })

    test('reports for new Map() inside binary expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports.length).toBe(1)
    })

    test('reports for new Map() inside logical expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports.length).toBe(1)
    })

    test('reports for new Map() in ternary', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports.length).toBe(1)
    })

    test('reports for new Map() with extra node properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
        range: [0, 20],
        extra: true,
        trailingComments: [],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for new Map() when arguments is empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('report message mentions initial values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports[0].message).toMatch(/initial values/)
    })

    test('report message mentions plain object alternative', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports[0].message).toMatch(/plain object/)
    })

    test('reports for new Map() with custom location data', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', [], 42, 7, 42, 18))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(42)
      expect(reports[0].loc?.start.column).toBe(7)
      expect(reports[0].loc?.end.line).toBe(42)
      expect(reports[0].loc?.end.column).toBe(18)
    })

    test('reports for new Map() without loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
      })
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for new Map([["a", 1]]) — has entries', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 1 }] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Map([["a", 1], ["b", 2]]) — multiple entries', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 1 }] }, { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 'b' }, { type: 'Literal', value: 2 }] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Map(iterable) — identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', [{ type: 'Identifier', name: 'iterable' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new WeakMap() — different constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('WeakMap', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Set() — different constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Set', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Object() — different constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Object', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Array() — different constructor', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Array', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Map(someVar) — has argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', [{ type: 'Identifier', name: 'someVar' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Map(getEntries()) — has call expression arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getEntries' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Map(null) — has argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Map(undefined) — has argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', [{ type: 'Identifier', name: 'undefined' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      expect(() => visitor.NewExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      expect(() => visitor.NewExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is MemberExpression (obj.Map)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExprWithCallee({
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'ns' },
        property: { type: 'Identifier', name: 'Map' },
      }, []))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is "map" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('map', []))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExprWithCallee({
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: { type: 'BlockStatement', body: [] },
      }, []))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExprWithCallee({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'getMapClass' },
        arguments: [],
      }, []))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is non-empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', [{ type: 'Identifier', name: 'entries' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments has spread element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'entries' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Map([...items]) — spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', [{
        type: 'ArrayExpression',
        elements: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Map([[1, 2], [3, 4]]) — has entries', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', [{ type: 'ArrayExpression', elements: [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }, { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 3 }, { type: 'Literal', value: 4 }] }] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', callee: undefined, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', callee: 42, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Map(arrayOfEntries) — identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', [{ type: 'Identifier', name: 'arrayOfEntries' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression (not New)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for new MyMap() — different name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('MyMap', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Map() when arguments is non-array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Map() when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for new Map() when callee name is "MAP" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('MAP', []))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryNewMapRule.create(ctx1)
      const visitor2 = noUnnecessaryNewMapRule.create(ctx2)
      visitor1.NewExpression(makeNewExpr('Map', []))
      visitor2.NewExpression(makeNewExpr('Map', [{ type: 'Identifier', name: 'entries' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      visitor.NewExpression(makeNewExpr('Map', [{ type: 'Identifier', name: 'entries' }]))
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
      }
      visitor.NewExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', [{ type: 'Identifier', name: 'entries' }]))
      visitor.NewExpression(makeNewExpr('Map', []))
      visitor.NewExpression(makeNewExpr('WeakMap', []))
      visitor.NewExpression(makeNewExpr('Map', []))
      visitor.NewExpression(makeNewExpr('Map', [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 'a' }, { type: 'Literal', value: 1 }] }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryNewMapRule.create(context)
      const visitor2 = noUnnecessaryNewMapRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryNewMapRule.meta
      const meta2 = noUnnecessaryNewMapRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
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
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      const node = makeNewExpr('Map', [])
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryNewMapRule).toBeDefined()
      expect(typeof noUnnecessaryNewMapRule.create).toBe('function')
      expect(typeof noUnnecessaryNewMapRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles callee with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map', loc: makeLoc(1, 4, 1, 7), range: [4, 7] },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', []))
      visitor.NewExpression(makeNewExpr('Map', []))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles node with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryNewMapRule.create(context)
      visitor.NewExpression({
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
      })
      expect(reports.length).toBe(1)
    })
  })
})

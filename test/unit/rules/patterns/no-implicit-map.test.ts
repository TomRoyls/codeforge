import { describe, expect, test, vi } from 'vitest'
import { noImplicitMapRule } from '../../../../src/rules/patterns/no-implicit-map.js'
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
    getSource: () => 'new Map()',
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
  calleeName: string,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 10,
): unknown {
  return {
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: calleeName,
      _parent: null,
      loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
    },
    arguments: [],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-implicit-map rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noImplicitMapRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noImplicitMapRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noImplicitMapRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noImplicitMapRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noImplicitMapRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Map or Set', () => {
      const desc = noImplicitMapRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/map|set/)
    })

    test('should have correct docs URL', () => {
      expect(noImplicitMapRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-implicit-map',
      )
    })

    test('should have empty schema', () => {
      expect(noImplicitMapRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with NewExpression', () => {
      const { context } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      expect(visitor).toHaveProperty('NewExpression')
      expect(typeof visitor.NewExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noImplicitMapRule).toBeDefined()
      expect(noImplicitMapRule.meta).toBeDefined()
      expect(noImplicitMapRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (35) =====

  describe('positive cases — reports implicit Map/Set', () => {
    test('reports for new Map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map'))
      expect(reports.length).toBe(1)
    })

    test('reports for new WeakMap()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('WeakMap'))
      expect(reports.length).toBe(1)
    })

    test('reports for new Set()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Set'))
      expect(reports.length).toBe(1)
    })

    test('reports for new WeakSet()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('WeakSet'))
      expect(reports.length).toBe(1)
    })

    test('report message for Map mentions "Map"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map'))
      expect(reports[0].message).toContain('Map')
    })

    test('report message for WeakMap mentions "WeakMap"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('WeakMap'))
      expect(reports[0].message).toContain('WeakMap')
    })

    test('report message for Set mentions "Set"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Set'))
      expect(reports[0].message).toContain('Set')
    })

    test('report message for WeakSet mentions "WeakSet"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('WeakSet'))
      expect(reports[0].message).toContain('WeakSet')
    })

    test('report message mentions "type parameters"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map'))
      expect(reports[0].message.toLowerCase()).toContain('type parameters')
    })

    test('report message mentions "type safety"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map'))
      expect(reports[0].message.toLowerCase()).toContain('type safety')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input NewExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      const node = makeNewExpr('Map')
      visitor.NewExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report message for Map is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map'))
      expect(reports[0].message).toBe(
        'Avoid using Map without explicit type parameters. Consider new Map<K, V>() for better type safety.',
      )
    })

    test('report message for WeakMap is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('WeakMap'))
      expect(reports[0].message).toBe(
        'Avoid using WeakMap without explicit type parameters. Consider new WeakMap<K, V>() for better type safety.',
      )
    })

    test('report message for Set is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Set'))
      expect(reports[0].message).toBe(
        'Avoid using Set without explicit type parameters. Consider new Set<K, V>() for better type safety.',
      )
    })

    test('report message for WeakSet is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('WeakSet'))
      expect(reports[0].message).toBe(
        'Avoid using WeakSet without explicit type parameters. Consider new WeakSet<K, V>() for better type safety.',
      )
    })

    test('reports for new Map() with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map', loc: makeLoc(1, 0, 1, 3) },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
        loc: makeLoc(1, 0, 1, 14),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map'))
      visitor.NewExpression(makeNewExpr('Set'))
      expect(reports.length).toBe(2)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', 5, 10, 5, 20))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports for new Map() on different lines', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', 10, 4, 10, 14))
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(10)
    })

    test('reports for new Map() at column 0', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', 1, 0, 1, 9))
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('reports for new Map() with callee having _parent', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: {
          type: 'Identifier',
          name: 'Map',
          _parent: { type: 'VariableDeclarator' },
          loc: makeLoc(1, 0, 1, 3),
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for new Map() with empty arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map'))
      expect(reports.length).toBe(1)
    })

    test('reports for new Set() with extra node properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set', loc: makeLoc(1, 0, 1, 3) },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        leadingComments: [],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('all four types report individually', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map'))
      visitor.NewExpression(makeNewExpr('WeakMap'))
      visitor.NewExpression(makeNewExpr('Set'))
      visitor.NewExpression(makeNewExpr('WeakSet'))
      expect(reports.length).toBe(4)
    })

    test('reports for new Map() with range property', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map', loc: makeLoc(1, 0, 1, 3) },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', 3, 5, 7, 15))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(15)
    })

    test('reports for new WeakMap() with arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'WeakMap', loc: makeLoc(1, 0, 1, 7) },
        arguments: [{ type: 'Identifier', name: 'entries' }],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for new Set() with array argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set', loc: makeLoc(1, 0, 1, 3) },
        arguments: [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }],
        loc: makeLoc(1, 0, 1, 15),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('different type names produce different messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map'))
      visitor.NewExpression(makeNewExpr('Set'))
      expect(reports[0].message).not.toBe(reports[1].message)
    })

    test('same type name produces same message each time', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map'))
      visitor.NewExpression(makeNewExpr('Map'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for new WeakSet() with iterable argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'WeakSet', loc: makeLoc(1, 0, 1, 7) },
        arguments: [{ type: 'Identifier', name: 'objects' }],
        loc: makeLoc(1, 0, 1, 18),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(1)
    })

    test('report message contains "Avoid using"', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map'))
      expect(reports[0].message).toContain('Avoid using')
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (30) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for new Array()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Array'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Object()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Object'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Date()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Date'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new RegExp()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('RegExp'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Promise()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Promise'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Error()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Error'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new MyClass()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('MyClass'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new Foo()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Foo'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new map() (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('map'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new set() (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('set'))
      expect(reports.length).toBe(0)
    })

    test('does not report for new MAP() (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('MAP'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      expect(() => visitor.NewExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      expect(() => visitor.NewExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      expect(() => visitor.NewExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      expect(() => visitor.NewExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      expect(() => visitor.NewExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean node', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      expect(() => visitor.NewExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for array node', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      expect(() => visitor.NewExpression([])).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'ns' },
          property: { type: 'Identifier', name: 'Map' },
          loc: makeLoc(1, 0, 1, 7),
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is a FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee has no name property', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', loc: makeLoc(1, 0, 1, 3) },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when callee name is empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr(''))
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression({ type: 'Identifier', name: 'Map', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for Literal node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression({ type: 'Literal', value: 'test', loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ExpressionStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression({ type: 'ExpressionStatement', expression: {}, loc: makeLoc(1, 0, 1, 1) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      const node = {
        type: 'NewExpression',
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for new ArrayBuffer()', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('ArrayBuffer'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noImplicitMapRule.create(ctx1)
      const visitor2 = noImplicitMapRule.create(ctx2)
      visitor1.NewExpression(makeNewExpr('Map'))
      visitor2.NewExpression(makeNewExpr('Array'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map'))
      visitor.NewExpression(makeNewExpr('Array'))
      visitor.NewExpression(makeNewExpr('Set'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
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
      const visitor = noImplicitMapRule.create(context)
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
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Array'))
      visitor.NewExpression(makeNewExpr('Map'))
      visitor.NewExpression(makeNewExpr('Object'))
      visitor.NewExpression(makeNewExpr('Set'))
      visitor.NewExpression(makeNewExpr('Date'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noImplicitMapRule.create(context)
      const visitor2 = noImplicitMapRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noImplicitMapRule.meta
      const meta2 = noImplicitMapRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map', loc: makeLoc(1, 0, 1, 3) },
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
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [], loc: {} })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [], loc: { start: { line: 3, column: 5 } } })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      const node = makeNewExpr('Map')
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      visitor.NewExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noImplicitMapRule).toBeDefined()
      expect(typeof noImplicitMapRule.create).toBe('function')
      expect(typeof noImplicitMapRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [], loc: makeLoc(1, 0, 1, 10), _parent: {} })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map'))
      visitor.NewExpression(makeNewExpr('Set'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('Map')
      expect(reports[1].message).toContain('Set')
    })

    test('handles node with callee having no type', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { name: 'Map' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles callee name as number', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 42, loc: makeLoc(1, 0, 1, 3) },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles callee name as null', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: null, loc: makeLoc(1, 0, 1, 3) },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles callee as null directly', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: null,
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('handles callee as undefined directly', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      const node = {
        type: 'NewExpression',
        callee: undefined,
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.NewExpression(node)
      expect(reports.length).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noImplicitMapRule.create(context)
      visitor.NewExpression(makeNewExpr('Map', 10, 4, 10, 14))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(14)
    })
  })
})

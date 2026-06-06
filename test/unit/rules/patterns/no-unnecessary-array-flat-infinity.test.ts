import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayFlatInfinityRule } from '../../../../src/rules/patterns/index.js'
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

function makeFlatCallNode(
  object: unknown,
  methodName: string,
  args: unknown[] = [],
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeId(name: string): unknown {
  return { type: 'Identifier', name }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-flat-infinity rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayFlatInfinityRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayFlatInfinityRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayFlatInfinityRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayFlatInfinityRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayFlatInfinityRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning flat', () => {
      const desc = noUnnecessaryArrayFlatInfinityRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/flat/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayFlatInfinityRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-flat-infinity.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayFlatInfinityRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayFlatInfinityRule).toBeDefined()
      expect(noUnnecessaryArrayFlatInfinityRule.meta).toBeDefined()
      expect(noUnnecessaryArrayFlatInfinityRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports flat(Infinity)', () => {
    test('reports for arr.flat(Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.flat(Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('obj'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for nested.arr.flat(Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      const nestedObj = { type: 'MemberExpression', object: makeId('nested'), property: { type: 'Identifier', name: 'arr' } }
      visitor.CallExpression(makeFlatCallNode(nestedObj, 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for getArr().flat(Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      const callObj = { type: 'CallExpression', callee: makeId('getArr'), arguments: [] }
      visitor.CallExpression(makeFlatCallNode(callObj, 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for [].flat(Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      const arrObj = { type: 'ArrayExpression', elements: [] }
      visitor.CallExpression(makeFlatCallNode(arrObj, 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for results.flat(Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('results'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for (a || b).flat(Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      const logicalObj = { type: 'LogicalExpression', operator: '||', left: makeId('a'), right: makeId('b') }
      visitor.CallExpression(makeFlatCallNode(logicalObj, 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for this.items.flat(Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      const thisObj = { type: 'MemberExpression', object: { type: 'ThisExpression' }, property: { type: 'Identifier', name: 'items' } }
      visitor.CallExpression(makeFlatCallNode(thisObj, 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions flat(Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports[0].message).toMatch(/flat/)
      expect(reports[0].message).toMatch(/Infinity/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports[0].message).toBe(
        'arr.flat(Infinity) is the same as arr.flat() with no depth. Use arr.flat() without an argument.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      const node = makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      visitor.CallExpression(makeFlatCallNode(makeId('obj'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      visitor.CallExpression(makeFlatCallNode(makeId('obj'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: makeId('arr'),
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports for node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: makeId('arr'),
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports for node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: makeId('arr'),
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports for node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: makeId('arr'),
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with default location when node has no loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: makeId('arr'),
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      const node = makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports for node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: makeId('arr'),
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat'))
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Literal', value: 1 }]))
      visitor.CallExpression(makeFlatCallNode(makeId('obj'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'map', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(2)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      visitor.CallExpression(makeFlatCallNode(makeId('obj'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for [1, 2, 3].flat(Infinity) — ArrayExpression object with elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      const arrObj = { type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] }
      visitor.CallExpression(makeFlatCallNode(arrObj, 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.flat() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(2)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(-1)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Literal', value: -1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(3)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Literal', value: 3 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(100)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Literal', value: 100 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flat(NaN)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Literal', value: NaN }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(Infinity) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'map', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.reduce(Infinity) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'reduce', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(Infinity) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'filter', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.flatMap(Infinity) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flatMap', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.slice(Infinity) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'slice', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for computed property arr["flat"](Infinity)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: makeId('arr'),
          property: { type: 'Literal', value: 'flat' },
        },
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not MemberExpression (plain function call)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: makeId('flat'),
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
        loc: makeLoc(1, 0, 1, 5),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'Identifier', name: 'Infinity' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'Identifier', name: 'Infinity' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is an Identifier (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'Identifier', name: 'Infinity' }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier (Literal property)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: makeId('arr'),
          property: { type: 'Literal', value: 'flat' },
        },
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Flat" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'Flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "FLAT" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'FLAT', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "flatmap"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flatmap', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is Literal (Infinity is an Identifier in source)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Literal', value: Infinity }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'depth' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }, { type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report with three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }, { type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: makeId('arr'),
        },
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: makeId('arr'),
          property: null,
        },
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayFlatInfinityRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayFlatInfinityRule.create(ctx2)
      visitor1.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      visitor2.CallExpression(makeFlatCallNode(makeId('arr'), 'flat'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat'))
      visitor.CallExpression(makeFlatCallNode(makeId('obj'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: makeId('arr'),
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: makeId('arr'),
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly across edge cases', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat'))
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Literal', value: 1 }]))
      visitor.CallExpression(makeFlatCallNode(makeId('obj'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'map', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayFlatInfinityRule.create(context)
      const visitor2 = noUnnecessaryArrayFlatInfinityRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayFlatInfinityRule.meta
      const meta2 = noUnnecessaryArrayFlatInfinityRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: makeId('arr'),
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: makeId('arr'),
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: makeId('arr'),
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      const node = makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayFlatInfinityRule).toBeDefined()
      expect(typeof noUnnecessaryArrayFlatInfinityRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayFlatInfinityRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: makeId('arr'),
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles non-computed member expression correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: makeId('arr'),
          property: { type: 'Identifier', name: 'flat' },
        },
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: makeId('arr'),
          property: { type: 'Literal', value: 'flat' },
        },
        arguments: [{ type: 'Identifier', name: 'Infinity' }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayFlatInfinityRule.create(context)
      visitor.CallExpression(makeFlatCallNode(makeId('arr'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      visitor.CallExpression(makeFlatCallNode(makeId('obj'), 'flat', [{ type: 'Identifier', name: 'Infinity' }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

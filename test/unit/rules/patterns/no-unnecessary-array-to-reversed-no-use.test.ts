import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayToReversedNoUse } from '../../../../src/rules/patterns/no-unnecessary-array-to-reversed-no-use.js'
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

function makeCallNode(
  object: unknown,
  methodName: string,
  args: unknown[] = [],
  parent: unknown = { type: 'ExpressionStatement' },
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object,
      property: { type: 'Identifier', name: methodName },
      computed: false,
    },
    arguments: args,
    parent,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeIdent(name: string): unknown {
  return { type: 'Identifier', name }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-to-reversed-no-use rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayToReversedNoUse.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayToReversedNoUse.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayToReversedNoUse.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayToReversedNoUse.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayToReversedNoUse.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toReversed or toSorted', () => {
      const desc = noUnnecessaryArrayToReversedNoUse.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/toreversed|tosorted/)
    })

    test('should have a docs URL', () => {
      expect(noUnnecessaryArrayToReversedNoUse.meta.docs?.url).toBeTruthy()
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayToReversedNoUse.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayToReversedNoUse).toBeDefined()
      expect(noUnnecessaryArrayToReversedNoUse.meta).toBeDefined()
      expect(noUnnecessaryArrayToReversedNoUse.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (35) =====

  describe('positive cases — reports unnecessary toReversed/toSorted as statement', () => {
    test('reports for arr.toReversed() as ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed'))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.toSorted() as ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for myArray.toReversed() as ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('myArray'), 'toReversed'))
      expect(reports.length).toBe(1)
    })

    test('reports for items.toSorted() as ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('items'), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions toReversed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed'))
      expect(reports[0].message).toMatch(/toReversed/)
    })

    test('report message mentions toSorted', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toSorted'))
      expect(reports[0].message).toMatch(/toSorted/)
    })

    test('report message mentions result is not used', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed'))
      expect(reports[0].message).toMatch(/not used/)
    })

    test('report message mentions methods return new array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed'))
      expect(reports[0].message).toMatch(/new array/)
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      const node = makeCallNode(makeIdent('arr'), 'toReversed')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed', [], { type: 'ExpressionStatement' }, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('reports for chained member expression arr.nested.toReversed()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      const obj = { type: 'MemberExpression', object: makeIdent('arr'), property: makeIdent('nested'), computed: false }
      visitor.CallExpression(makeCallNode(obj, 'toReversed'))
      expect(reports.length).toBe(1)
    })

    test('reports for function result getArr().toReversed()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      const obj = { type: 'CallExpression', callee: makeIdent('getArr'), arguments: [] }
      visitor.CallExpression(makeCallNode(obj, 'toReversed'))
      expect(reports.length).toBe(1)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed'))
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toSorted'))
      expect(reports.length).toBe(2)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports toReversed() with correct message text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed'))
      expect(reports[0].message).toBe(
        'toReversed() result is not used. These methods return a new array without mutating the original.',
      )
    })

    test('reports toSorted() with correct message text', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toSorted'))
      expect(reports[0].message).toBe(
        'toSorted() result is not used. These methods return a new array without mutating the original.',
      )
    })

    test('reports for array literal [].toReversed() as ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'toReversed'))
      expect(reports.length).toBe(1)
    })

    test('reports for array literal [1,2,3].toSorted() as ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] }, 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for call result getItems().toReversed() as ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: makeIdent('getItems'), arguments: [] }, 'toReversed'))
      expect(reports.length).toBe(1)
    })

    test('reports for this.data.toReversed() as ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      const obj = { type: 'MemberExpression', object: { type: 'ThisExpression' }, property: makeIdent('data'), computed: false }
      visitor.CallExpression(makeCallNode(obj, 'toReversed'))
      expect(reports.length).toBe(1)
    })

    test('reports for arr?.toReversed() (optional chain) as ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'toReversed' },
          computed: false,
          optional: true,
        },
        arguments: [],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 20),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('all reports have the same message format for toReversed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('a'), 'toReversed'))
      visitor.CallExpression(makeCallNode(makeIdent('b'), 'toReversed'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for data.toReversed() with computed:false member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('data'), 'toReversed'))
      expect(reports.length).toBe(1)
    })

    test('reports for list.toSorted() with computed:false member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('list'), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('report loc end values are preserved', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed', [], { type: 'ExpressionStatement' }, 3, 5, 3, 22))
      expect(reports[0].loc?.end.line).toBe(3)
      expect(reports[0].loc?.end.column).toBe(22)
    })

    test('multiple toReversed calls accumulate correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('a'), 'toReversed'))
      visitor.CallExpression(makeCallNode(makeIdent('b'), 'toReversed'))
      visitor.CallExpression(makeCallNode(makeIdent('c'), 'toReversed'))
      expect(reports.length).toBe(3)
    })

    test('mixed toReversed and toSorted calls accumulate correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('a'), 'toReversed'))
      visitor.CallExpression(makeCallNode(makeIdent('b'), 'toSorted'))
      visitor.CallExpression(makeCallNode(makeIdent('c'), 'toReversed'))
      expect(reports.length).toBe(3)
    })

    test('reports for array spread [...arr].toReversed() as ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      const obj = { type: 'ArrayExpression', elements: [{ type: 'SpreadElement', argument: makeIdent('arr') }] }
      visitor.CallExpression(makeCallNode(obj, 'toReversed'))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.toReversed() when parent is explicitly ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed', [], { type: 'ExpressionStatement', directive: undefined }))
      expect(reports.length).toBe(1)
    })

    test('reports for deeply nested member obj.prop.list.toSorted()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      const inner = { type: 'MemberExpression', object: { type: 'MemberExpression', object: makeIdent('obj'), property: makeIdent('prop'), computed: false }, property: makeIdent('list'), computed: false }
      visitor.CallExpression(makeCallNode(inner, 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.toReversed() inside block statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed', [], { type: 'ExpressionStatement' }))
      expect(reports.length).toBe(1)
    })

    test('reports for arr.toSorted() inside block statement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toSorted', [], { type: 'ExpressionStatement' }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (30) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for arr.toReversed() when result is assigned', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      const parent = { type: 'VariableDeclarator', id: makeIdent('x'), init: null }
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed', [], parent))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSorted() when result is returned', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      const parent = { type: 'ReturnStatement', argument: null }
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toSorted', [], parent))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toReversed() when chained with .map()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      const parent = { type: 'MemberExpression', object: null, property: makeIdent('map'), computed: false }
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed', [], parent))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toReversed() when parent is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      const parent = { type: 'CallExpression', callee: null, arguments: [] }
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed', [], parent))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.reverse() — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'reverse'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.sort() — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSorted(fn) — has arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      const arg = { type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }], body: { type: 'BinaryExpression', operator: '-', left: makeIdent('a'), right: makeIdent('b') } }
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toSorted', [arg]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toReversed(x) — has arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed', [makeIdent('x')]))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map(fn) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'map'))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter(fn) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Literal', value: 'toReversed' },
          computed: false,
        },
        arguments: [],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "toReversed" with wrong parent type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      const parent = { type: 'VariableDeclarator' }
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed', [], parent))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed (bracket notation)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'toReversed' },
          computed: true,
        },
        arguments: [],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when parent property is absent from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'toReversed' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when parent type is ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed', [], { type: 'ConditionalExpression' }))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent type is BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed', [], { type: 'BinaryExpression' }))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent type is AssignmentExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed', [], { type: 'AssignmentExpression' }))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "toreversed" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toreversed'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "tosorted" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'tosorted'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: null,
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when parent type is LogicalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed', [], { type: 'LogicalExpression' }))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayToReversedNoUse.create(ctx1)
      const visitor2 = noUnnecessaryArrayToReversedNoUse.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed'))
      visitor2.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed', [makeIdent('x')]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed'))
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed', [makeIdent('x')]))
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toSorted'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'toReversed' },
          computed: false,
        },
        arguments: [],
        parent: { type: 'ExpressionStatement' },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'toReversed' },
          computed: false,
        },
        arguments: [],
        parent: { type: 'ExpressionStatement' },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed')) // report
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed', [makeIdent('x')])) // no report
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toSorted')) // report
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toSorted', [], { type: 'VariableDeclarator' })) // no report
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'reverse')) // no report
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayToReversedNoUse.create(context)
      const visitor2 = noUnnecessaryArrayToReversedNoUse.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayToReversedNoUse.meta
      const meta2 = noUnnecessaryArrayToReversedNoUse.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'toReversed' },
          computed: false,
        },
        arguments: [],
        parent: { type: 'ExpressionStatement' },
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
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'toReversed' },
          computed: false,
        },
        arguments: [],
        parent: { type: 'ExpressionStatement' },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'toReversed' },
          computed: false,
        },
        arguments: [],
        parent: { type: 'ExpressionStatement' },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      const node = makeCallNode(makeIdent('arr'), 'toReversed')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayToReversedNoUse).toBeDefined()
      expect(typeof noUnnecessaryArrayToReversedNoUse.create).toBe('function')
      expect(typeof noUnnecessaryArrayToReversedNoUse.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'toReversed' },
          computed: false,
        },
        arguments: [],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed', [], { type: 'ExpressionStatement' }, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles non-computed member expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Identifier', name: 'toReversed' },
          computed: false,
        },
        arguments: [],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeIdent('arr'),
          property: { type: 'Literal', value: 'toReversed' },
          computed: true,
        },
        arguments: [],
        parent: { type: 'ExpressionStatement' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed'))
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toSorted'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('toReversed')
      expect(reports[1].message).toContain('toSorted')
    })

    test('does not report when parent is IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed', [], { type: 'IfStatement' }))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is WhileStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed', [], { type: 'WhileStatement' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for toSpliced() — not in rule scope', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toSpliced'))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent type is TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayToReversedNoUse.create(context)
      visitor.CallExpression(makeCallNode(makeIdent('arr'), 'toReversed', [], { type: 'TemplateLiteral' }))
      expect(reports.length).toBe(0)
    })
  })
})

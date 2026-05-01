import { describe, expect, test, vi } from 'vitest'
import { noUnnecessarySpreadArrayRule } from '../../../../src/rules/patterns/no-unnecessary-spread-array.js'
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

function makeSpreadArrayNode(argument: unknown, locStartLine = 1, locStartCol = 0, locEndLine = 1, locEndCol = 20): unknown {
  return {
    type: 'ArrayExpression',
    elements: [
      {
        type: 'SpreadElement',
        argument,
      },
    ],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeArrayExpr(elements: unknown[]): unknown {
  return { type: 'ArrayExpression', elements }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-spread-array rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessarySpreadArrayRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessarySpreadArrayRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessarySpreadArrayRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessarySpreadArrayRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessarySpreadArrayRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning spread', () => {
      const desc = noUnnecessarySpreadArrayRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/spread/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessarySpreadArrayRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-spread-array.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessarySpreadArrayRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with ArrayExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      expect(visitor).toHaveProperty('ArrayExpression')
      expect(typeof visitor.ArrayExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessarySpreadArrayRule).toBeDefined()
      expect(noUnnecessarySpreadArrayRule.meta).toBeDefined()
      expect(noUnnecessarySpreadArrayRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary spread of array literal', () => {
    test('reports for [...[1, 2, 3]]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }])))
      expect(reports.length).toBe(1)
    })

    test('reports for [...[1, 2]]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }])))
      expect(reports.length).toBe(1)
    })

    test('reports for [...["hello"]]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 'hello' }])))
      expect(reports.length).toBe(1)
    })

    test('reports for [...[42]]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 42 }])))
      expect(reports.length).toBe(1)
    })

    test('reports for [...[true, false]]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: true }, { type: 'Literal', value: false }])))
      expect(reports.length).toBe(1)
    })

    test('reports for [...[a, b]] — identifier elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }])))
      expect(reports.length).toBe(1)
    })

    test('reports for [...[[]]] — nested empty array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([makeArrayExpr([])])))
      expect(reports.length).toBe(1)
    })

    test('reports for [...[null]] — null element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: null }])))
      expect(reports.length).toBe(1)
    })

    test('reports for [...[1, 2, 3, 4, 5]] — five elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([
        { type: 'Literal', value: 1 },
        { type: 'Literal', value: 2 },
        { type: 'Literal', value: 3 },
        { type: 'Literal', value: 4 },
        { type: 'Literal', value: 5 },
      ])))
      expect(reports.length).toBe(1)
    })

    test('reports for [...[{ key: "value" }]] — object element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'ObjectExpression', properties: [] }])))
      expect(reports.length).toBe(1)
    })

    test('reports for empty inner array [...[]]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([])))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 1 }])))
      expect(reports[0].message).toMatch(/unnecessary/i)
    })

    test('report message mentions array literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 1 }])))
      expect(reports[0].message).toMatch(/array/i)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 1 }])))
      expect(reports[0].message).toBe(
        'Unnecessary spread of an array literal into a new array. Use the inner array directly or avoid the redundant wrapping.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 1 }])))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 1 }])))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input ArrayExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      const node = makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 1 }]))
      visitor.ArrayExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 1 }])))
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 2 }])))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 1 }])))
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([])))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for spread of array with ArrowFunction element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }])))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of array with TemplateLiteral element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'TemplateLiteral', quasis: [], expressions: [] }])))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of array with ConditionalExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }])))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of array with regex element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: /test/ }])))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of array with SpreadElement inside', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'other' } }])))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 1 }])))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for spread of array with CallExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }])))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of array with MemberExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' } }])))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of array with UnaryExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 1 } }])))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of array with ten elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      const elems = Array.from({ length: 10 }, (_, i) => ({ type: 'Literal', value: i }))
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr(elems)))
      expect(reports.length).toBe(1)
    })

    test('reports for spread of nested array literal [...[[1, 2], [3, 4]]]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([
        makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]),
        makeArrayExpr([{ type: 'Literal', value: 3 }, { type: 'Literal', value: 4 }]),
      ])))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for simple array [1, 2, 3]', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for [...arr] — spread of identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode({ type: 'Identifier', name: 'arr' }))
      expect(reports.length).toBe(0)
    })



    test('does not report for [...arr, 4] — spread with additional element (2 elements)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({
        type: 'ArrayExpression',
        elements: [
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
          { type: 'Literal', value: 4 },
        ],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for [1, ...arr] — spread after element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 1 },
          { type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } },
        ],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for { ...obj } — object spread, not array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({ type: 'ObjectExpression', properties: [] })
      expect(reports.length).toBe(0)
    })

    test('does not report for empty array []', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeArrayExpr([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for [1] — single element no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeArrayExpr([{ type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for [a, b] — two elements no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeArrayExpr([{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for [...fn()] — spread of call expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for [...obj.prop] — spread of member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report for [...new Set()] — spread of NewExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      expect(() => visitor.ArrayExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      expect(() => visitor.ArrayExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      expect(() => visitor.ArrayExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      expect(() => visitor.ArrayExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      expect(() => visitor.ArrayExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      expect(() => visitor.ArrayExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when ArrayExpression has 2 spread elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({
        type: 'ArrayExpression',
        elements: [
          { type: 'SpreadElement', argument: makeArrayExpr([{ type: 'Literal', value: 1 }]) },
          { type: 'SpreadElement', argument: makeArrayExpr([{ type: 'Literal', value: 2 }]) },
        ],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when ArrayExpression has 3 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({
        type: 'ArrayExpression',
        elements: [
          { type: 'SpreadElement', argument: makeArrayExpr([{ type: 'Literal', value: 1 }]) },
          { type: 'Literal', value: 2 },
          { type: 'Literal', value: 3 },
        ],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when ArrayExpression elements is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({ type: 'ArrayExpression', elements: 'not-array' })
      expect(reports.length).toBe(0)
    })

    test('does not report when ArrayExpression elements is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({ type: 'ArrayExpression', elements: null })
      expect(reports.length).toBe(0)
    })

    test('does not report when ArrayExpression elements is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({ type: 'ArrayExpression' })
      expect(reports.length).toBe(0)
    })

    test('does not report when single element is not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({
        type: 'ArrayExpression',
        elements: [{ type: 'Literal', value: 1 }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first element is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({
        type: 'ArrayExpression',
        elements: [null],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when SpreadElement argument is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode({ type: 'Identifier', name: 'arr' }))
      expect(reports.length).toBe(0)
    })

    test('does not report when SpreadElement argument is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report when SpreadElement argument is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report when SpreadElement argument is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({
        type: 'ArrayExpression',
        elements: [{ type: 'SpreadElement' }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when SpreadElement argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({
        type: 'ArrayExpression',
        elements: [{ type: 'SpreadElement', argument: null }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when SpreadElement argument type is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report when SpreadElement argument type is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode({ type: 'Literal', value: 'str' }))
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when SpreadElement argument is a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({
        type: 'ArrayExpression',
        elements: [{ type: 'SpreadElement', argument: 'not-a-node' }],
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when first element is a string primitive', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({
        type: 'ArrayExpression',
        elements: ['not-a-node'],
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessarySpreadArrayRule.create(ctx1)
      const visitor2 = noUnnecessarySpreadArrayRule.create(ctx2)
      visitor1.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 1 }])))
      visitor2.ArrayExpression(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 1 }])))
      visitor.ArrayExpression(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 'x' }])))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      const node = {
        type: 'ArrayExpression',
        elements: [
          {
            type: 'SpreadElement',
            argument: makeArrayExpr([{ type: 'Literal', value: 1 }]),
          },
        ],
      }
      visitor.ArrayExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      const node = {
        type: 'ArrayExpression',
        elements: [
          {
            type: 'SpreadElement',
            argument: makeArrayExpr([{ type: 'Literal', value: 1 }]),
          },
        ],
      }
      visitor.ArrayExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]))
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([])))
      visitor.ArrayExpression(makeSpreadArrayNode({ type: 'Identifier', name: 'arr' }))
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 'x' }])))
      visitor.ArrayExpression(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessarySpreadArrayRule.create(context)
      const visitor2 = noUnnecessarySpreadArrayRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessarySpreadArrayRule.meta
      const meta2 = noUnnecessarySpreadArrayRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      const node = {
        type: 'ArrayExpression',
        elements: [
          {
            type: 'SpreadElement',
            argument: makeArrayExpr([{ type: 'Literal', value: 1 }]),
          },
        ],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.ArrayExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({
        type: 'ArrayExpression',
        elements: [
          {
            type: 'SpreadElement',
            argument: makeArrayExpr([{ type: 'Literal', value: 1 }]),
          },
        ],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({
        type: 'ArrayExpression',
        elements: [
          {
            type: 'SpreadElement',
            argument: makeArrayExpr([{ type: 'Literal', value: 1 }]),
          },
        ],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      const node = makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 1 }]))
      visitor.ArrayExpression(node)
      visitor.ArrayExpression(node)
      visitor.ArrayExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessarySpreadArrayRule).toBeDefined()
      expect(typeof noUnnecessarySpreadArrayRule.create).toBe('function')
      expect(typeof noUnnecessarySpreadArrayRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression({
        type: 'ArrayExpression',
        elements: [
          {
            type: 'SpreadElement',
            argument: makeArrayExpr([{ type: 'Literal', value: 1 }]),
          },
        ],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessarySpreadArrayRule.create(context)
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([{ type: 'Literal', value: 1 }])))
      visitor.ArrayExpression(makeSpreadArrayNode(makeArrayExpr([])))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

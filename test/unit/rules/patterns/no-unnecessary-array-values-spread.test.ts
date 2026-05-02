import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayValuesSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-array-values-spread.js'
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
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): any {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function withSpreadParent(node: any): any {
  node._parent = { type: 'SpreadElement' }
  return node
}

// ===== META TESTS (8) =====

describe('no-unnecessary-array-values-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayValuesSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayValuesSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayValuesSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayValuesSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayValuesSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning values', () => {
      const desc = noUnnecessaryArrayValuesSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/values/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayValuesSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-values-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayValuesSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayValuesSpreadRule).toBeDefined()
      expect(noUnnecessaryArrayValuesSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryArrayValuesSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (24) =====

  describe('positive cases — reports unnecessary .values() spread', () => {
    test('reports for Identifier object .values() spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values')))
      expect(reports.length).toBe(1)
    })

    test('reports for MemberExpression object .values() spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'values')))
      expect(reports.length).toBe(1)
    })

    test('reports for CallExpression object .values() spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'values')))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrayExpression object .values() spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }, 'values')))
      expect(reports.length).toBe(1)
    })

    test('reports for ObjectExpression object .values() spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'values')))
      expect(reports.length).toBe(1)
    })

    test('reports for ThisExpression object .values() spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'ThisExpression' }, 'values')))
      expect(reports.length).toBe(1)
    })

    test('reports for Literal object .values() spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Literal', value: 'hello' }, 'values')))
      expect(reports.length).toBe(1)
    })

    test('reports for FunctionExpression object .values() spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'values')))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrowFunctionExpression object .values() spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'values')))
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression object .values() spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } }, 'values')))
      expect(reports.length).toBe(1)
    })

    test('reports for NewExpression object .values() spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] }, 'values')))
      expect(reports.length).toBe(1)
    })

    test('reports for TemplateLiteral object .values() spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'values')))
      expect(reports.length).toBe(1)
    })

    test('report message mentions values spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values')))
      expect(reports[0].message).toMatch(/values/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values')))
      expect(reports[0].message).toBe(
        '[...arr.values()] is equivalent to [...arr]. Use direct spread instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values')))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values')))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      const node = withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values'))
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values', [], 5, 10, 5, 30)))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'a' }, 'values')))
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'b' }, 'values')))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'a' }, 'values')))
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'b' }, 'values')))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values')))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports with explicit computed: false on callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'values')
      node.callee.computed = false
      visitor.CallExpression(withSpreadParent(node))
      expect(reports.length).toBe(1)
    })

    test('reports for UnaryExpression object .values() spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }, 'values')))
      expect(reports.length).toBe(1)
    })

    test('reports for SequenceExpression object .values() spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] }, 'values')))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (45) =====

  describe('negative cases — does NOT report', () => {
    test('does not report when _parent is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values'))
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'values')
      node._parent = null
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent type is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'values')
      node._parent = { type: 'CallExpression' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent type is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'values')
      node._parent = { type: 'MemberExpression' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent type is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'values')
      node._parent = { type: 'ArrayExpression' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent type is ForOfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'values')
      node._parent = { type: 'ForOfStatement' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent type is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'values')
      node._parent = { type: 'ObjectExpression' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent type is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'values')
      node._parent = { type: 'Literal' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when _parent is empty object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'values')
      node._parent = {}
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.values(x) — one argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'values', [{ type: 'Identifier', name: 'x' }])
      node._parent = { type: 'SpreadElement' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.values(x, y) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'values', [{ type: 'Identifier', name: 'x' }, { type: 'Identifier', name: 'y' }])
      node._parent = { type: 'SpreadElement' }
      visitor.CallExpression(node)
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.keys() — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys')))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.entries() — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'entries')))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.forEach() — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach')))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.map() — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map')))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.filter() — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter')))
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.find() — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find')))
      expect(reports.length).toBe(0)
    })

    test('does not report for "Values" (uppercase V)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'Values')))
      expect(reports.length).toBe(0)
    })

    test('does not report for "value" (singular)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'value')))
      expect(reports.length).toBe(0)
    })

    test('does not report for "VALUES" (all uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'VALUES')))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'values' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'values' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: { type: 'SpreadElement' },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for FunctionExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] }, loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UpdateExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression({ type: 'UpdateExpression', operator: '++', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
        _parent: { type: 'SpreadElement' },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'values' },
        },
        loc: makeLoc(1, 0, 1, 10),
        _parent: { type: 'SpreadElement' },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: 'not-array',
        loc: makeLoc(1, 0, 1, 10),
        _parent: { type: 'SpreadElement' },
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.some() — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some')))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayValuesSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryArrayValuesSpreadRule.create(ctx2)
      visitor1.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'a' }, 'values')))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly across mixed valid/invalid', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values')))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values'))
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys')))
      expect(reports.length).toBe(1)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: [],
        _parent: { type: 'SpreadElement' },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: [],
        _parent: { type: 'SpreadElement' },
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values'))
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values')))
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'keys')))
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values')))
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'entries')))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayValuesSpreadRule.create(context)
      const visitor2 = noUnnecessaryArrayValuesSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayValuesSpreadRule.meta
      const meta2 = noUnnecessaryArrayValuesSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      const node = withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values'))
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayValuesSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryArrayValuesSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryArrayValuesSpreadRule.meta).toBe('object')
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values', [], 10, 4, 10, 25)))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed: false on MemberExpression — reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'values' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: { type: 'SpreadElement' },
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with extra properties — reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
        _parent: { type: 'SpreadElement' },
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'a' }, 'values')))
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'b' }, 'values')))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('node with _parent SpreadElement and other _parent properties — reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'values')
      node._parent = { type: 'SpreadElement', argument: { type: 'Identifier', name: 'x' } }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('calling visitor with non-matching then matching node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values'))
      visitor.CallExpression(withSpreadParent(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values')))
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object — reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: [],
        loc: {},
        _parent: { type: 'SpreadElement' },
      })
      expect(reports.length).toBe(1)
    })
  })
})

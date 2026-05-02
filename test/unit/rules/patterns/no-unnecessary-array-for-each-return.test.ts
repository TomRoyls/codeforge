import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryArrayForEachReturn } from '../../../../src/rules/patterns/no-unnecessary-array-for-each-return.js'
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

function makeReturnParent(): unknown {
  return { type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 30) }
}

function makeCallNode(
  object: unknown,
  methodName: string,
  args: unknown[] = [],
  parent?: unknown,
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
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
    ...(parent !== undefined ? { parent } : {}),
  }
}

const cb = () => [{ type: 'Identifier', name: 'fn' }]

// ===== META TESTS (8) =====

describe('no-unnecessary-array-for-each-return rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryArrayForEachReturn.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryArrayForEachReturn.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryArrayForEachReturn.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryArrayForEachReturn.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryArrayForEachReturn.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning forEach', () => {
      const desc = noUnnecessaryArrayForEachReturn.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/foreach/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryArrayForEachReturn.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-array-for-each-return.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryArrayForEachReturn.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryArrayForEachReturn).toBeDefined()
      expect(noUnnecessaryArrayForEachReturn.meta).toBeDefined()
      expect(noUnnecessaryArrayForEachReturn.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary forEach return', () => {
    test('reports for return arr.forEach(fn) — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), makeReturnParent()))
      expect(reports.length).toBe(1)
    })

    test('reports for return [1,2,3].forEach(fn) — ArrayExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] }, 'forEach', cb(), makeReturnParent()))
      expect(reports.length).toBe(1)
    })

    test('reports with arrow function callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BlockStatement', body: [] } }], makeReturnParent()))
      expect(reports.length).toBe(1)
    })

    test('reports with identifier callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [{ type: 'Identifier', name: 'myCallback' }], makeReturnParent()))
      expect(reports.length).toBe(1)
    })

    test('reports with member expression callback (obj.method)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'method' } }], makeReturnParent()))
      expect(reports.length).toBe(1)
    })

    test('reports with function expression callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [{ type: 'FunctionExpression', id: null, params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BlockStatement', body: [] } }], makeReturnParent()))
      expect(reports.length).toBe(1)
    })

    test('reports with call expression callback (getFn())', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getFn' }, arguments: [] }], makeReturnParent()))
      expect(reports.length).toBe(1)
    })

    test('reports with object expression callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [{ type: 'ObjectExpression', properties: [] }], makeReturnParent()))
      expect(reports.length).toBe(1)
    })

    test('reports with conditional expression callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } }], makeReturnParent()))
      expect(reports.length).toBe(1)
    })

    test('reports with template literal callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [{ type: 'TemplateLiteral', quasis: [], expressions: [] }], makeReturnParent()))
      expect(reports.length).toBe(1)
    })

    test('reports with spread element callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'fns' } }], makeReturnParent()))
      expect(reports.length).toBe(1)
    })

    test('reports with nested array callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [{ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }] }], makeReturnParent()))
      expect(reports.length).toBe(1)
    })

    test('reports with regex literal callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [{ type: 'Literal', value: /test/ }], makeReturnParent()))
      expect(reports.length).toBe(1)
    })

    test('reports with boolean literal callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [{ type: 'Literal', value: true }], makeReturnParent()))
      expect(reports.length).toBe(1)
    })

    test('report message mentions forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), makeReturnParent()))
      expect(reports[0].message).toMatch(/forEach/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), makeReturnParent()))
      expect(reports[0].message).toBe(
        'Returning the result of forEach() is unnecessary. forEach() always returns undefined.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), makeReturnParent()))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), makeReturnParent()))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), makeReturnParent())
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), makeReturnParent(), 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), makeReturnParent()))
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'forEach', cb(), makeReturnParent()))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), makeReturnParent()))
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'forEach', cb(), makeReturnParent()))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), makeReturnParent()))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports with MemberExpression callee object (obj.arr.forEach)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'forEach', cb(), makeReturnParent()))
      expect(reports.length).toBe(1)
    })

    test('reports with CallExpression callee object (getArr().forEach)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'forEach', cb(), makeReturnParent()))
      expect(reports.length).toBe(1)
    })

    test('reports with extra properties on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: cb(),
        loc: makeLoc(1, 0, 1, 10),
        parent: makeReturnParent(),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('reports with _parent property on node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: cb(),
        loc: makeLoc(1, 0, 1, 10),
        parent: makeReturnParent(),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('reports with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: cb(),
        loc: {},
        parent: makeReturnParent(),
      })
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (39) =====

  describe('negative cases — does NOT report', () => {
    test('does not report when parent is ExpressionStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), { type: 'ExpressionStatement', expression: null }))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is VariableDeclarator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), { type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' } }))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is ConditionalExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), { type: 'ConditionalExpression', test: {}, consequent: {}, alternate: {} }))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is IfStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), { type: 'IfStatement', test: {}, consequent: {} }))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), { type: 'BinaryExpression', operator: '+', left: {}, right: {} }))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), { type: 'CallExpression', callee: {}, arguments: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report when parent is BlockStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), { type: 'BlockStatement', body: [] }))
      expect(reports.length).toBe(0)
    })

    test('does not report when no parent is set', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb()))
      expect(reports.length).toBe(0)
    })

    test('does not report for .map(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', cb(), makeReturnParent()))
      expect(reports.length).toBe(0)
    })

    test('does not report for .filter(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter', cb(), makeReturnParent()))
      expect(reports.length).toBe(0)
    })

    test('does not report for .reduce(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduce', cb(), makeReturnParent()))
      expect(reports.length).toBe(0)
    })

    test('does not report for .find(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'find', cb(), makeReturnParent()))
      expect(reports.length).toBe(0)
    })

    test('does not report for .every(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every', cb(), makeReturnParent()))
      expect(reports.length).toBe(0)
    })

    test('does not report for .some(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'some', cb(), makeReturnParent()))
      expect(reports.length).toBe(0)
    })

    test('does not report for .includes(x) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'includes', [{ type: 'Identifier', name: 'x' }], makeReturnParent()))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: cb(), loc: makeLoc(1, 0, 1, 5), parent: makeReturnParent() })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: cb(), loc: makeLoc(1, 0, 1, 5), parent: makeReturnParent() })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: cb(), loc: makeLoc(1, 0, 1, 5), parent: makeReturnParent() })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Literal', value: 'forEach' },
        },
        arguments: cb(),
        loc: makeLoc(1, 0, 1, 10),
        parent: makeReturnParent(),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
        },
        arguments: cb(),
        loc: makeLoc(1, 0, 1, 10),
        parent: makeReturnParent(),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: null,
        },
        arguments: cb(),
        loc: makeLoc(1, 0, 1, 10),
        parent: makeReturnParent(),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed (computed: true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
          computed: true,
        },
        arguments: cb(),
        loc: makeLoc(1, 0, 1, 10),
        parent: makeReturnParent(),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for "foreach" lowercase property name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'foreach', cb(), makeReturnParent()))
      expect(reports.length).toBe(0)
    })

    test('does not report for "ForEach" different case property name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'ForEach', cb(), makeReturnParent()))
      expect(reports.length).toBe(0)
    })

    test('does not report for 0 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [], makeReturnParent()))
      expect(reports.length).toBe(0)
    })

    test('does not report for 2 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [{ type: 'Identifier', name: 'fn' }, { type: 'Identifier', name: 'ctx' }], makeReturnParent()))
      expect(reports.length).toBe(0)
    })

    test('does not report for 3 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', [{ type: 'Identifier', name: 'fn' }, { type: 'Identifier', name: 'ctx' }, { type: 'Literal', value: 0 }], makeReturnParent()))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        loc: makeLoc(1, 0, 1, 10),
        parent: makeReturnParent(),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: null,
        loc: makeLoc(1, 0, 1, 10),
        parent: makeReturnParent(),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type (not CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type (not CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for parent type LabeledStatement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), { type: 'LabeledStatement', label: { type: 'Identifier', name: 'label' }, body: {} }))
      expect(reports.length).toBe(0)
    })

  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryArrayForEachReturn.create(ctx1)
      const visitor2 = noUnnecessaryArrayForEachReturn.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), makeReturnParent()))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), { type: 'ExpressionStatement', expression: null }))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), makeReturnParent()))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb()))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), makeReturnParent()))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryArrayForEachReturn.create(context)
      const visitor2 = noUnnecessaryArrayForEachReturn.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryArrayForEachReturn.meta
      const meta2 = noUnnecessaryArrayForEachReturn.meta
      expect(meta1).toBe(meta2)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), makeReturnParent())
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryArrayForEachReturn).toBeDefined()
      expect(typeof noUnnecessaryArrayForEachReturn.create).toBe('function')
      expect(typeof noUnnecessaryArrayForEachReturn.meta).toBe('object')
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), makeReturnParent()))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb()))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'map', cb(), makeReturnParent()))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), makeReturnParent()))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), { type: 'ExpressionStatement', expression: null }))
      expect(reports.length).toBe(2)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: cb(),
        loc: {},
        parent: makeReturnParent(),
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: cb(),
        loc: { start: { line: 3, column: 5 } },
        parent: makeReturnParent(),
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), makeReturnParent()))
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'forEach', cb(), makeReturnParent()))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: cb(),
        parent: makeReturnParent(),
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: cb(),
        parent: makeReturnParent(),
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach', cb(), makeReturnParent(), 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles node with _parent property on callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
          _parent: {},
        },
        arguments: cb(),
        loc: makeLoc(1, 0, 1, 10),
        parent: makeReturnParent(),
      })
      expect(reports.length).toBe(1)
    })

    test('reports with explicit computed: false on MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryArrayForEachReturn.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' },
          property: { type: 'Identifier', name: 'forEach' },
          computed: false,
        },
        arguments: cb(),
        loc: makeLoc(1, 0, 1, 10),
        parent: makeReturnParent(),
      })
      expect(reports.length).toBe(1)
    })
  })
})

import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryPromiseAllRule } from '../../../../src/rules/patterns/no-unnecessary-promise-all.js'
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

function makePromiseAllCallNode(
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
      object: { type: 'Identifier', name: 'Promise' },
      property: { type: 'Identifier', name: 'all' },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeArrayExpr(elements: unknown[]): unknown {
  return { type: 'ArrayExpression', elements }
}

function makeCallNode(
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
      object,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-promise-all rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryPromiseAllRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryPromiseAllRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryPromiseAllRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryPromiseAllRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryPromiseAllRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Promise.all', () => {
      const desc = noUnnecessaryPromiseAllRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/promise/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryPromiseAllRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-promise-all.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryPromiseAllRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryPromiseAllRule).toBeDefined()
      expect(noUnnecessaryPromiseAllRule.meta).toBeDefined()
      expect(noUnnecessaryPromiseAllRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (30) =====

  describe('positive cases — reports unnecessary Promise.all', () => {
    test('reports for Promise.all([])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([])]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all([promise1])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'Identifier', name: 'promise1' }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all([fetchData()])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fetchData' }, arguments: [] }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all([null])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([null])]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all([42])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'Literal', value: 42 }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all(["hello"])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'Literal', value: 'hello' }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all([true])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'Literal', value: true }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all([{ type: "ObjectExpression", properties: [] }])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'ObjectExpression', properties: [] }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all([obj.prop])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all([await fetch()])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'AwaitExpression', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fetch' }, arguments: [] } }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all([arr]) where arr is SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all([() => {}])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all([new Promise()])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'NewExpression', callee: { type: 'Identifier', name: 'Promise' }, arguments: [] }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all([[1, 2, 3]])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }])])]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all([x ? a : b])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'a' }, alternate: { type: 'Identifier', name: 'b' } }])]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary Promise.all', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([])]))
      expect(reports[0].message).toMatch(/Promise\.all/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([])]))
      expect(reports[0].message).toBe(
        'Unnecessary Promise.all with 0 or 1 elements. Use the value directly or add more promises.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([])]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([])]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      const node = makePromiseAllCallNode([makeArrayExpr([])])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([])], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([])]))
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'Identifier', name: 'p' }])]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([])]))
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'Identifier', name: 'p' }])]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for Promise.all([template literal])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'TemplateLiteral', quasis: [], expressions: [] }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all([regex element])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'Literal', value: /test/ }])]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([])]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Promise.all([...promises] where spread is single)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'promises' } }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all([obj.method()])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'method' } }, arguments: [] }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all([...arr]) with single spread element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'SpreadElement', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'getPromises' }, arguments: [] } }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all([Promise.resolve(42)])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'Promise' }, property: { type: 'Identifier', name: 'resolve' } }, arguments: [{ type: 'Literal', value: 42 }] }])]))
      expect(reports.length).toBe(1)
    })

    test('reports for Promise.all([fn()]) with function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }])]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (43) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Promise.all([p1, p2])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'Identifier', name: 'p1' }, { type: 'Identifier', name: 'p2' }])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.all([p1, p2, p3])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'Identifier', name: 'p1' }, { type: 'Identifier', name: 'p2' }, { type: 'Identifier', name: 'p3' }])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.allSettled([p1])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Promise' }, 'allSettled', [makeArrayExpr([{ type: 'Identifier', name: 'p1' }])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.race([p1])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Promise' }, 'race', [makeArrayExpr([{ type: 'Identifier', name: 'p1' }])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.any([p1])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Promise' }, 'any', [makeArrayExpr([{ type: 'Identifier', name: 'p1' }])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.resolve([p1])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Promise' }, 'resolve', [makeArrayExpr([{ type: 'Identifier', name: 'p1' }])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for someObj.all([p1])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'someObj' }, 'all', [makeArrayExpr([{ type: 'Identifier', name: 'p1' }])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for myPromise.all([p1])', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'myPromise' }, 'all', [makeArrayExpr([{ type: 'Identifier', name: 'p1' }])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for promise.all (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'promise' }, 'all', [makeArrayExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Literal', value: 'all' },
        },
        arguments: [makeArrayExpr([])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "All" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Promise' }, 'All', [makeArrayExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getPromise' }, arguments: [] }, 'all', [makeArrayExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'Promise' } }, 'all', [makeArrayExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'all' },
        },
        arguments: [makeArrayExpr([])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'all' },
        },
        arguments: [makeArrayExpr([])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'all', [makeArrayExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
        },
        arguments: [makeArrayExpr([])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: null,
        },
        arguments: [makeArrayExpr([])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.all(promise1) — non-array argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([{ type: 'Identifier', name: 'promise1' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.all() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.all(arr, extra) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([{ type: 'Identifier', name: 'arr' }, { type: 'Literal', value: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Promise.all(promise1) with Identifier arg', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([{ type: 'Identifier', name: 'promise1' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for five-element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }, { type: 'Literal', value: 4 }, { type: 'Literal', value: 5 }])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for ten-element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      const elems = Array.from({ length: 10 }, (_, i) => ({ type: 'Literal', value: i }))
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr(elems)]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "all" (lowercase) with wrong object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'notPromise' }, 'all', [makeArrayExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'all', [makeArrayExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'all', [makeArrayExpr([])]))
      expect(reports.length).toBe(0)
    })

    test('does not report for ArrayExpression with 20 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      const elems = Array.from({ length: 20 }, (_, i) => ({ type: 'Identifier', name: `p${i}` }))
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr(elems)]))
      expect(reports.length).toBe(0)
    })

    test('does not report for callee property that is Literal in computed member', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Literal', value: 'all' },
          computed: true,
        },
        arguments: [makeArrayExpr([])],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })


  })

  // ===== EDGE CASES (10) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryPromiseAllRule.create(ctx1)
      const visitor2 = noUnnecessaryPromiseAllRule.create(ctx2)
      visitor1.CallExpression(makePromiseAllCallNode([makeArrayExpr([])]))
      visitor2.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'Identifier', name: 'p1' }, { type: 'Identifier', name: 'p2' }])]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([])]))
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'Identifier', name: 'p1' }, { type: 'Identifier', name: 'p2' }])]))
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'Identifier', name: 'x' }])]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'all' },
        },
        arguments: [makeArrayExpr([])],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'all' },
        },
        arguments: [makeArrayExpr([])],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'Identifier', name: 'p1' }, { type: 'Identifier', name: 'p2' }])]))
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([])]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'all', [makeArrayExpr([])]))
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'Identifier', name: 'x' }])]))
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([{ type: 'Identifier', name: 'p1' }, { type: 'Identifier', name: 'p2' }, { type: 'Identifier', name: 'p3' }])]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryPromiseAllRule.create(context)
      const visitor2 = noUnnecessaryPromiseAllRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryPromiseAllRule.meta
      const meta2 = noUnnecessaryPromiseAllRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'Promise' },
          property: { type: 'Identifier', name: 'all' },
        },
        arguments: [makeArrayExpr([])],
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      const node = makePromiseAllCallNode([makeArrayExpr([])])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryPromiseAllRule.create(context)
      visitor.CallExpression(makePromiseAllCallNode([makeArrayExpr([])], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })
  })
})

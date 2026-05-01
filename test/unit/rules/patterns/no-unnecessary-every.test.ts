import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryEveryRule } from '../../../../src/rules/patterns/no-unnecessary-every.js'
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

function makeArrayExpr(elements: unknown[]): unknown {
  return { type: 'ArrayExpression', elements }
}

describe('no-unnecessary-every rule', () => {
  // ===== META TESTS (8) =====

  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryEveryRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryEveryRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryEveryRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryEveryRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryEveryRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning every', () => {
      const desc = noUnnecessaryEveryRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/every/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryEveryRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-every',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryEveryRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryEveryRule).toBeDefined()
      expect(noUnnecessaryEveryRule.meta).toBeDefined()
      expect(noUnnecessaryEveryRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (35) =====

  describe('positive cases — reports unnecessary every', () => {
    test('reports for empty array [].every(x => x > 0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'every', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BinaryExpression', operator: '>', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 0 } } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array [1].every(x => x > 0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'every', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BinaryExpression', operator: '>', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 0 } } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element string array ["hello"].every(x => x.length > 0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'hello' }]), 'every', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BinaryExpression', operator: '>', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 0 } } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element identifier array [foo].every(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Identifier', name: 'foo' }]), 'every', [{ type: 'Identifier', name: 'fn' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'every'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 42 }]), 'every'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with object element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ObjectExpression', properties: [] }]), 'every'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with null element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([null]), 'every'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with boolean element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: true }]), 'every'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with Boolean callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'every', [{ type: 'Identifier', name: 'Boolean' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with Boolean callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: true }]), 'every', [{ type: 'Identifier', name: 'Boolean' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }]), 'every'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with function call argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'every', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with ArrowFunction element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]), 'every'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'every', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with nested array element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }])]), 'every'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with regex element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: /test/ }]), 'every'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with two arguments (callback and thisArg)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'every', [{ type: 'Identifier', name: 'fn' }, { type: 'Identifier', name: 'ctx' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with number element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 99 }]), 'every'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with negative number element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: -1 }]), 'every'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with string element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'hello' }]), 'every'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with TemplateLiteral element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'TemplateLiteral', quasis: [], expressions: [] }]), 'every'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with ConditionalExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }]), 'every'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions every', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'every'))
      expect(reports[0].message).toMatch(/every/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'every'))
      expect(reports[0].message).toBe(
        'Unnecessary .every() call on an array with 0 or 1 elements.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'every'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'every'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      const node = makeCallNode(makeArrayExpr([]), 'every')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'every', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'every'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'every'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'every'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'every'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'every'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for empty array with FunctionExpression callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'every', [{ type: 'FunctionExpression', id: null, params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: { type: 'Literal', value: true } }] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with implicit return arrow callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 5 }]), 'every', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'Identifier', name: 'x' }, expression: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with undefined element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Identifier', name: 'undefined' }]), 'every'))
      expect(reports.length).toBe(1)
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (30) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for two-element array [1, 2].every(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'every'))
      expect(reports.length).toBe(0)
    })

    test('does not report for three-element array [1, 2, 3].every(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]), 'every'))
      expect(reports.length).toBe(0)
    })

    test('does not report for variable.every(fn) — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every'))
      expect(reports.length).toBe(0)
    })

    test('does not report for variable.every(fn) — non-ArrayExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'string' }, 'every'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].map(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'map'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].filter(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].reduce(fn, 0) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduce'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].some(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'some'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].forEach(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].find(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'find'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Literal', value: 'every' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression (chained)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'every'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'every'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for five-element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }, { type: 'Literal', value: 4 }, { type: 'Literal', value: 5 }]), 'every'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ten-element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      const elems = Array.from({ length: 10 }, (_, i) => ({ type: 'Literal', value: i }))
      visitor.CallExpression(makeCallNode(makeArrayExpr(elems), 'every'))
      expect(reports.length).toBe(0)
    })

    test('does not report when ArrayExpression elements is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: 'not-array' }, 'every'))
      expect(reports.length).toBe(0)
    })

    test('does not report when ArrayExpression elements is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: null }, 'every'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Every" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'Every'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (20) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryEveryRule.create(ctx1)
      const visitor2 = noUnnecessaryEveryRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeArrayExpr([]), 'every'))
      visitor2.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'every'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'every'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'every'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'x' }]), 'every'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'every'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'every'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'every'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'x' }]), 'every'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]), 'every'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryEveryRule.create(context)
      const visitor2 = noUnnecessaryEveryRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryEveryRule.meta
      const meta2 = noUnnecessaryEveryRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [],
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
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      const node = makeCallNode(makeArrayExpr([]), 'every')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryEveryRule).toBeDefined()
      expect(typeof noUnnecessaryEveryRule.create).toBe('function')
      expect(typeof noUnnecessaryEveryRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'every' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'every', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'every' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Literal', value: 'every' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'every'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'every'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryEveryRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })
})

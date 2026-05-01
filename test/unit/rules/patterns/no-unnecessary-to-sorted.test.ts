import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryToSortedRule } from '../../../../src/rules/patterns/no-unnecessary-to-sorted.js'
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

// ===== META TESTS (8) =====

describe('no-unnecessary-to-sorted rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryToSortedRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryToSortedRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryToSortedRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryToSortedRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryToSortedRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning toSorted', () => {
      const desc = noUnnecessaryToSortedRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/tosorted/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryToSortedRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-to-sorted',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryToSortedRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryToSortedRule).toBeDefined()
      expect(noUnnecessaryToSortedRule.meta).toBeDefined()
      expect(noUnnecessaryToSortedRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (39) =====

  describe('positive cases — reports unnecessary toSorted', () => {
    test('reports for empty array [].toSorted()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array [1].toSorted()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element string array ["hello"].toSorted()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'hello' }]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element identifier array [foo].toSorted()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Identifier', name: 'foo' }]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 42 }]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with object element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ObjectExpression', properties: [] }]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with null element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([null]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions toSorted', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted'))
      expect(reports[0].message).toMatch(/toSorted/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted'))
      expect(reports[0].message).toBe(
        'Unnecessary .toSorted() call on an array with 0 or 1 elements.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      const node = makeCallNode(makeArrayExpr([]), 'toSorted')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'toSorted'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'toSorted'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for single-element array with boolean element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: true }]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with comparator function argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }], body: { type: 'BinaryExpression', operator: '-', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with ArrowFunction element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'compare' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with nested array element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }])]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with regex element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: /test/ }]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted', [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with comparator function', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'toSorted', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }], body: { type: 'BinaryExpression', operator: '-', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } } }]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for single-element array with TemplateLiteral element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'TemplateLiteral', quasis: [], expressions: [] }]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with ConditionalExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with function call argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getComparator' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with undefined element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Identifier', name: 'undefined' }]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with number zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 0 }]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: '' }]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with false boolean', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: false }]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with negative number', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 5 } }]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with Identifier comparator argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted', [{ type: 'Identifier', name: 'comparator' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with FunctionExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with regular function comparator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted', [{ type: 'FunctionExpression', id: { type: 'Identifier', name: 'compare' }, params: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }], body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: { type: 'BinaryExpression', operator: '-', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } } }] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with NewExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'NewExpression', callee: { type: 'Identifier', name: 'MyClass' }, arguments: [] }]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with AwaitExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'AwaitExpression', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fetchData' }, arguments: [] } }]), 'toSorted'))
      expect(reports.length).toBe(1)
    })

  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (30) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for two-element array [2, 1].toSorted()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 2 }, { type: 'Literal', value: 1 }]), 'toSorted'))
      expect(reports.length).toBe(0)
    })

    test('does not report for three-element array ["c", "a", "b"].toSorted()', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'c' }, { type: 'Literal', value: 'a' }, { type: 'Literal', value: 'b' }]), 'toSorted'))
      expect(reports.length).toBe(0)
    })

    test('does not report for two-element array with comparator [3, 1].toSorted((a, b) => a - b)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 3 }, { type: 'Literal', value: 1 }]), 'toSorted', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }], body: { type: 'BinaryExpression', operator: '-', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for variable.toSorted() — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSorted'))
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.toSorted() — ObjectExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'toSorted'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].sort() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].reverse() — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reverse'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [1].map(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'map'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [2, 1].sort() — sort not toSorted', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 2 }, { type: 'Literal', value: 1 }]), 'sort'))
      expect(reports.length).toBe(0)
    })

    test('does not report for toSorted([2, 1]) — not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'toSorted' }, arguments: [makeArrayExpr([{ type: 'Literal', value: 2 }, { type: 'Literal', value: 1 }])], loc: makeLoc(1, 0, 1, 20) })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr["toSorted"]() — computed property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Literal', value: 'toSorted' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for arr.toSorted() — variable array (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'myArray' }, 'toSorted'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "TOSORTED" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'TOSORTED'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Literal', value: 'toSorted' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'toSorted'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'toSorted'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'toSorted'))
      expect(reports.length).toBe(0)
    })

    test('does not report for typedArray.toSorted() — non-ArrayExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'new' }, arguments: [{ type: 'Identifier', name: 'Int32Array' }] }, 'toSorted'))
      expect(reports.length).toBe(0)
    })

    test('does not report for five-element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }, { type: 'Literal', value: 4 }, { type: 'Literal', value: 5 }]), 'toSorted'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ten-element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      const elems = Array.from({ length: 10 }, (_, i) => ({ type: 'Literal', value: i }))
      visitor.CallExpression(makeCallNode(makeArrayExpr(elems), 'toSorted'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "tosorted" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'tosorted'))
      expect(reports.length).toBe(0)
    })

    test('does not report when ArrayExpression elements is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: null }, 'toSorted'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryToSortedRule.create(ctx1)
      const visitor2 = noUnnecessaryToSortedRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted'))
      visitor2.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'toSorted'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'toSorted'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'x' }]), 'toSorted'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'toSorted' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'toSorted' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'toSorted'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'toSorted'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'x' }]), 'toSorted'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]), 'toSorted'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryToSortedRule.create(context)
      const visitor2 = noUnnecessaryToSortedRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryToSortedRule.meta
      const meta2 = noUnnecessaryToSortedRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'toSorted' },
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
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'toSorted' },
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'toSorted' },
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
      const visitor = noUnnecessaryToSortedRule.create(context)
      const node = makeCallNode(makeArrayExpr([]), 'toSorted')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryToSortedRule).toBeDefined()
      expect(typeof noUnnecessaryToSortedRule.create).toBe('function')
      expect(typeof noUnnecessaryToSortedRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'toSorted' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryToSortedRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'toSorted'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'toSorted'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

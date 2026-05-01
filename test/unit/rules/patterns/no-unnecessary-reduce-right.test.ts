import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryReduceRightRule } from '../../../../src/rules/patterns/no-unnecessary-reduce-right.js'
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

describe('no-unnecessary-reduce-right rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryReduceRightRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryReduceRightRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryReduceRightRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryReduceRightRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryReduceRightRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning reduceRight', () => {
      const desc = noUnnecessaryReduceRightRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/reduceright/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryReduceRightRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-reduce-right',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryReduceRightRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryReduceRightRule).toBeDefined()
      expect(noUnnecessaryReduceRightRule.meta).toBeDefined()
      expect(noUnnecessaryReduceRightRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (40) =====

  describe('positive cases — reports unnecessary reduceRight', () => {
    test('reports for empty array [].reduceRight(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight', [{ type: 'Identifier', name: 'fn' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array [1].reduceRight(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'reduceRight', [{ type: 'Identifier', name: 'fn' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element string array ["hello"].reduceRight(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'hello' }]), 'reduceRight', [{ type: 'Identifier', name: 'fn' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element identifier array [foo].reduceRight(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Identifier', name: 'foo' }]), 'reduceRight', [{ type: 'Identifier', name: 'fn' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 42 }]), 'reduceRight'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with object element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ObjectExpression', properties: [] }]), 'reduceRight'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with null element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([null]), 'reduceRight'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions reduceRight', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight'))
      expect(reports[0].message).toMatch(/reduceRight/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight'))
      expect(reports[0].message).toBe(
        'Unnecessary .reduceRight() call on an array with 0 or 1 elements.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      const node = makeCallNode(makeArrayExpr([]), 'reduceRight')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'reduceRight'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'reduceRight'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for single-element array with boolean element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: true }]), 'reduceRight'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }]), 'reduceRight'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with function call argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getCallback' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with ArrowFunction element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]), 'reduceRight'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'callback' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with nested array element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }])]), 'reduceRight'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with regex element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: /test/ }]), 'reduceRight'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with two arguments (callback + initial)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight', [{ type: 'Identifier', name: 'fn' }, { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for single-element array with TemplateLiteral element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'TemplateLiteral', quasis: [], expressions: [] }]), 'reduceRight'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with ConditionalExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }]), 'reduceRight'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with arrow function callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }], body: { type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with function expression callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight', [{ type: 'FunctionExpression', id: null, params: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with arrow function body callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 42 }]), 'reduceRight', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'acc' }, { type: 'Identifier', name: 'val' }], body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'acc' } }] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with callback and initial value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'reduceRight', [{ type: 'Identifier', name: 'fn' }, { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with numeric initial value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight', [{ type: 'Identifier', name: 'fn' }, { type: 'Literal', value: 100 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with object initial value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'x' }]), 'reduceRight', [{ type: 'Identifier', name: 'fn' }, { type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with string element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'abc' }]), 'reduceRight'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with binary expression initial value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight', [{ type: 'Identifier', name: 'fn' }, { type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 1 }, right: { type: 'Literal', value: 2 } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with FunctionExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }]), 'reduceRight'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with identifier initial value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight', [{ type: 'Identifier', name: 'fn' }, { type: 'Identifier', name: 'initial' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with UnaryExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 5 } }]), 'reduceRight'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with AssignmentExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 } }]), 'reduceRight'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with arrow function implicit return callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }], body: { type: 'BinaryExpression', operator: '*', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } } }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (30) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for two-element array [1, 2].reduceRight(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'reduceRight'))
      expect(reports.length).toBe(0)
    })

    test('does not report for three-element array [1, 2, 3].reduceRight(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]), 'reduceRight'))
      expect(reports.length).toBe(0)
    })

    test('does not report for variable.reduceRight(fn) — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight'))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-ArrayExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'string' }, 'reduceRight'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].reduce(fn, 0) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduce'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].map(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'map'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].indexOf(x) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'indexOf'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].find(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'find'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Literal', value: 'reduceRight' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "reduce" (different method)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduce'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'reduceRight'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'reduceRight'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'reduceRight' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'reduceRight' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'reduceRight'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'reduceRight'))
      expect(reports.length).toBe(0)
    })

    test('does not report for five-element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }, { type: 'Literal', value: 4 }, { type: 'Literal', value: 5 }]), 'reduceRight'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ten-element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      const elems = Array.from({ length: 10 }, (_, i) => ({ type: 'Literal', value: i }))
      visitor.CallExpression(makeCallNode(makeArrayExpr(elems), 'reduceRight'))
      expect(reports.length).toBe(0)
    })

    test('does not report when ArrayExpression elements is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: 'not-array' }, 'reduceRight'))
      expect(reports.length).toBe(0)
    })

    test('does not report when ArrayExpression elements is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: null }, 'reduceRight'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryReduceRightRule.create(ctx1)
      const visitor2 = noUnnecessaryReduceRightRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight'))
      visitor2.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'reduceRight'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'reduceRight'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'x' }]), 'reduceRight'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'reduceRight' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'reduceRight' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'reduceRight'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'reduceRight'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'x' }]), 'reduceRight'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]), 'reduceRight'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryReduceRightRule.create(context)
      const visitor2 = noUnnecessaryReduceRightRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryReduceRightRule.meta
      const meta2 = noUnnecessaryReduceRightRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'reduceRight' },
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
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'reduceRight' },
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'reduceRight' },
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
      const visitor = noUnnecessaryReduceRightRule.create(context)
      const node = makeCallNode(makeArrayExpr([]), 'reduceRight')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryReduceRightRule).toBeDefined()
      expect(typeof noUnnecessaryReduceRightRule.create).toBe('function')
      expect(typeof noUnnecessaryReduceRightRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'reduceRight' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryReduceRightRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduceRight'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'reduceRight'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

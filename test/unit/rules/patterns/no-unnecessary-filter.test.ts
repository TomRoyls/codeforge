import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryFilterRule } from '../../../../src/rules/patterns/no-unnecessary-filter.js'
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

describe('no-unnecessary-filter rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryFilterRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryFilterRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryFilterRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryFilterRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryFilterRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning filter', () => {
      const desc = noUnnecessaryFilterRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/filter/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryFilterRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-filter',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryFilterRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryFilterRule).toBeDefined()
      expect(noUnnecessaryFilterRule.meta).toBeDefined()
      expect(noUnnecessaryFilterRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (50) =====

  describe('positive cases — reports unnecessary filter', () => {
    test('reports for empty array [].filter(x => x > 0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BinaryExpression', operator: '>', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 0 } } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array [1].filter(x => x > 0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'filter', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BinaryExpression', operator: '>', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 0 } } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element string array ["hello"].filter(x => x.length > 0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'hello' }]), 'filter', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BinaryExpression', operator: '>', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 0 } } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element identifier array [foo].filter(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Identifier', name: 'foo' }]), 'filter', [{ type: 'Identifier', name: 'fn' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 42 }]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with object element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ObjectExpression', properties: [] }]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with null element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([null]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary filter', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter'))
      expect(reports[0].message).toMatch(/filter/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter'))
      expect(reports[0].message).toBe(
        'Unnecessary .filter() call on an array with 0 or 1 elements.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      const node = makeCallNode(makeArrayExpr([]), 'filter')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'filter'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'filter'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for single-element array with boolean element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: true }]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with function call argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'Boolean' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with ArrowFunction element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with nested array element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }])]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with regex element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: /test/ }]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter', [{ type: 'Identifier', name: 'fn' }, { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with thisArg argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter', [{ type: 'Identifier', name: 'fn' }, { type: 'ThisExpression' }]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for single-element array with TemplateLiteral element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'TemplateLiteral', quasis: [], expressions: [] }]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with ConditionalExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with Boolean callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter', [{ type: 'Identifier', name: 'Boolean' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element number array with arrow callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 42 }]), 'filter', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'x' } }] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element boolean array with function expression callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: false }]), 'filter', [{ type: 'FunctionExpression', id: null, params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with undefined element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Identifier', name: 'undefined' }]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with Number callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter', [{ type: 'Identifier', name: 'Number' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with String callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'test' }]), 'filter', [{ type: 'Identifier', name: 'String' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with implicit return arrow callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'Identifier', name: 'x' }, expression: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with CallExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with UnaryExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 1 } }]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with logical expression callback body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'LogicalExpression', operator: '&&', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: true } }, expression: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with NewExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] }]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with UpdateExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'x' } }]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with logical NOT callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }, expression: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with AssignmentExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 } }]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with SequenceExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'SequenceExpression', expressions: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with AwaitExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } }]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with YieldExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'YieldExpression', argument: { type: 'Literal', value: 1 } }]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with BigInt literal element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'BigIntLiteral', value: '100n' }]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with TaggedTemplateExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } }]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with ClassExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ClassExpression', id: null, body: { type: 'ClassBody', body: [] } }]), 'filter'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with ArrowFunctionExpression callback with block body', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BlockStatement', body: [{ type: 'ReturnStatement', argument: { type: 'BinaryExpression', operator: '>', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 0 } } }] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with MemberExpression callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'filter', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'fn' } }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (29) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for two-element array [1, 2].filter(x => x > 0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report for three-element array [1, 2, 3].filter(x => x > 0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]), 'filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report for variable.filter(fn) — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.filter(fn) — non-ArrayExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'string' }, 'filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].map(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'map'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].forEach(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].find(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'find'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].reduce(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduce'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'filter' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Literal', value: 'filter' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'filter' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report for five-element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }, { type: 'Literal', value: 4 }, { type: 'Literal', value: 5 }]), 'filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ten-element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      const elems = Array.from({ length: 10 }, (_, i) => ({ type: 'Literal', value: i }))
      visitor.CallExpression(makeCallNode(makeArrayExpr(elems), 'filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "filter" with computed access', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Literal', value: 'filter' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "Filter" (capitalized)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'Filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "filterTo" (not exact match)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filterTo'))
      expect(reports.length).toBe(0)
    })

    test('does not report when ArrayExpression elements is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: 'not-array' }, 'filter'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (5) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryFilterRule.create(ctx1)
      const visitor2 = noUnnecessaryFilterRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeArrayExpr([]), 'filter'))
      visitor2.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'filter'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'filter'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'x' }]), 'filter'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryFilterRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'filter' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryFilterRule.create(context)
      const visitor2 = noUnnecessaryFilterRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryFilterRule.meta
      const meta2 = noUnnecessaryFilterRule.meta
      expect(meta1).toBe(meta2)
    })
  })
})

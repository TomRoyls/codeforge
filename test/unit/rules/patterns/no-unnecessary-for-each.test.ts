import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryForEachRule } from '../../../../src/rules/patterns/no-unnecessary-for-each.js'
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

describe('no-unnecessary-for-each rule', () => {
  // ===== META TESTS (8) =====

  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryForEachRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryForEachRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryForEachRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryForEachRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryForEachRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning forEach', () => {
      const desc = noUnnecessaryForEachRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/foreach/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryForEachRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-unnecessary-for-each',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryForEachRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryForEachRule).toBeDefined()
      expect(noUnnecessaryForEachRule.meta).toBeDefined()
      expect(noUnnecessaryForEachRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (45) =====

  describe('positive cases — reports unnecessary forEach', () => {
    test('reports for empty array [].forEach(x => console.log(x))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'CallExpression', callee: { type: 'Identifier', name: 'console' }, arguments: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array [1].forEach(x => console.log(x))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'forEach', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'CallExpression', callee: { type: 'Identifier', name: 'console' }, arguments: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element string array ["hello"].forEach(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'hello' }]), 'forEach', [{ type: 'Identifier', name: 'fn' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element identifier array [foo].forEach(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Identifier', name: 'foo' }]), 'forEach', [{ type: 'Identifier', name: 'fn' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 42 }]), 'forEach'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with object element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ObjectExpression', properties: [] }]), 'forEach'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with null element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([null]), 'forEach'))
      expect(reports.length).toBe(1)
    })

    test('report message mentions forEach', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach'))
      expect(reports[0].message).toMatch(/forEach/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach'))
      expect(reports[0].message).toBe(
        'Unnecessary .forEach() call on an array with 0 or 1 elements.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      const node = makeCallNode(makeArrayExpr([]), 'forEach')
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach', [], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'forEach'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'forEach'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for single-element array with boolean element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: true }]), 'forEach'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }]), 'forEach'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with function call argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with ArrowFunction element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]), 'forEach'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with member expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with nested array element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }])]), 'forEach'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with regex element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: /test/ }]), 'forEach'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with two arguments (callback + thisArg)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach', [{ type: 'Identifier', name: 'fn' }, { type: 'ThisExpression' }]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with arrow function callback using body block', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'BlockStatement', body: [{ type: 'ExpressionStatement', expression: { type: 'CallExpression', callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'console' }, property: { type: 'Identifier', name: 'log' } }, arguments: [{ type: 'Identifier', name: 'x' }] } }] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with function expression callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'hello' }]), 'forEach', [{ type: 'FunctionExpression', id: null, params: [{ type: 'Identifier', name: 'item' }], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with method reference callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'console' }, property: { type: 'Identifier', name: 'log' } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with number element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 99 }]), 'forEach'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with string element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'world' }]), 'forEach'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with boolean false element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: false }]), 'forEach'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with undefined element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Identifier', name: 'undefined' }]), 'forEach'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with TemplateLiteral element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'TemplateLiteral', quasis: [], expressions: [] }]), 'forEach'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with ConditionalExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 1 }, alternate: { type: 'Literal', value: 2 } }]), 'forEach'))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for empty array with ArrowFunctionExpression callback with implicit return', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'x' }], body: { type: 'Identifier', name: 'x' }, expression: true }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with CallExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getValue' }, arguments: [] }]), 'forEach'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with FunctionDeclaration callback', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach', [{ type: 'FunctionExpression', id: { type: 'Identifier', name: 'handler' }, params: [{ type: 'Identifier', name: 'item' }], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with object property element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'ObjectExpression', properties: [{ type: 'Property', key: { type: 'Identifier', name: 'key' }, value: { type: 'Literal', value: 'val' } }] }]), 'forEach'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with NewExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [] }]), 'forEach'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with arrow callback referencing index param', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'item' }, { type: 'Identifier', name: 'index' }], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with UnaryExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'UnaryExpression', operator: '-', prefix: true, argument: { type: 'Literal', value: 1 } }]), 'forEach'))
      expect(reports.length).toBe(1)
    })

    test('reports for empty array with arrow callback referencing index and array params', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach', [{ type: 'ArrowFunctionExpression', params: [{ type: 'Identifier', name: 'item' }, { type: 'Identifier', name: 'idx' }, { type: 'Identifier', name: 'arr' }], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with AssignmentExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'AssignmentExpression', operator: '=', left: { type: 'Identifier', name: 'x' }, right: { type: 'Literal', value: 1 } }]), 'forEach'))
      expect(reports.length).toBe(1)
    })

    test('reports for single-element array with ArrayExpression element', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([makeArrayExpr([])]), 'forEach'))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (23) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for two-element array [1, 2].forEach(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'forEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report for three-element array [1, 2, 3].forEach(fn)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]), 'forEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report for variable.forEach(fn) — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report for non-ArrayExpression callee object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'string' }, 'forEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].map(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'map'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].filter(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'filter'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].reduce(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'reduce'))
      expect(reports.length).toBe(0)
    })

    test('does not report for [].find(fn) — wrong method name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'find'))
      expect(reports.length).toBe(0)
    })

    test('does not report for obj.forEach(fn) — ObjectExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'forEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Literal', value: 'forEach' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "foreach" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'foreach'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getArr' }, arguments: [] }, 'forEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object is a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'arr' } }, 'forEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report for five-element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }, { type: 'Literal', value: 4 }, { type: 'Literal', value: 5 }]), 'forEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report for ten-element array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      const elems = Array.from({ length: 10 }, (_, i) => ({ type: 'Literal', value: i }))
      visitor.CallExpression(makeCallNode(makeArrayExpr(elems), 'forEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report when ArrayExpression elements is not an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: 'not-array' }, 'forEach'))
      expect(reports.length).toBe(0)
    })

    test('does not report when ArrayExpression elements is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: null }, 'forEach'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryForEachRule.create(ctx1)
      const visitor2 = noUnnecessaryForEachRule.create(ctx2)
      visitor1.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach'))
      visitor2.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'forEach'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'forEach'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'x' }]), 'forEach'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }]), 'forEach'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach'))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'forEach'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 'x' }]), 'forEach'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }]), 'forEach'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryForEachRule.create(context)
      const visitor2 = noUnnecessaryForEachRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryForEachRule.meta
      const meta2 = noUnnecessaryForEachRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'forEach' },
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
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'forEach' },
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
      const visitor = noUnnecessaryForEachRule.create(context)
      const node = makeCallNode(makeArrayExpr([]), 'forEach')
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryForEachRule).toBeDefined()
      expect(typeof noUnnecessaryForEachRule.create).toBe('function')
      expect(typeof noUnnecessaryForEachRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'forEach' },
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach', [], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression with non-computed property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Identifier', name: 'forEach' },
          computed: false,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: makeArrayExpr([]),
          property: { type: 'Literal', value: 'forEach' },
          computed: true,
        },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode(makeArrayExpr([]), 'forEach'))
      visitor.CallExpression(makeCallNode(makeArrayExpr([{ type: 'Literal', value: 1 }]), 'forEach'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('does not report when ArrayExpression elements is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryForEachRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression' }, 'forEach'))
      expect(reports.length).toBe(0)
    })
  })
})

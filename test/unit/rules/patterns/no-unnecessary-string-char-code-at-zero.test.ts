import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringCharCodeAtZeroRule } from '../../../../src/rules/patterns/no-unnecessary-string-char-code-at-zero.js'
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
      computed: false,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-char-code-at-zero rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringCharCodeAtZeroRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringCharCodeAtZeroRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringCharCodeAtZeroRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringCharCodeAtZeroRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringCharCodeAtZeroRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning charCodeAt', () => {
      const desc = noUnnecessaryStringCharCodeAtZeroRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/charcodeat/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringCharCodeAtZeroRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-char-code-at-zero.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringCharCodeAtZeroRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringCharCodeAtZeroRule).toBeDefined()
      expect(noUnnecessaryStringCharCodeAtZeroRule.meta).toBeDefined()
      expect(noUnnecessaryStringCharCodeAtZeroRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports charCodeAt(0)', () => {
    test('reports for str.charCodeAt(0) with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for literal.charCodeAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.charCodeAt(0) with MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for arr[0].charCodeAt(0) — computed object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'arr' }, property: { type: 'NumericLiteral', value: 0 }, computed: true }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for callResult.charCodeAt(0) — CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getString' }, arguments: [] }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions charCodeAt', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].message).toMatch(/charCodeAt/)
    })

    test('report message mentions codePointAt', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].message).toMatch(/codePointAt/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].message).toBe(
        'str.charCodeAt(0) gets the first character code. Consider using str.codePointAt(0) for Unicode support.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }], 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('report loc end values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 's' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }], 3, 4, 7, 12))
      expect(reports[0].loc?.end.line).toBe(7)
      expect(reports[0].loc?.end.column).toBe(12)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str1' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str2' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for template literal charCodeAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for BinaryExpression charCodeAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Literal', value: 'a' }, right: { type: 'Literal', value: 'b' } }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for ConditionalExpression charCodeAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrayExpression charCodeAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for ObjectExpression charCodeAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for FunctionExpression charCodeAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for ArrowFunctionExpression charCodeAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for ThisExpression charCodeAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ThisExpression' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for SpreadElement object charCodeAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'SpreadElement', argument: { type: 'Identifier', name: 'arr' } }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for UnaryExpression charCodeAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for NewExpression charCodeAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'String' }, arguments: [] }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })

    test('reports for AwaitExpression charCodeAt(0)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'AwaitExpression', argument: { type: 'CallExpression', callee: { type: 'Identifier', name: 'fetchString' }, arguments: [] } }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for str.charCodeAt(1) — non-zero index', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charCodeAt(2) — non-zero index', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charCodeAt(-1) — negative index', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: -1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charCodeAt(100) — large index', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 100 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.codePointAt(0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charAt(0) — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charCodeAt() — no arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charCodeAt(x, y) — two arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for str.charCodeAt(x, y, z) — three arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }, { type: 'NumericLiteral', value: 1 }, { type: 'NumericLiteral', value: 2 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is Identifier (not NumericLiteral)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'Identifier', name: 'idx' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is StringLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'StringLiteral', value: '0' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getIndex' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'idx' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression (Identifier callee)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression (FunctionExpression callee)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, arguments: [{ type: 'NumericLiteral', value: 0 }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier (Literal property)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'charCodeAt' },
          computed: false,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "charcodeat" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charcodeat', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "CHARCODEAT" (uppercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'CHARCODEAT', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "fromCharCode" — different method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'String' }, 'fromCharCode', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument value is 0.5 (float)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0.5 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed with string', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'charCodeAt' },
          computed: true,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is computed with identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charCodeAt' },
          computed: true,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [null]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charCodeAt' },
          computed: false,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringCharCodeAtZeroRule.create(ctx1)
      const visitor2 = noUnnecessaryStringCharCodeAtZeroRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 1 }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 1 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charCodeAt' },
          computed: false,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charCodeAt' },
          computed: false,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }])) // report
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 1 }])) // no report
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'codePointAt', [{ type: 'NumericLiteral', value: 0 }])) // no report
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }])) // report
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 5 }])) // no report
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      const visitor2 = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringCharCodeAtZeroRule.meta
      const meta2 = noUnnecessaryStringCharCodeAtZeroRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charCodeAt' },
          computed: false,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
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
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charCodeAt' },
          computed: false,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charCodeAt' },
          computed: false,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringCharCodeAtZeroRule).toBeDefined()
      expect(typeof noUnnecessaryStringCharCodeAtZeroRule.create).toBe('function')
      expect(typeof noUnnecessaryStringCharCodeAtZeroRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charCodeAt' },
          computed: false,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }], 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles non-computed member expression property correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'charCodeAt' },
          computed: false,
        },
        arguments: [{ type: 'NumericLiteral', value: 0 }],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'a' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'b' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0 }]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('argument with value 0 as float 0.0 is still zero', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringCharCodeAtZeroRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'charCodeAt', [{ type: 'NumericLiteral', value: 0.0 }]))
      expect(reports.length).toBe(1)
    })
  })
})

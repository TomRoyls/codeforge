import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryStringLastIndexOfSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-string-last-index-of-spread.js'
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
  computed = false,
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
      computed,
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeSpread(argument: unknown): unknown {
  return { type: 'SpreadElement', argument }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-string-last-index-of-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryStringLastIndexOfSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryStringLastIndexOfSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryStringLastIndexOfSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryStringLastIndexOfSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryStringLastIndexOfSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning lastIndexOf', () => {
      const desc = noUnnecessaryStringLastIndexOfSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/lastindexof/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryStringLastIndexOfSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-string-last-index-of-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryStringLastIndexOfSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryStringLastIndexOfSpreadRule).toBeDefined()
      expect(noUnnecessaryStringLastIndexOfSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryStringLastIndexOfSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (24) =====

  describe('positive cases — reports str.lastIndexOf(...items)', () => {
    test('reports for str.lastIndexOf(...items) with Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.lastIndexOf(...arr) with array identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'arr' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for str.lastIndexOf(...getItems()) with call expression in spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getItems' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for obj.prop.lastIndexOf(...items) with MemberExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'prop' } }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for foo().lastIndexOf(...items) with CallExpression object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'foo' }, arguments: [] }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for literal string .lastIndexOf(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Literal', value: 'hello' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports for binary expression .lastIndexOf(...items)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('report message mentions lastIndexOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toMatch(/lastIndexOf/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].message).toBe(
        'str.lastIndexOf(...items) with spread is unusual. lastIndexOf() expects a search string and optional position.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })], false, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'text' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'vals' })]))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'text' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'vals' })]))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for lastIndexOf(...[1, 2, 3]) with ArrayExpression in spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }, { type: 'Literal', value: 3 }] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for lastIndexOf(...obj.items) with MemberExpression in spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'items' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for lastIndexOf(...new Set()) with NewExpression in spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Set' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('reports for lastIndexOf(...(a ? b : c)) with ConditionalExpression in spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'a' }, consequent: { type: 'Identifier', name: 'b' }, alternate: { type: 'Identifier', name: 'c' } })]))
      expect(reports.length).toBe(1)
    })

    test('reports for lastIndexOf(...fn()) with CallExpression in spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] })]))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports with ObjectExpression as object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ObjectExpression', properties: [] }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports with ArrayExpression as object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'ArrayExpression', elements: [] }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports with FunctionExpression as object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(1)
    })

    test('reports with ArrowFunctionExpression in spread argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } })]))
      expect(reports.length).toBe(1)
    })


  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (44) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for indexOf instead of lastIndexOf', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for includes method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'includes', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for find method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'find', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for map method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'map', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for filter method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'filter', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for search method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'search', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for match method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'match', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for replace method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'replace', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for split method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'split', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })



    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [makeSpread({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [makeSpread({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [makeSpread({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is not a MemberExpression (FunctionExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: { type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, arguments: [makeSpread({ type: 'Identifier', name: 'items' })], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is not an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'lastIndexOf' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is missing in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when property is null in MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: null,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed member expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })], true))
      expect(reports.length).toBe(0)
    })

    test('does not report for 0 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', []))
      expect(reports.length).toBe(0)
    })

    test('does not report for 2 arguments (Literal, Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 2 arguments (SpreadElement, Literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' }), { type: 'Literal', value: 0 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 2 arguments (Literal, SpreadElement)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'Literal', value: 'x' }, makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 3 arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'Literal', value: 'x' }, { type: 'Literal', value: 0 }, { type: 'Literal', value: 1 }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 1 argument that is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'Literal', value: 'x' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 1 argument that is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'Identifier', name: 'searchStr' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 1 argument that is MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'key' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 1 argument that is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 1 argument that is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'ArrayExpression', elements: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 1 argument that is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'ObjectExpression', properties: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 1 argument that is BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 1 argument that is TemplateLiteral', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'TemplateLiteral', quasis: [], expressions: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for 1 argument that is ArrowFunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when property name is "lastindexof" (lowercase)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastindexof', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (16) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryStringLastIndexOfSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryStringLastIndexOfSpreadRule.create(ctx2)
      visitor1.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'text' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'vals' })]))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [{ type: 'Literal', value: 'x' }]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'indexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'text' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'vals' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', []))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      const visitor2 = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryStringLastIndexOfSpreadRule.meta
      const meta2 = noUnnecessaryStringLastIndexOfSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
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
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      const node = makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })])
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryStringLastIndexOfSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryStringLastIndexOfSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryStringLastIndexOfSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Identifier', name: 'lastIndexOf' },
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })], false, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('does not report when callee property is computed with string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'str' },
          property: { type: 'Literal', value: 'lastIndexOf' },
          computed: true,
        },
        arguments: [makeSpread({ type: 'Identifier', name: 'items' })],
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryStringLastIndexOfSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'str' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'items' })]))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'text' }, 'lastIndexOf', [makeSpread({ type: 'Identifier', name: 'vals' })]))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })
  })
})

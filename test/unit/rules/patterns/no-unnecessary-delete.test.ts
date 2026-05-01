import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryDeleteRule } from '../../../../src/rules/patterns/no-unnecessary-delete.js'
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
    getSource: () => 'delete this.prop',
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

function makeDeleteNode(
  object: unknown,
  property: string | { type: string; [key: string]: unknown },
  computed = false,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 20,
): unknown {
  const propNode = typeof property === 'string'
    ? { type: 'Identifier', name: property }
    : property
  return {
    type: 'UnaryExpression',
    operator: 'delete',
    prefix: true,
    argument: {
      type: 'MemberExpression',
      object,
      property: propNode,
      computed,
    },
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

function makeThisExpr(): unknown {
  return { type: 'ThisExpression' }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-delete rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryDeleteRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryDeleteRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryDeleteRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryDeleteRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryDeleteRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning delete', () => {
      const desc = noUnnecessaryDeleteRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/delete/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryDeleteRule.meta.docs?.url).toBe(
        'https://github.com/codeforge-dev/codeforge/blob/main/docs/rules/patterns/no-unnecessary-delete.md',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryDeleteRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with UnaryExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      expect(visitor).toHaveProperty('UnaryExpression')
      expect(typeof visitor.UnaryExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryDeleteRule).toBeDefined()
      expect(noUnnecessaryDeleteRule.meta).toBeDefined()
      expect(noUnnecessaryDeleteRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (35) =====

  describe('positive cases — reports delete this.prop', () => {
    test('reports for delete this.name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'name'))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this.value', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'value'))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this.data', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'data'))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this._private', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), '_private'))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this.$jquery', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), '$jquery'))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this.prop with computed access', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), { type: 'Literal', value: 'key' }, true))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this[key] with Identifier property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), { type: 'Identifier', name: 'key' }, true))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this[0] with numeric literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), { type: 'Literal', value: 0 }, true))
      expect(reports.length).toBe(1)
    })

    test('report message mentions unnecessary delete on this', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'prop'))
      expect(reports[0].message).toMatch(/delete/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'prop'))
      expect(reports[0].message).toBe(
        'Unnecessary delete on this. Set the property to undefined instead.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'prop'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'prop'))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input UnaryExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      const node = makeDeleteNode(makeThisExpr(), 'prop')
      visitor.UnaryExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'prop', false, 5, 10, 5, 30))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'a'))
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'b'))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'a'))
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'b'))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for delete this._events', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), '_events'))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this.counter', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'counter'))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this.result', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'result'))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this[expr] with CallExpression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), { type: 'CallExpression', callee: { type: 'Identifier', name: 'getKey' }, arguments: [] }, true))
      expect(reports.length).toBe(1)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'prop'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for delete this.item', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'item'))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this.list', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'list'))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this.state', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'state'))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this.config', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'config'))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this.options', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'options'))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this.template', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'template'))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this.buffer', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'buffer'))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this.flags', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'flags'))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this.ref', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'ref'))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this.id', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'id'))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this[key] with TemplateLiteral property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), { type: 'TemplateLiteral', quasis: [], expressions: [] }, true))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this[tag] with MemberExpression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), { type: 'MemberExpression', object: { type: 'Identifier', name: 'ns' }, property: { type: 'Identifier', name: 'key' } }, true))
      expect(reports.length).toBe(1)
    })

    test('reports for delete this[cond] with ConditionalExpression property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), { type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Literal', value: 'a' }, alternate: { type: 'Literal', value: 'b' } }, true))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (33) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for delete obj.prop — Identifier object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode({ type: 'Identifier', name: 'obj' }, 'prop'))
      expect(reports.length).toBe(0)
    })

    test('does not report for delete arr[0] — non-ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode({ type: 'Identifier', name: 'arr' }, { type: 'Literal', value: 0 }, true))
      expect(reports.length).toBe(0)
    })

    test('does not report for void this.prop — wrong operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
        argument: {
          type: 'MemberExpression',
          object: makeThisExpr(),
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: makeLoc(1, 0, 1, 15),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for typeof this.prop — wrong operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'typeof',
        prefix: true,
        argument: {
          type: 'MemberExpression',
          object: makeThisExpr(),
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: makeLoc(1, 0, 1, 18),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for !this.prop — wrong operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: {
          type: 'MemberExpression',
          object: makeThisExpr(),
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for -this.prop — wrong operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '-',
        prefix: true,
        argument: {
          type: 'MemberExpression',
          object: makeThisExpr(),
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for +this.prop — wrong operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '+',
        prefix: true,
        argument: {
          type: 'MemberExpression',
          object: makeThisExpr(),
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for ~this.prop — wrong operator', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: '~',
        prefix: true,
        argument: {
          type: 'MemberExpression',
          object: makeThisExpr(),
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      expect(() => visitor.UnaryExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      expect(() => visitor.UnaryExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      expect(() => visitor.UnaryExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      expect(() => visitor.UnaryExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      expect(() => visitor.UnaryExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      expect(() => visitor.UnaryExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type (not UnaryExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: 'delete', loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: 'delete', argument: null, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when argument is not a MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({ type: 'UnaryExpression', operator: 'delete', argument: { type: 'Identifier', name: 'x' }, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when MemberExpression object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when MemberExpression object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'delete',
        argument: {
          type: 'MemberExpression',
          object: null,
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for delete x where x is an Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'delete',
        prefix: true,
        argument: { type: 'Identifier', name: 'x' },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for CallExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({ type: 'CallExpression', callee: {}, arguments: [], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode({ type: 'Literal', value: 'hello' }, 'prop'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is ObjectExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode({ type: 'ObjectExpression', properties: [] }, 'prop'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is ArrayExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode({ type: 'ArrayExpression', elements: [] }, 'prop'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }, 'prop'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is FunctionExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode({ type: 'FunctionExpression', id: null, params: [], body: { type: 'BlockStatement', body: [] } }, 'prop'))
      expect(reports.length).toBe(0)
    })

    test('does not report when object type is MemberExpression (nested)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'nested' } }, 'prop'))
      expect(reports.length).toBe(0)
    })

    test('does not report for delete window.prop — window is Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode({ type: 'Identifier', name: 'window' }, 'prop'))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is Literal (not MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'delete',
        prefix: true,
        argument: { type: 'Literal', value: 42 },
        loc: makeLoc(1, 0, 1, 12),
      })
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryDeleteRule.create(ctx1)
      const visitor2 = noUnnecessaryDeleteRule.create(ctx2)
      visitor1.UnaryExpression(makeDeleteNode(makeThisExpr(), 'a'))
      visitor2.UnaryExpression(makeDeleteNode({ type: 'Identifier', name: 'obj' }, 'a'))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'a'))
      visitor.UnaryExpression(makeDeleteNode({ type: 'Identifier', name: 'obj' }, 'b'))
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'c'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        prefix: true,
        argument: {
          type: 'MemberExpression',
          object: makeThisExpr(),
          property: { type: 'Identifier', name: 'prop' },
        },
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        prefix: true,
        argument: {
          type: 'MemberExpression',
          object: makeThisExpr(),
          property: { type: 'Identifier', name: 'prop' },
        },
      }
      visitor.UnaryExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode({ type: 'Identifier', name: 'obj' }, 'a'))
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'b'))
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'void',
        prefix: true,
        argument: {
          type: 'MemberExpression',
          object: makeThisExpr(),
          property: { type: 'Identifier', name: 'c' },
        },
        loc: makeLoc(1, 0, 1, 15),
      })
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'd'))
      visitor.UnaryExpression(makeDeleteNode({ type: 'Identifier', name: 'other' }, 'e'))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryDeleteRule.create(context)
      const visitor2 = noUnnecessaryDeleteRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryDeleteRule.meta
      const meta2 = noUnnecessaryDeleteRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      const node = {
        type: 'UnaryExpression',
        operator: 'delete',
        prefix: true,
        argument: {
          type: 'MemberExpression',
          object: makeThisExpr(),
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: makeLoc(1, 0, 1, 10),
        range: [0, 10],
        extra: true,
        trailingComments: [],
      }
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'delete',
        prefix: true,
        argument: {
          type: 'MemberExpression',
          object: makeThisExpr(),
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'delete',
        prefix: true,
        argument: {
          type: 'MemberExpression',
          object: makeThisExpr(),
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      const node = makeDeleteNode(makeThisExpr(), 'prop')
      visitor.UnaryExpression(node)
      visitor.UnaryExpression(node)
      visitor.UnaryExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryDeleteRule).toBeDefined()
      expect(typeof noUnnecessaryDeleteRule.create).toBe('function')
      expect(typeof noUnnecessaryDeleteRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'delete',
        prefix: true,
        argument: {
          type: 'MemberExpression',
          object: makeThisExpr(),
          property: { type: 'Identifier', name: 'prop' },
        },
        loc: makeLoc(1, 0, 1, 10),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'prop', false, 10, 4, 10, 25))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(25)
    })

    test('handles computed member expression with ThisExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression({
        type: 'UnaryExpression',
        operator: 'delete',
        prefix: true,
        argument: {
          type: 'MemberExpression',
          object: makeThisExpr(),
          property: { type: 'Identifier', name: 'prop' },
          computed: true,
        },
        loc: makeLoc(1, 0, 1, 10),
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'a'))
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), 'b'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles delete this[key] with string template key', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryDeleteRule.create(context)
      visitor.UnaryExpression(makeDeleteNode(makeThisExpr(), { type: 'TemplateLiteral', quasis: [{ type: 'TemplateElement', value: { raw: 'prefix_', cooked: 'prefix_' } }], expressions: [{ type: 'Identifier', name: 'id' }] }, true))
      expect(reports.length).toBe(1)
      expect(reports[0].message).toBe(
        'Unnecessary delete on this. Set the property to undefined instead.',
      )
    })
  })
})

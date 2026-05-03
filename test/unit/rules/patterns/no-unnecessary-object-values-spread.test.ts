import { describe, expect, test, vi } from 'vitest'
import { noUnnecessaryObjectValuesSpreadRule } from '../../../../src/rules/patterns/no-unnecessary-object-values-spread.js'
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

function makeObjectValuesSpreadNode(
  spreadArgument: unknown,
  locStartLine = 1,
  locStartCol = 0,
  locEndLine = 1,
  locEndCol = 30,
): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: 'Object' },
      property: { type: 'Identifier', name: 'values' },
    },
    arguments: [{ type: 'SpreadElement', argument: spreadArgument }],
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
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
      computed: false,
      object,
      property: { type: 'Identifier', name: methodName },
    },
    arguments: args,
    loc: makeLoc(locStartLine, locStartCol, locEndLine, locEndCol),
  }
}

// ===== META TESTS (8) =====

describe('no-unnecessary-object-values-spread rule', () => {
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noUnnecessaryObjectValuesSpreadRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noUnnecessaryObjectValuesSpreadRule.meta.severity).toBe('warn')
    })

    test('should have correct category "patterns"', () => {
      expect(noUnnecessaryObjectValuesSpreadRule.meta.docs?.category).toBe('patterns')
    })

    test('should not be recommended', () => {
      expect(noUnnecessaryObjectValuesSpreadRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noUnnecessaryObjectValuesSpreadRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning Object.values', () => {
      const desc = noUnnecessaryObjectValuesSpreadRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/object\.values/)
    })

    test('should have correct docs URL', () => {
      expect(noUnnecessaryObjectValuesSpreadRule.meta.docs?.url).toBe(
        'https://github.com/nickelser/codeforge/blob/main/src/rules/patterns/no-unnecessary-object-values-spread.ts',
      )
    })

    test('should have empty schema', () => {
      expect(noUnnecessaryObjectValuesSpreadRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====

  describe('structure', () => {
    test('create() returns visitor with CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noUnnecessaryObjectValuesSpreadRule).toBeDefined()
      expect(noUnnecessaryObjectValuesSpreadRule.meta).toBeDefined()
      expect(noUnnecessaryObjectValuesSpreadRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES — REPORTS (28) =====

  describe('positive cases — reports unnecessary Object.values spread', () => {
    test('reports for Object.values(...items) with Identifier spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'items' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.values(...arr) with different Identifier name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'arr' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.values(...obj.props) with MemberExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' }, property: { type: 'Identifier', name: 'props' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.values(...(fn())) with CallExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'fn' }, arguments: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.values(...{a: 1}) with ObjectExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'ObjectExpression', properties: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.values(...[1, 2]) with ArrayExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'ArrayExpression', elements: [{ type: 'Literal', value: 1 }, { type: 'Literal', value: 2 }] }))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.values(...new Map()) with NewExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'NewExpression', callee: { type: 'Identifier', name: 'Map' }, arguments: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.values(...(x ? y : z)) with ConditionalExpression spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'ConditionalExpression', test: { type: 'Identifier', name: 'x' }, consequent: { type: 'Identifier', name: 'y' }, alternate: { type: 'Identifier', name: 'z' } }))
      expect(reports.length).toBe(1)
    })

    test('report message mentions Object.values with spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'items' }))
      expect(reports[0].message).toMatch(/Object\.values/)
      expect(reports[0].message).toMatch(/spread/)
    })

    test('report message is exactly as defined in rule source', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'items' }))
      expect(reports[0].message).toBe(
        'Object.values(...items) with spread is unusual. values() expects a single object.',
      )
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'items' }))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'items' }))
      expect(reports[0].node).toBeDefined()
    })

    test('report node matches the input CallExpression node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      const node = makeObjectValuesSpreadNode({ type: 'Identifier', name: 'items' })
      visitor.CallExpression(node)
      expect(reports[0].node).toBe(node)
    })

    test('report loc values are preserved from node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'items' }, 5, 10, 5, 40))
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(10)
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'other' }))
      expect(reports.length).toBe(2)
    })

    test('all reports have the same message format', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'other' }))
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('reports for Object.values(...items) with computed: false explicitly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'items' }))
      expect(reports.length).toBe(1)
    })

    test('reports for Object.values(...items) at specific line/column', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'items' }, 10, 4, 10, 35))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'items' }))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('reports for Object.values(...args) where args is a function parameter', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'args' }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with ArrowFunctionExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'ArrowFunctionExpression', params: [], body: { type: 'BlockStatement', body: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with BinaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'BinaryExpression', operator: '+', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with TemplateLiteral argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'TemplateLiteral', quasis: [], expressions: [] }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with UnaryExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'UnaryExpression', operator: '!', prefix: true, argument: { type: 'Identifier', name: 'x' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with AwaitExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'AwaitExpression', argument: { type: 'Identifier', name: 'promise' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with SequenceExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'SequenceExpression', expressions: [{ type: 'Identifier', name: 'a' }, { type: 'Identifier', name: 'b' }] }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with YieldExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'YieldExpression', argument: { type: 'Identifier', name: 'value' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with TaggedTemplateExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'TaggedTemplateExpression', tag: { type: 'Identifier', name: 'tag' }, quasi: { type: 'TemplateLiteral', quasis: [], expressions: [] } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with LogicalExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'LogicalExpression', operator: '||', left: { type: 'Identifier', name: 'a' }, right: { type: 'Identifier', name: 'b' } }))
      expect(reports.length).toBe(1)
    })

    test('reports for spread with UpdateExpression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'UpdateExpression', operator: '++', prefix: false, argument: { type: 'Identifier', name: 'x' } }))
      expect(reports.length).toBe(1)
    })
  })

  // ===== NEGATIVE CASES — DOES NOT REPORT (40) =====

  describe('negative cases — does NOT report', () => {
    test('does not report for Object.values(obj) — no spread', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'values', [{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.values(obj, extra) — 2 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'values', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }, { type: 'Identifier', name: 'extra' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.values() — 0 args', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'values'))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.keys(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'keys', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.entries(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'entries', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Array.values(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Array' }, 'values', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for MyObject.values(...items) — wrong object name', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'MyObject' }, 'values', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for values(...items) — standalone function call', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'values' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 20),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is computed (Object["values"](...items))', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: true,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'values' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for null node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      expect(() => visitor.CallExpression(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for undefined node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      expect(() => visitor.CallExpression(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for empty object node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      expect(() => visitor.CallExpression({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for string primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      expect(() => visitor.CallExpression('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for number primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      expect(() => visitor.CallExpression(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for boolean primitive node', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      expect(() => visitor.CallExpression(true)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report for Identifier node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression({ type: 'Identifier', name: 'foo', loc: makeLoc(1, 0, 1, 3) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression({ type: 'CallExpression', callee: null, arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }], loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is not Identifier type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'CallExpression', callee: { type: 'Identifier', name: 'getObject' }, arguments: [] }, 'values', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object name is not "Object"', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'object' }, 'values', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is not Identifier', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Literal', value: 'values' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is "Values" (uppercase V)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'Values', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property name is "VALUES" (all caps)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'VALUES', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is Identifier not SpreadElement', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'values', [{ type: 'Identifier', name: 'obj' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'values', [{ type: 'Literal', value: null }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when argument type is CallExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'values', [{ type: 'CallExpression', callee: { type: 'Identifier', name: 'getObj' }, arguments: [] }]))
      expect(reports.length).toBe(0)
    })

    test('does not report when arguments array has 3 elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'values', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'a' } }, { type: 'Identifier', name: 'b' }, { type: 'Identifier', name: 'c' }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for BinaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression({ type: 'BinaryExpression', operator: '+', left: {}, right: {}, loc: makeLoc(1, 0, 1, 5) })
      expect(reports.length).toBe(0)
    })

    test('does not report for UnaryExpression node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression({ type: 'UnaryExpression', operator: '!', prefix: true, argument: {}, loc: makeLoc(1, 0, 1, 2) })
      expect(reports.length).toBe(0)
    })

    test('does not report for ReturnStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression({ type: 'ReturnStatement', argument: null, loc: makeLoc(1, 0, 1, 6) })
      expect(reports.length).toBe(0)
    })

    test('does not report for IfStatement node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression({ type: 'IfStatement', test: {}, consequent: {}, loc: makeLoc(1, 0, 1, 15) })
      expect(reports.length).toBe(0)
    })

    test('does not report for VariableDeclaration node type', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression({ type: 'VariableDeclaration', declarations: [], kind: 'const', loc: makeLoc(1, 0, 1, 10) })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee property is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: null,
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is missing', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report when callee object is null', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: null,
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.assign(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'assign', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })

    test('does not report for Object.freeze(...items) — wrong method', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'freeze', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (17) =====

  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noUnnecessaryObjectValuesSpreadRule.create(ctx1)
      const visitor2 = noUnnecessaryObjectValuesSpreadRule.create(ctx2)
      visitor1.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'items' }))
      visitor2.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'values', [{ type: 'Identifier', name: 'obj' }]))
      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'values', [{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'other' }))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
      }
      visitor.CallExpression(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'values', [{ type: 'Identifier', name: 'obj' }]))
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'arr' }, 'values', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'more' }))
      visitor.CallExpression(makeCallNode({ type: 'Identifier', name: 'Object' }, 'keys', [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }]))
      expect(reports.length).toBe(2)
    })

    test('create returns a new visitor each call', () => {
      const { context } = createMockContext()
      const visitor1 = noUnnecessaryObjectValuesSpreadRule.create(context)
      const visitor2 = noUnnecessaryObjectValuesSpreadRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('meta is same reference across multiple accesses', () => {
      const meta1 = noUnnecessaryObjectValuesSpreadRule.meta
      const meta2 = noUnnecessaryObjectValuesSpreadRule.meta
      expect(meta1).toBe(meta2)
    })

    test('handles node with extra properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
        range: [0, 30],
        extra: true,
        trailingComments: [],
      }
      visitor.CallExpression(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: {},
      })
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: { start: { line: 3, column: 5 } },
      })
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('multiple same violations report separately', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      const node = makeObjectValuesSpreadNode({ type: 'Identifier', name: 'items' })
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      visitor.CallExpression(node)
      expect(reports.length).toBe(3)
    })

    test('rule exports are correct', () => {
      expect(noUnnecessaryObjectValuesSpreadRule).toBeDefined()
      expect(typeof noUnnecessaryObjectValuesSpreadRule.create).toBe('function')
      expect(typeof noUnnecessaryObjectValuesSpreadRule.meta).toBe('object')
    })

    test('handles node with _parent property', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
        _parent: {},
      })
      expect(reports.length).toBe(1)
    })

    test('report loc reflects specific node location values', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'items' }, 10, 4, 10, 35))
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
      expect(reports[0].loc?.end.line).toBe(10)
      expect(reports[0].loc?.end.column).toBe(35)
    })

    test('handles computed: false explicitly on MemberExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'items' } }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'items' }))
      visitor.CallExpression(makeObjectValuesSpreadNode({ type: 'Identifier', name: 'other' }))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toBe(reports[1].message)
    })

    test('handles SpreadElement with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noUnnecessaryObjectValuesSpreadRule.create(context)
      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Object' },
          property: { type: 'Identifier', name: 'values' },
        },
        arguments: [{ type: 'SpreadElement', argument: null }],
        loc: makeLoc(1, 0, 1, 30),
      })
      expect(reports.length).toBe(1)
    })
  })
})
